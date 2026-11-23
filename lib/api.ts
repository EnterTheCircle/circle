/**
 * Circle API client. When EXPO_PUBLIC_API_URL is set, auth/profile hit Render.
 * Without it, the app stays on local AsyncStorage (offline demo).
 */

const RAW = process.env.EXPO_PUBLIC_API_URL?.trim() || '';

function normalizeBase(url: string) {
  if (!url) return '';
  const withProto = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return withProto.replace(/\/$/, '');
}

export const API_BASE = normalizeBase(RAW);
export const apiEnabled = Boolean(API_BASE);

export type ApiResult<T> = { ok: true } & T | { ok: false; error: string };

async function request<T>(
  path: string,
  opts: RequestInit & { token?: string } = {}
): Promise<ApiResult<T>> {
  if (!API_BASE) return { ok: false, error: 'API not configured' };
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(opts.headers as Record<string, string> | undefined),
    };
    if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
    const res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      headers,
    });
    const data = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string };
    if (!res.ok || data.ok === false) {
      return { ok: false, error: data.error || `Request failed (${res.status})` };
    }
    return { ok: true, ...(data as T) };
  } catch {
    return { ok: false, error: 'Could not reach Circle servers. Check your connection.' };
  }
}

export const api = {
  signup: (body: Record<string, string>) =>
    request<{ token: string; user: Record<string, string> }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  signin: (body: { username: string; password: string }) =>
    request<{ token: string; user: Record<string, string> }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  signout: (token: string) =>
    request('/auth/signout', { method: 'POST', token }),
  me: (token: string) =>
    request<{ user: Record<string, string>; profile: Record<string, unknown> | null }>('/me', {
      token,
    }),
  updateProfile: (token: string, body: Record<string, unknown>) =>
    request<{ profile: Record<string, unknown> }>('/me/profile', {
      method: 'PUT',
      token,
      body: JSON.stringify(body),
    }),
  forgot: (email: string) =>
    request<{ message: string; demoToken?: string }>('/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  reset: (token: string, password: string) =>
    request('/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
  track: (
    body: { type: string; path?: string; visitorId?: string; meta?: Record<string, unknown> },
    token?: string
  ) =>
    request('/analytics/track', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),
  founderStats: (token: string) =>
    request<{
      totals: {
        visits: number;
        uniqueVisitors: number;
        signups: number;
        connects: number;
        connectAsks: number;
      };
      today: { visits: number; signups: number; connects: number };
      last14Days: { day: string; visits: number; signups: number; connects: number }[];
      topPaths: { path: string; n: number }[];
      recentSignups: { name: string; username: string; location: string; createdAt: string }[];
      recentConnects: {
        createdAt: string;
        path: string;
        meta: Record<string, unknown>;
        visitorId: string;
      }[];
    }>('/founder/stats', { token }),
  network: (token: string) =>
    request<{
      first: import('@/constants/mockData').Person[];
      second: import('@/constants/mockData').Person[];
    }>('/me/network', { token }),
  notifications: (token: string) =>
    request<{
      notifications: {
        id: string;
        title: string;
        body: string;
        time_label?: string;
        person_id?: string;
        unread?: boolean;
        action?: string;
      }[];
    }>('/me/notifications', { token }),
};
