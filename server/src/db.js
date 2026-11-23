import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      channel TEXT NOT NULL DEFAULT 'email',
      credential TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT '',
      profession TEXT NOT NULL DEFAULT 'Member',
      bio TEXT NOT NULL DEFAULT '',
      interests JSONB NOT NULL DEFAULT '[]'::jsonb,
      photo TEXT NOT NULL DEFAULT '',
      first10k BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      person_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, person_id)
    );

    CREATE TABLE IF NOT EXISTS intro_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'ask_bridge',
      from_name TEXT NOT NULL,
      from_id TEXT,
      to_name TEXT NOT NULL,
      to_id TEXT NOT NULL,
      bridge_name TEXT NOT NULL DEFAULT '',
      bridge_id TEXT,
      reason TEXT NOT NULL DEFAULT '',
      mutual TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      channel_revealed BOOLEAN NOT NULL DEFAULT FALSE,
      target_confidential BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE intro_requests ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'ask_bridge';
    ALTER TABLE intro_requests ADD COLUMN IF NOT EXISTS from_id TEXT;
    ALTER TABLE intro_requests ADD COLUMN IF NOT EXISTS bridge_name TEXT NOT NULL DEFAULT '';
    ALTER TABLE intro_requests ADD COLUMN IF NOT EXISTS bridge_id TEXT;
    ALTER TABLE intro_requests ADD COLUMN IF NOT EXISTS channel_revealed BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE intro_requests ADD COLUMN IF NOT EXISTS target_confidential BOOLEAN NOT NULL DEFAULT FALSE;

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      time_label TEXT NOT NULL DEFAULT 'Just now',
      person_id TEXT,
      unread BOOLEAN NOT NULL DEFAULT TRUE,
      action TEXT,
      ask_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      token TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      path TEXT NOT NULL DEFAULT '',
      visitor_id TEXT NOT NULL DEFAULT '',
      user_id TEXT,
      meta JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS intros_user_idx ON intro_requests(user_id);
    CREATE INDEX IF NOT EXISTS analytics_type_idx ON analytics_events(type);
    CREATE INDEX IF NOT EXISTS analytics_created_idx ON analytics_events(created_at DESC);
    CREATE INDEX IF NOT EXISTS analytics_visitor_idx ON analytics_events(visitor_id);
  `);
}
