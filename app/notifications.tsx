import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppNotification, getPerson, isConfidential } from '@/constants/mockData';
import { Colors, Radii } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { api, apiEnabled } from '@/lib/api';
import { getApiToken } from '@/lib/circleAuth';

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    markNotificationsRead,
    requestIntro,
    profile,
    isAppFounder,
    demoMode,
    refreshNetwork,
  } = useApp();
  const [remote, setRemote] = useState<AppNotification[]>([]);

  useEffect(() => {
    markNotificationsRead();
  }, [markNotificationsRead]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!apiEnabled || demoMode) return;
      const token = await getApiToken();
      if (!token) return;
      const res = await api.notifications(token);
      if (!res.ok || cancelled) return;
      setRemote(
        (res.notifications || []).map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          time: n.time_label || 'Recently',
          personId: n.person_id,
          unread: !!n.unread,
          action: n.action === 'connect' ? ('connect' as const) : undefined,
        }))
      );
      void refreshNetwork();
    })();
    return () => {
      cancelled = true;
    };
  }, [demoMode, refreshNetwork]);

  const items = [...remote, ...notifications];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Updates</Text>
      <Text style={styles.title}>{isAppFounder ? 'Your circle' : 'Updates'}</Text>
      <Text style={styles.intro}>
        {isAppFounder
          ? 'New members and connection activity in your circle.'
          : demoMode
            ? 'Sample updates for the demo circle.'
            : 'Connection asks and notes from people in your circle.'}
      </Text>

      {items.length === 0 ? (
        <Text style={styles.empty}>No updates yet.</Text>
      ) : (
        items.map((n) => {
          const person = n.personId ? getPerson(n.personId) : undefined;
          const hidden = person ? isConfidential(person) : false;
          return (
            <View key={n.id} style={styles.row}>
              <View style={styles.mark}>
                <Text style={styles.markTxt}>{hidden ? '?' : '•'}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {hidden ? person?.profession : n.title}
                </Text>
                <Text style={styles.rowBody} numberOfLines={2}>
                  {hidden
                    ? `Confidential${person?.location ? ` · ${person.location}` : ''}`
                    : n.body}
                </Text>
              </View>
              {n.action === 'connect' ? (
                <Pressable onPress={() => router.push('/connect')} style={styles.action}>
                  <Text style={styles.actionTxt}>Open</Text>
                </Pressable>
              ) : person && hidden ? (
                <Pressable
                  onPress={() => {
                    requestIntro(
                      person.id,
                      `${profile.name.split(' ')[0]} would like an introduction to a ${person.profession}${
                        person.location ? ` in ${person.location}` : ''
                      }.`
                    );
                    router.push('/introductions');
                  }}
                  style={styles.action}
                >
                  <Text style={styles.actionTxt}>Ask</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 48, gap: 10 },
  kicker: { color: Colors.textMuted, letterSpacing: 2, fontSize: 11, fontWeight: '700' },
  title: { color: Colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.6 },
  intro: { color: Colors.textSecondary, fontSize: 14, marginBottom: 8, lineHeight: 20 },
  empty: { color: Colors.textMuted, marginTop: 24 },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  mark: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markTxt: { color: Colors.textMuted, fontWeight: '700' },
  rowTitle: { color: Colors.text, fontWeight: '700', fontSize: 14 },
  rowBody: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  action: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionTxt: { color: Colors.text, fontSize: 12, fontWeight: '600' },
});
