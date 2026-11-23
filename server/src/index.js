import express from 'express';
import cors from 'cors';
import { migrate, query } from './db.js';
import {
  createSession,
  hashPassword,
  newId,
  newToken,
  publicUser,
  userFromAuth,
} from './auth.js';
import {
  backfillFounderConnections,
  findFounder,
  linkUsers,
  networkForUser,
} from './people.js';

const app = express();
const PORT = process.env.PORT || 10000;
const ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(
  cors({
    origin: ORIGIN === '*' ? true : ORIGIN.split(',').map((s) => s.trim()),
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'circle-api' });
});

async function requireFounder(req, res) {
  const user = await userFromAuth(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return null;
  }
  if (String(user.username || '').toLowerCase() !== 'founder') {
    res.status(403).json({ ok: false, error: 'Founder only.' });
    return null;
  }
  return user;
}

async function recordEvent({ type, path = '', visitorId = '', userId = null, meta = {} }) {
  const id = newId('ev');
  await query(
    `INSERT INTO analytics_events (id, type, path, visitor_id, user_id, meta)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, type, path.slice(0, 200), String(visitorId || '').slice(0, 80), userId, JSON.stringify(meta)]
  );
  return id;
}

/** Public: page visits + client-reported connects (no secrets). */
app.post('/analytics/track', async (req, res) => {
  try {
    const type = String(req.body.type || '').trim();
    const allowed = new Set(['visit', 'connect', 'connect_ask']);
    if (!allowed.has(type)) {
      return res.status(400).json({ ok: false, error: 'Unknown event type.' });
    }
    const path = String(req.body.path || '/');
    const visitorId = String(req.body.visitorId || '');
    const meta = typeof req.body.meta === 'object' && req.body.meta ? req.body.meta : {};
    const user = await userFromAuth(req);
    await recordEvent({
      type,
      path,
      visitorId,
      userId: user?.id || null,
      meta,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Track failed.' });
  }
});

/** Founder-only funnel stats. */
app.get('/founder/stats', async (req, res) => {
  try {
    const founder = await requireFounder(req, res);
    if (!founder) return;

    const [visits, uniques, signups, connects, asks, byDay, topPaths, recentUsers, recentConnects] =
      await Promise.all([
        query(`SELECT COUNT(*)::int AS n FROM analytics_events WHERE type = 'visit'`),
        query(
          `SELECT COUNT(DISTINCT visitor_id)::int AS n FROM analytics_events WHERE type = 'visit' AND visitor_id <> ''`
        ),
        query(`SELECT COUNT(*)::int AS n FROM users WHERE LOWER(username) <> 'founder'`),
        query(`SELECT COUNT(*)::int AS n FROM analytics_events WHERE type = 'connect'`),
        query(`SELECT COUNT(*)::int AS n FROM analytics_events WHERE type = 'connect_ask'`),
        query(
          `SELECT to_char(day, 'YYYY-MM-DD') AS day,
                  COALESCE(SUM(CASE WHEN type = 'visit' THEN 1 ELSE 0 END), 0)::int AS visits,
                  COALESCE(SUM(CASE WHEN type = 'signup' THEN 1 ELSE 0 END), 0)::int AS signups,
                  COALESCE(SUM(CASE WHEN type = 'connect' THEN 1 ELSE 0 END), 0)::int AS connects
           FROM (
             SELECT date_trunc('day', created_at) AS day, type
             FROM analytics_events
             WHERE created_at > NOW() - INTERVAL '14 days'
             UNION ALL
             SELECT date_trunc('day', created_at), 'signup'
             FROM users
             WHERE LOWER(username) <> 'founder' AND created_at > NOW() - INTERVAL '14 days'
           ) t
           GROUP BY day
           ORDER BY day ASC`
        ),
        query(
          `SELECT path, COUNT(*)::int AS n
           FROM analytics_events
           WHERE type = 'visit' AND path <> ''
           GROUP BY path
           ORDER BY n DESC
           LIMIT 8`
        ),
        query(
          `SELECT u.name, u.username, u.created_at, COALESCE(p.location, '') AS location
           FROM users u
           LEFT JOIN profiles p ON p.user_id = u.id
           WHERE LOWER(u.username) <> 'founder'
           ORDER BY u.created_at DESC
           LIMIT 20`
        ),
        query(
          `SELECT created_at, path, meta, visitor_id
           FROM analytics_events
           WHERE type = 'connect'
           ORDER BY created_at DESC
           LIMIT 20`
        ),
      ]);

    const today = await query(
      `SELECT
         (SELECT COUNT(*)::int FROM analytics_events WHERE type = 'visit' AND created_at::date = CURRENT_DATE) AS visits,
         (SELECT COUNT(*)::int FROM users WHERE LOWER(username) <> 'founder' AND created_at::date = CURRENT_DATE) AS signups,
         (SELECT COUNT(*)::int FROM analytics_events WHERE type = 'connect' AND created_at::date = CURRENT_DATE) AS connects`
    );

    res.json({
      ok: true,
      totals: {
        visits: visits.rows[0].n,
        uniqueVisitors: uniques.rows[0].n,
        signups: signups.rows[0].n,
        connects: connects.rows[0].n,
        connectAsks: asks.rows[0].n,
      },
      today: today.rows[0],
      last14Days: byDay.rows,
      topPaths: topPaths.rows,
      recentSignups: recentUsers.rows.map((r) => ({
        name: r.name,
        username: r.username,
        location: r.location,
        createdAt: r.created_at,
      })),
      recentConnects: recentConnects.rows.map((r) => ({
        createdAt: r.created_at,
        path: r.path,
        meta: r.meta,
        visitorId: r.visitor_id,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Stats failed.' });
  }
});

app.post('/auth/signup', async (req, res) => {
  try {
    const firstName = String(req.body.firstName || '').trim();
    const lastName = String(req.body.lastName || '').trim();
    const username = String(req.body.username || '')
      .trim()
      .toLowerCase()
      .replace(/^@/, '');
    const password = String(req.body.password || '');
    const channel = String(req.body.channel || 'email');
    const credential = String(req.body.credential || '').trim();
    const location = String(req.body.location || '').trim();
    const name = `${firstName} ${lastName}`.trim();

    if (firstName.length < 1 || lastName.length < 1) {
      return res.status(400).json({ ok: false, error: 'Enter your first and last name.' });
    }
    if (!/^[a-z0-9._]{3,20}$/.test(username)) {
      return res.status(400).json({
        ok: false,
        error: 'Username is 3–20 letters, numbers, dots, or underscores.',
      });
    }
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters.' });
    }
    if (location.length < 2) {
      return res.status(400).json({ ok: false, error: 'Enter your city.' });
    }

    const exists = await query(
      `SELECT id FROM users WHERE username = $1 OR email = $2 LIMIT 1`,
      [username, channel === 'email' ? credential.toLowerCase() : `${username}@circle.local`]
    );
    if (exists.rows.length) {
      return res.status(400).json({ ok: false, error: 'That username is taken.' });
    }

    const id = newId('u');
    const email = channel === 'email' ? credential.toLowerCase() : `${username}@circle.local`;
    const passwordHash = hashPassword(password, id);

    await query(
      `INSERT INTO users
        (id, email, username, name, first_name, last_name, channel, credential, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, email, username, name, firstName, lastName, channel, credential, passwordHash]
    );

    await query(
      `INSERT INTO profiles (user_id, name, location, profession, bio, interests, photo, first10k)
       VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)`,
      [
        id,
        name,
        location,
        username === 'founder' ? 'Founder of Circle' : 'Member',
        'Building meaningful connections in the real world. Your circle is your world.',
        JSON.stringify([]),
        username === 'founder' ? 'local:founder' : `local:${(Buffer.from(name).reduce((a, b) => a + b, 0) % 8) + 1}`,
      ]
    );

    const token = await createSession(id);
    const user = publicUser({
      id,
      email,
      username,
      name,
      first_name: firstName,
      last_name: lastName,
      channel,
      credential,
    });
    try {
      await recordEvent({
        type: 'signup',
        path: '/signup',
        visitorId: String(req.body.visitorId || ''),
        userId: id,
        meta: { username, location, channel },
      });
    } catch {
      /* analytics must not block signup */
    }

    // Every real member starts connected to the Founder.
    if (username !== 'founder') {
      try {
        const founder = await findFounder();
        if (founder) {
          await linkUsers(founder.id, id);
          await query(
            `INSERT INTO notifications
              (id, user_id, title, body, time_label, person_id, unread, action)
             VALUES ($1,$2,$3,$4,'Just now',$5,TRUE,'connect')`,
            [
              newId('n'),
              founder.id,
              'New member',
              `${name} (@${username}) joined Circle${location ? ` · ${location}` : ''}.`,
              id,
            ]
          );
        }
      } catch (linkErr) {
        console.error('founder link failed', linkErr);
      }
    }

    res.json({ ok: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Signup failed.' });
  }
});

