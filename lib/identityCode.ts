import AsyncStorage from '@react-native-async-storage/async-storage';

/** Two-word identifiers. A server will reserve each pair so no two people share one. */
const ADJ = [
  'amber', 'brisk', 'calm', 'dawn', 'ember', 'flint', 'glow', 'haze', 'ivory', 'jade',
  'keen', 'lunar', 'mist', 'north', 'opal', 'pearl', 'quiet', 'rapid', 'solar', 'tide',
  'umbra', 'vivid', 'wild', 'young', 'azure', 'bold', 'clear', 'drift', 'equal', 'fair',
  'gentle', 'honest', 'inland', 'joyful', 'kind', 'lucid', 'maple', 'noble', 'open', 'prime',
  'quartz', 'royal', 'still', 'true', 'urban', 'velvet', 'warm', 'yellow', 'cedar', 'delta',
];

const NOUN = [
  'harbor', 'orbit', 'meadow', 'river', 'summit', 'lantern', 'bridge', 'garden', 'island', 'forest',
  'canyon', 'harbor', 'prairie', 'comet', 'anchor', 'beacon', 'circle', 'dawn', 'eagle', 'field',
  'grove', 'horizon', 'inlet', 'jasper', 'key', 'lake', 'maple', 'needle', 'oak', 'path',
  'quartz', 'ridge', 'shore', 'trail', 'valley', 'willow', 'yard', 'atlas', 'brook', 'cliff',
  'dune', 'ember', 'fern', 'gate', 'hill', 'iris', 'jetty', 'kite', 'ledge', 'moss',
];

const ID_KEY = 'circle.identity.id';
const REG_KEY = 'circle.word.registry.v1';

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pair(n: number) {
  const a = ADJ[n % ADJ.length];
  let b = NOUN[Math.floor(n / ADJ.length) % NOUN.length];
  if (b === a) b = NOUN[(NOUN.indexOf(b) + 3) % NOUN.length];
  return `${a} ${b}`;
}

export function normalizeWord(word: string) {
  return word.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function bucketOf(now = Date.now()) {
  return Math.floor(now / 30000);
}

export function secondsLeft(now = Date.now()) {
  return 30 - Math.floor((now % 30000) / 1000);
}

export function dayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

type Registry = Record<string, string>;

async function loadReg(): Promise<Registry> {
  try {
    const raw = await AsyncStorage.getItem(REG_KEY);
    return raw ? (JSON.parse(raw) as Registry) : {};
  } catch {
    return {};
  }
}

async function saveReg(reg: Registry) {
  const live = bucketOf();
  const day = dayKey();
  const next: Registry = {};
  for (const [key, owner] of Object.entries(reg)) {
    if (key.startsWith('day:')) {
      if (key.includes(day)) next[key] = owner;
    } else {
      const bucket = Number(key.split(':')[0]);
      if (bucket >= live - 1) next[key] = owner;
    }
  }
  await AsyncStorage.setItem(REG_KEY, JSON.stringify(next));
}

export async function getIdentityId() {
  const existing = await AsyncStorage.getItem(ID_KEY);
  if (existing) return existing;
  const id = `c_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`;
  await AsyncStorage.setItem(ID_KEY, id);
  return id;
}

/** Claim a live word. Salt bumps until this browser has not given that word to someone else. */
export async function claimLiveWord(userId: string, now = Date.now()) {
  const bucket = bucketOf(now);
  const reg = await loadReg();
  for (let salt = 0; salt < 40; salt++) {
    const word = pair(hash(`${userId}:live:${bucket}:${salt}`));
    const key = `${bucket}:${word}`;
    const owner = reg[key];
    if (!owner || owner === userId) {
      reg[key] = userId;
      await saveReg(reg);
      return { word, secondsLeft: secondsLeft(now), bucket };
    }
  }
  const word = pair(hash(`${userId}:live:${bucket}:fallback`));
  return { word, secondsLeft: secondsLeft(now), bucket };
}

export async function claimDailySlug(userId: string, now = new Date()) {
  const day = dayKey(now);
  const reg = await loadReg();
  for (let salt = 0; salt < 40; salt++) {
    const slug = pair(hash(`${userId}:day:${day}:${salt}`)).replace(/ /g, '-');
    const key = `day:${day}:${slug}`;
    const owner = reg[key];
    if (!owner || owner === userId) {
      reg[key] = userId;
      await saveReg(reg);
      return { slug, day };
    }
  }
  const slug = pair(hash(`${userId}:day:${day}:fallback`)).replace(/ /g, '-');
  return { slug, day };
}

export function joinUrl(slug: string) {
  return `https://enterthecircle.github.io/circle/join/${slug}`;
}
