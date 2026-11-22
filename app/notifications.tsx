import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Card, PrimaryButton } from '@/components/ui';
import { getPerson } from '@/constants/mockData';
import { Colors, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, markNotificationsRead, rememberPerson, requestIntro, isSaved } = useApp();

  useEffect(() => {
    markNotificationsRead();
  }, [markNotificationsRead]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.intro}>
        Useful updates from people who opted to share — not engagement bait.
      </Text>

      {notifications.map((n) => {
        const person = n.personId ? getPerson(n.personId) : undefined;
        return (
          <Card key={n.id} style={{ marginBottom: 12, opacity: n.unread ? 1 : 0.85 }}>
            {n.unread ? <View style={styles.unread} /> : null}
            <View style={styles.header}>
              {person ? (
                <Avatar
                  initials={person.initials}
                  color={person.color}
                  photo={person.photo}
                  size={44}
                />
              ) : null}
              <View style={{ flex: 1, marginLeft: person ? 12 : 0, paddingRight: 12 }}>
                <Text style={styles.title}>{n.title}</Text>
                <Text style={styles.body}>{n.body}</Text>
                <Text style={styles.time}>{n.time}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              {n.personId ? (
                <>
                  <PrimaryButton
                    title="View Profile"
                    onPress={() => router.push(`/person/${n.personId}`)}
                    style={{ flex: 1 }}
                  />
                  <PrimaryButton
                    title={isSaved(n.personId) ? 'Saved' : 'Remember'}
                    variant="secondary"
                    onPress={() => rememberPerson(n.personId!)}
                    style={{ flex: 1 }}
                  />
                </>
              ) : null}
            </View>
            {n.personId ? (
              <PrimaryButton
                title="Request Introduction"
                variant="ghost"
                onPress={() => requestIntro(n.personId!, '')}
                style={{ marginTop: 8 }}
              />
            ) : null}
          </Card>
        );
      })}

      <Pressable onPress={() => router.push('/notification-settings')}>
        <Text style={styles.settings}>Notification preferences →</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  intro: { color: Colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  unread: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  body: { color: Colors.textSecondary, marginTop: 6, lineHeight: 20 },
  time: { color: Colors.textMuted, fontSize: 12, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  settings: {
    color: Colors.accent,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
});