app.post('/auth/signin', async (req, res) => {
  try {
    const key = String(req.body.username || '')
      .trim()
      .toLowerCase()
      .replace(/^@/, '');
    const password = String(req.body.password || '');
    const { rows } = await query(
      `SELECT * FROM users WHERE username = $1 OR email = $1 LIMIT 1`,
      [key]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ ok: false, error: 'Incorrect username or password.' });
    const hash = hashPassword(password, user.id);
    if (hash !== user.password_hash) {
      return res.status(401).json({ ok: false, error: 'Incorrect username or password.' });
    }
    const token = await createSession(user.id);
    res.json({ ok: true, token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Sign in failed.' });
  }
});

app.post('/auth/signout', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token) await query(`DELETE FROM sessions WHERE token = $1`, [token]);
  res.json({ ok: true });
});

app.get('/me', async (req, res) => {
  const user = await userFromAuth(req);
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const profile = await query(`SELECT * FROM profiles WHERE user_id = $1`, [user.id]);
  res.json({ ok: true, user: publicUser(user), profile: profile.rows[0] || null });
});

app.get('/me/network', async (req, res) => {
  try {
    const user = await userFromAuth(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    // Heal any members who signed up before auto-link existed.
    await backfillFounderConnections();
    const network = await networkForUser(user.id, user.username);
    res.json({ ok: true, ...network });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Network failed.' });
  }
});

app.put('/me/profile', async (req, res) => {
  const user = await userFromAuth(req);
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const name = String(req.body.name ?? user.name);
  const location = String(req.body.location ?? '');
  const profession = String(req.body.profession ?? 'Member');
  const bio = String(req.body.bio ?? '');
  const photo = String(req.body.photo ?? '');
  const interests = Array.isArray(req.body.interests) ? req.body.interests : [];
  await query(
    `UPDATE profiles
     SET name = $2, location = $3, profession = $4, bio = $5, photo = $6, interests = $7, updated_at = NOW()
     WHERE user_id = $1`,
    [user.id, name, location, profession, bio, photo, JSON.stringify(interests)]
  );
  const { rows } = await query(`SELECT * FROM profiles WHERE user_id = $1`, [user.id]);
  res.json({ ok: true, profile: rows[0] });
});

app.get('/me/notifications', async (req, res) => {
  const user = await userFromAuth(req);
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const { rows } = await query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [user.id]
  );
  res.json({ ok: true, notifications: rows });
});

