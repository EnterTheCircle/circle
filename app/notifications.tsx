import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getPerson, isConfidential } from '@/constants/mockData';
import { Colors, Radii } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, markNotificationsRead, requestIntro, profile } = useApp();

  useEffect(() => {
    markNotificationsRead();
  }, [markNotificationsRead]);

  const items = notifications.filter((n) => {
    if (n.action === 'connect') return true;
    const person = n.personId ? getPerson(n.personId) : undefined;
    return person ? isConfidential(person) : false;
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Updates</Text>
      <Text style={styles.title}>From the Founder’s circle</Text>
      <Text style={styles.intro}>
        Names stay hidden. You see the profession and the city, then ask the Founder if you want an introduction.
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
                <Text style={styles.markTxt}>?</Text>
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
  content: { paddingHorizontal: 28, paddingTop: 28, paddingBottom: 48, maxWidth: 720 },
  kicker: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: { color: Colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -0.6, marginTop: 6 },
  intro: { color: Colors.textSecondary, marginTop: 8, marginBottom: 22, lineHeight: 21, fontSize: 15 },
  empty: { color: Colors.textMuted, fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A2A38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markTxt: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  rowTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  rowBody: { color: Colors.textMuted, fontSize: 13, marginTop: 3 },
  action: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.4)',
  },
  actionTxt: { color: '#C4B5FD', fontWeight: '700', fontSize: 13 },
});
