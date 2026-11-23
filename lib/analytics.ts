import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, apiEnabled } from './api';
import { getApiToken } from './circleAuth';

const VISITOR_KEY = 'circle.analytics.vid.v1';
const SESSION_VISIT_KEY = 'circle.analytics.sessionVisit.v1';

function randomId() {
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getVisitorId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = randomId();
    await AsyncStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return randomId();
  }
}

/** Fire-and-forget page visit — once per browser/app session. */
export async function trackPageVisit(path = '/') {
  if (!apiEnabled) return;
  try {
    const already = await AsyncStorage.getItem(SESSION_VISIT_KEY);
    if (already === '1') {
      // Still record path changes lightly? Keep one session visit for unique bounce clarity.
      // Record additional path hits without unique inflation via separate events is fine for funnel.
    } else {
      await AsyncStorage.setItem(SESSION_VISIT_KEY, '1');
    }
    const visitorId = await getVisitorId();
    const token = (await getApiToken()) || undefined;
    await api.track({ type: 'visit', path, visitorId }, token);
  } catch {
    /* ignore */
  }
}

export async function trackConnect(meta: Record<string, string> = {}, path = '/connect') {
  if (!apiEnabled) return;
  try {
    const visitorId = await getVisitorId();
    const token = (await getApiToken()) || undefined;
    await api.track({ type: 'connect', path, visitorId, meta }, token);
  } catch {
    /* ignore */
  }
}

export async function trackConnectAsk(meta: Record<string, string> = {}) {
  if (!apiEnabled) return;
  try {
    const visitorId = await getVisitorId();
    const token = (await getApiToken()) || undefined;
    await api.track({ type: 'connect_ask', path: '/connect', visitorId, meta }, token);
  } catch {
    /* ignore */
  }
}