app.post('/auth/forgot', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const message =
    'If that email has a Circle account, a reset link is ready. It expires in one hour.';
  if (!email.includes('@')) return res.status(400).json({ ok: false, error: 'Enter a valid email.' });
  const { rows } = await query(`SELECT id FROM users WHERE email = $1`, [email]);
  if (!rows.length) return res.json({ ok: true, message });
  const token = newToken();
  await query(`INSERT INTO password_resets (token, email, expires_at) VALUES ($1,$2,NOW() + INTERVAL '1 hour')`, [
    token,
    email,
  ]);
  // Until SMTP is connected, return the token for the current reset screen.
  res.json({ ok: true, message, demoToken: token });
});

app.post('/auth/reset', async (req, res) => {
  const token = String(req.body.token || '').trim();
  const password = String(req.body.password || '');
  if (password.length < 6) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters.' });
  }
  const { rows } = await query(
    `SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW()`,
    [token]
  );
  const reset = rows[0];
  if (!reset) return res.status(400).json({ ok: false, error: 'Reset code expired or invalid.' });
  const users = await query(`SELECT * FROM users WHERE email = $1`, [reset.email]);
  const user = users.rows[0];
  if (!user) return res.status(400).json({ ok: false, error: 'Account not found.' });
  await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [
    hashPassword(password, user.id),
    user.id,
  ]);
  await query(`DELETE FROM password_resets WHERE token = $1`, [token]);
  res.json({ ok: true });
});

async function boot() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  await migrate();
  try {
    const result = await backfillFounderConnections();
    console.log(`founder links backfilled: ${result.linked}`);
  } catch (err) {
    console.error('backfill failed', err);
  }
  app.listen(PORT, () => {
    console.log(`circle-api listening on ${PORT}`);
  });
}

boot().catch((err) => {
  console.error(err);
  process.exit(1);
});
