import crypto from 'crypto';
import { query } from './db.js';

export function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

export function newToken() {
  return crypto.randomBytes(24).toString('hex');
}

export async function createSession(userId) {
  const token = newToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await query(
    `INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)`,
    [token, userId, expires.toISOString()]
  );
  return token;
}

export async function userFromAuth(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  const { rows } = await query(
    `SELECT u.*
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token]
  );
  return rows[0] || null;
}

export function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    name: row.name,
    firstName: row.first_name,
    lastName: row.last_name,
    channel: row.channel,
    credential: row.credential,
  };
}
