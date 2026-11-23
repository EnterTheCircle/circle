import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { api, apiEnabled } from '@/lib/api';
import { getApiToken } from '@/lib/circleAuth';
import { useApp } from '@/context/AppContext';

type StatsPayload = {
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
};

function fmtDay(iso: string) {
  const d = iso.slice(5); // MM-DD
  return d;
}

function fmtWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function FounderStatsPage() {
  const router = useRouter();
  const { isAppFounder } = useApp();
  const [data, setData] = useState<StatsPayload | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    if (!apiEnabled) {
      setError('API not configured. Deploy circle-api and set EXPO_PUBLIC_API_URL.');
      setLoading(false);
      return;
    }
    const token = await getApiToken();
    if (!token) {
      setError('Sign in as Founder to view stats.');
      setLoading(false);
      return;
    }
    const res = await api.founderStats(token);
    if (!res.ok) {
      setError(res.error);
      setData(null);
    } else {
      setData(res);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAppFounder) {
      router.replace('/');
      return;
    }
    void load();
  }, [isAppFounder, load, router]);

  if (!isAppFounder) return null;

  const maxBar = Math.max(
    1,
    ...(data?.last14Days.map((d) => Math.max(d.visits, d.signups, d.connects)) || [1])
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>FOUNDER</Text>
          <Text style={styles.title}>Stats</Text>
          <Text style={styles.sub}>Visits, signups, and connects across Circle.</Text>
        </View>
        <Pressable onPress={() => void load()} style={styles.refresh}>
          <Text style={styles.refreshTxt}>Refresh</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : data ? (
        <>
          <Text style={styles.section}>Today</Text>
          <View style={styles.row}>
            <Stat label="Visits" value={data.today.visits} />
            <Stat label="Signups" value={data.today.signups} />
            <Stat label="Connects" value={data.today.connects} />
          </View>

          <Text style={styles.section}>All time</Text>
          <View style={styles.row}>
            <Stat label="Visits" value={data.totals.visits} />
            <Stat label="Uniques" value={data.totals.uniqueVisitors} />
            <Stat label="Signups" value={data.totals.signups} />
          </View>
          <View style={[styles.row, { marginTop: 10 }]}>
            <Stat label="Connects" value={data.totals.connects} />
            <Stat label="Connect asks" value={data.totals.connectAsks} />
            <View style={{ flex: 1 }} />
          </View>

          <Text style={styles.section}>Last 14 days</Text>
          <View style={styles.chart}>
            {data.last14Days.map((d) => (
              <View key={d.day} style={styles.barCol}>
                <View style={styles.barStack}>
                  <View
                    style={[
                      styles.bar,
                      styles.barVisit,
                      { height: Math.max(2, (d.visits / maxBar) * 72) },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      styles.barSignup,
                      { height: Math.max(d.signups ? 2 : 0, (d.signups / maxBar) * 72) },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      styles.barConnect,
                      { height: Math.max(d.connects ? 2 : 0, (d.connects / maxBar) * 72) },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{fmtDay(d.day)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <Text style={styles.legendItem}>
              <Text style={{ color: Colors.textMuted }}>■ </Text>Visits
            </Text>
            <Text style={styles.legendItem}>
              <Text style={{ color: Colors.accent }}>■ </Text>Signups
            </Text>
            <Text style={styles.legendItem}>
              <Text style={{ color: Colors.cyan }}>■ </Text>Connects
            </Text>
          </View>

          <Text style={styles.section}>Top pages</Text>
          {data.topPaths.length === 0 ? (
            <Text style={styles.empty}>No visits yet.</Text>
          ) : (
            data.topPaths.map((p) => (
              <View key={p.path} style={styles.listRow}>
                <Text style={styles.listMain}>{p.path || '/'}</Text>
                <Text style={styles.listMeta}>{p.n}</Text>
              </View>
            ))
          )}

          <Text style={styles.section}>Recent signups</Text>
          {data.recentSignups.length === 0 ? (
            <Text style={styles.empty}>No signups yet.</Text>
          ) : (
            data.recentSignups.map((u) => (
              <View key={`${u.username}-${u.createdAt}`} style={styles.listRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.listMain} numberOfLines={1}>
                    {u.name} · @{u.username}
                  </Text>
                  <Text style={styles.listSub} numberOfLines={1}>
                    {u.location || '—'} · {fmtWhen(u.createdAt)}
                  </Text>
                </View>
              </View>
            ))
          )}

          <Text style={styles.section}>Recent connects</Text>
          {data.recentConnects.length === 0 ? (
            <Text style={styles.empty}>No connects tracked yet.</Text>
          ) : (
            data.recentConnects.map((c, i) => (
              <View key={`${c.createdAt}-${i}`} style={styles.listRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.listMain} numberOfLines={1}>
                    {(c.meta?.name as string) || 'Connection confirmed'}
                  </Text>
                  <Text style={styles.listSub}>{fmtWhen(c.createdAt)}</Text>
                </View>
              </View>
            ))
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.xl, paddingBottom: 80, maxWidth: 900, width: '100%', alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    gap: 16,
  },
  kicker: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: { color: Colors.text, fontSize: 32, fontWeight: '700', letterSpacing: -0.8 },
  sub: { color: Colors.textSecondary, marginTop: 6, fontSize: 14 },
  refresh: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radii.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  refreshTxt: { color: Colors.text, fontWeight: '600', fontSize: 13 },
  error: { color: Colors.danger, marginTop: 20 },
  section: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 1.4,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  statValue: { color: Colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.6 },
  statLabel: { color: Colors.textMuted, marginTop: 4, fontSize: 12 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    minHeight: 100,
    paddingVertical: 8,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barStack: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 76 },
  bar: { width: 5, borderRadius: 2, minHeight: 0 },
  barVisit: { backgroundColor: 'rgba(255,255,255,0.28)' },
  barSignup: { backgroundColor: Colors.accent },
  barConnect: { backgroundColor: Colors.cyan },
  barLabel: { color: Colors.textMuted, fontSize: 9 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { color: Colors.textSecondary, fontSize: 12 },
  listRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listMain: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  listSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  listMeta: { color: Colors.textSecondary, fontWeight: '700' },
  empty: { color: Colors.textMuted, fontSize: 13 },
});
