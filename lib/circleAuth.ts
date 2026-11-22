import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Client-side Circle auth (email + password).
 * Swap this module for Clerk/Supabase/Arcus-style API later without rewriting screens.
 * Password reset emails are simulated until you add an email provider.
 */

const USERS_KEY = 'circle.auth.users.v1';
const SESSION_KEY = 'circle.auth.session.v1';
const RESETS_KEY = 'circle.auth.resets.v1';

export type CircleChannel = 'whatsapp' | 'linkedin' | 'email' | 'imessage' | 'discord';

export type CircleUser = {
  id: string;
  email: string;
  name: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  channel?: CircleChannel;
  credential?: string;
  passwordHash: string;
  createdAt: string;
};

export type CircleSession = {
  userId: string;
  email: string;
  name: string;
  username?: string;
  channel?: CircleChannel;
  credential?: string;
};

type ResetRecord = { email: string; token: string; expiresAt: number };

function toHex(b: number) {
  return b.toString(16).padStart(2, '0');
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(toHex).join('');
  }
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  return `x${Math.abs(h)}`;
}

async function hashPassword(password: string, salt: string) {
  return sha256(`${salt}:${password}`);
}

async function loadUsers(): Promise<CircleUser[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as CircleUser[]) : [];
  } catch {
    return [];
  }
}

async function saveUsers(users: CircleUser[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function getSession(): Promise<CircleSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as CircleSession) : null;
  } catch {
    return null;
  }
}

async function setSession(session: CircleSession | null) {
  if (session) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else await AsyncStorage.removeItem(SESSION_KEY);
}

function checkCredential(channel: CircleChannel, raw: string): string | null {
  const value = raw.trim();
  if (channel === 'linkedin') {
    if (!/^https?:\/\/.+/i.test(value) && !/linkedin\.com\//i.test(value)) {
      return 'Paste a LinkedIn profile link.';
    }
    return null;
  }
  if (channel === 'whatsapp' || channel === 'imessage') {
    if (value.replace(/[^\d]/g, '').length < 8) return 'Enter a phone number.';
    return null;
  }
  if (channel === 'email') {
    if (!value.includes('@') || value.length < 5) return 'Enter the email they should use.';
    return null;
  }
  if (value.replace(/^@/, '').length < 2) return 'Enter a Discord username.';
  return null;
}

export async function signUp(input: {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  channel: CircleChannel;
  credential: string;
}): Promise<{ ok: true; session: CircleSession } | { ok: false; error: string }> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const username = input.username.trim().toLowerCase().replace(/^@/, '');
  const password = input.password;
  const channel = input.channel;
  const credential = input.credential.trim();
  const name = `${firstName} ${lastName}`.trim();

  if (firstName.length < 1 || lastName.length < 1) return { ok: false, error: 'Enter your first and last name.' };
  if (!/^[a-z0-9._]{3,20}$/.test(username)) {
    return { ok: false, error: 'Username is 3–20 letters, numbers, dots, or underscores.' };
  }
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
  const credentialError = checkCredential(channel, credential);
  if (credentialError) return { ok: false, error: credentialError };

  const users = await loadUsers();
  if (users.some((u) => (u.username || '').toLowerCase() === username || u.email === username)) {
    return { ok: false, error: 'That username is taken.' };
  }

  const id = `u_${Date.now().toString(36)}`;
  const passwordHash = await hashPassword(password, id);
  const email = channel === 'email' ? credential.toLowerCase() : `${username}@circle.local`;
  const user: CircleUser = {
    id,
    email,
    name,
    username,
    firstName,
    lastName,
    channel,
    credential,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await saveUsers(users);
  const session: CircleSession = { userId: id, email, name, username, channel, credential };
  await setSession(session);
  return { ok: true, session };
}

export async function signIn(input: {
  username: string;
  password: string;
}): Promise<{ ok: true; session: CircleSession } | { ok: false; error: string }> {
  const key = input.username.trim().toLowerCase().replace(/^@/, '');
  const users = await loadUsers();
  const user = users.find(
    (u) => (u.username || '').toLowerCase() === key || u.email.toLowerCase() === key
  );
  if (!user) return { ok: false, error: 'Incorrect username or password.' };
  const hash = await hashPassword(input.password, user.id);
  if (hash !== user.passwordHash) return { ok: false, error: 'Incorrect username or password.' };
  const session: CircleSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    channel: user.channel,
    credential: user.credential,
  };
  await setSession(session);
  return { ok: true, session };
}

export async function signOut() {
  await setSession(null);
}

export async function requestPasswordReset(
  emailRaw: string
): Promise<{ ok: true; message: string; demoToken?: string } | { ok: false; error: string }> {
  const email = emailRaw.trim().toLowerCase();
  if (!email.includes('@')) return { ok: false, error: 'Enter a valid email.' };

  const users = await loadUsers();
  const user = users.find((u) => u.email === email);
  // Same message whether or not the account exists (don’t leak)
  const message =
    'If that email has a Circle account, a reset link is ready. It expires in one hour.';

  if (!user) return { ok: true, message };

  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  let resets: ResetRecord[] = [];
  try {
    const raw = await AsyncStorage.getItem(RESETS_KEY);
    resets = raw ? (JSON.parse(raw) as ResetRecord[]) : [];
  } catch {
    resets = [];
  }
  resets = resets.filter((r) => r.expiresAt > Date.now() && r.email !== email);
  resets.push({ email, token, expiresAt: Date.now() + 60 * 60 * 1000 });
  await AsyncStorage.setItem(RESETS_KEY, JSON.stringify(resets));

  // Until SMTP/Clerk is connected, surface token in-app for the demo reset screen
  return { ok: true, message, demoToken: token };
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
  let resets: ResetRecord[] = [];
  try {
    const raw = await AsyncStorage.getItem(RESETS_KEY);
    resets = raw ? (JSON.parse(raw) as ResetRecord[]) : [];
  } catch {
    resets = [];
  }
  const hit = resets.find((r) => r.token === input.token && r.expiresAt > Date.now());
  if (!hit) return { ok: false, error: 'Reset link is invalid or expired.' };

  const users = await loadUsers();
  const idx = users.findIndex((u) => u.email === hit.email);
  if (idx < 0) return { ok: false, error: 'Reset link is invalid or expired.' };

  users[idx] = {
    ...users[idx],
    passwordHash: await hashPassword(input.password, users[idx].id),
  };
  await saveUsers(users);
  await AsyncStorage.setItem(
    RESETS_KEY,
    JSON.stringify(resets.filter((r) => r.token !== input.token))
  );
  return { ok: true };
}
