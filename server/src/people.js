import { newId } from './auth.js';
import { query } from './db.js';

const COLORS = ['#A78BFA', '#67E8F9', '#34D399', '#F9A8D4', '#FDBA74', '#93C5FD', '#C4B5FD', '#FDE68A'];

function colorFor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

function initials(name) {
  return (
    String(name || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??'
  );
}

export function rowToPerson(row, degree = 1, via) {
  const name = row.name || 'Member';
  const interests = Array.isArray(row.interests)
    ? row.interests
    : typeof row.interests === 'string'
      ? (() => {
          try {
            return JSON.parse(row.interests);
          } catch {
            return [];
          }
        })()
      : [];
  return {
    id: row.id,
    name,
    firstName: row.first_name || name.split(/\s+/)[0] || 'Member',
    profession: row.profession || 'Member',
    location: row.location || '',
    interests,
    bio: row.bio || '',
    degree,
    via: via || undefined,
    viaId: via ? 'founder' : undefined,
    verified: String(row.username || '').toLowerCase() === 'founder',
    color: colorFor(row.id),
    initials: initials(name),
    photo: row.photo || '',
    contactChannel: row.channel || 'email',
    contactHandle: row.credential || '',
    username: row.username,
  };
}

export async function findFounder() {
  const { rows } = await query(
    `SELECT id FROM users WHERE LOWER(username) = 'founder' LIMIT 1`
  );
  return rows[0] || null;
}

export async function linkUsers(a, b) {
  if (!a || !b || a === b) return;
  const id1 = newId('c');
  const id2 = newId('c');
  await query(
    `INSERT INTO connections (id, user_id, person_id) VALUES ($1,$2,$3)
     ON CONFLICT (user_id, person_id) DO NOTHING`,
    [id1, a, b]
  );
  await query(
    `INSERT INTO connections (id, user_id, person_id) VALUES ($1,$2,$3)
     ON CONFLICT (user_id, person_id) DO NOTHING`,
    [id2, b, a]
  );
}

/** Link every member to Founder (fixes signups that happened before linking existed). */
export async function backfillFounderConnections() {
  const founder = await findFounder();
  if (!founder) return { linked: 0 };
  const { rows } = await query(
    `SELECT id FROM users WHERE id <> $1 AND LOWER(username) <> 'founder'`,
    [founder.id]
  );
  for (const u of rows) {
    await linkUsers(founder.id, u.id);
  }
  return { linked: rows.length };
}

export async function networkForUser(userId, username) {
  const isFounder = String(username || '').toLowerCase() === 'founder';

  const first = await query(
    `SELECT u.id, u.username, u.name, u.first_name, u.last_name, u.channel, u.credential,
            COALESCE(p.location, '') AS location,
            COALESCE(p.profession, 'Member') AS profession,
            COALESCE(p.bio, '') AS bio,
            COALESCE(p.photo, '') AS photo,
            COALESCE(p.interests, '[]'::jsonb) AS interests
     FROM connections c
     JOIN users u ON u.id = c.person_id
     LEFT JOIN profiles p ON p.user_id = u.id
     WHERE c.user_id = $1
     ORDER BY u.created_at ASC`,
    [userId]
  );

  const firstPeople = first.rows.map((r) =>
    rowToPerson(r, 1, undefined)
  );

  let secondPeople = [];
  if (!isFounder) {
    const founder = await findFounder();
    if (founder) {
      const second = await query(
        `SELECT u.id, u.username, u.name, u.first_name, u.last_name, u.channel, u.credential,
                COALESCE(p.location, '') AS location,
                COALESCE(p.profession, 'Member') AS profession,
                COALESCE(p.bio, '') AS bio,
                COALESCE(p.photo, '') AS photo,
                COALESCE(p.interests, '[]'::jsonb) AS interests
         FROM connections c
         JOIN users u ON u.id = c.person_id
         LEFT JOIN profiles p ON p.user_id = u.id
         WHERE c.user_id = $1
           AND u.id <> $2
           AND LOWER(u.username) <> 'founder'
         ORDER BY u.created_at ASC`,
        [founder.id, userId]
      );
      secondPeople = second.rows.map((r) => rowToPerson(r, 2, 'Founder'));
    }
  }

  return { first: firstPeople, second: secondPeople };
}
