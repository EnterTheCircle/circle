import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar, PrimaryButton } from '@/components/ui';
import {
  ME,
  buildBridgeIntroMessage,
  channelLabel,
  getPerson,
  openPreferredChannel,
} from '@/constants/mockData';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import IntroductionsWeb from '@/components/web/IntroductionsPage';

export default function IntroductionsScreen() {
  if (Platform.OS === 'web') return <IntroductionsWeb />;
  return <IntroductionsNative />;
}

function IntroductionsNative() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { intros, respondIntro, showToast, profile } = useApp();
  const [tab, setTab] = useState<'received' | 'sent'>('received');

  const list = intros.filter((i) => i.type === tab);

  const approveAndHandoff = async (item: (typeof intros)[number]) => {
    await respondIntro(item.id, 'accept');
  };

  const messageTarget = async (toId: string, toName: string) => {
    const target = getPerson(toId);
    if (!target) return;
    const from = profile.name.split(' ')[0] || ME.firstName;
    const result = await openPreferredChannel(
      target,
      `Hi ${target.firstName}, it's ${from} from MyCircle.`,
      { subject: `Hello from ${from}` }
    );
    if (result === 'opened') {
      showToast(`Opening ${channelLabel(target.contactChannel || 'mycircle')}`);
    } else if (result === 'mycircle') {
      showToast(`${toName} prefers in-app notices`);
    } else {
      showToast(`${channelLabel(target.contactChannel || 'mycircle')} not available`);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Introductions</Text>
      <Text style={styles.sub}>Approve in MyCircle · message in their preferred app.</Text>

      <View style={styles.tabs}>
        {(['received', 'sent'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'received' ? 'Received' : 'Sent'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {list.map((item) => {
          const person = getPerson(item.toId);
          const statusColor =
            item.status === 'accepted'
              ? Colors.success
              : item.status === 'declined'
                ? Colors.danger
                : Colors.warning;
          const preferred = person?.contactChannel
            ? channelLabel(person.contactChannel)
            : null;

          return (
            <View key={item.id} style={styles.card}>
              <LinearGradient
                colors={['rgba(34,211,238,0.08)', 'rgba(15,23,42,0.95)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.header}>
                {person ? (
                  <Avatar
                    initials={person.initials}
                    color={person.color}
                    photo={person.photo}
                    size={52}
                  />
                ) : null}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cardTitle}>
                    {tab === 'received'
                      ? `${item.fromName} wants an intro to ${item.toName}`
                      : `Waiting on ${item.mutual}`}
                  </Text>
                  <Text style={styles.mutual}>
                    {tab === 'received'
                      ? `You’re the bridge · to ${item.toName}`
                      : `You → ${item.toName}`}
                  </Text>
                  {preferred ? (
                    <Text style={styles.channel}>{item.toName.split(' ')[0]} prefers {preferred}</Text>
                  ) : null}
                </View>
                <View style={[styles.status, { borderColor: statusColor + '66' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.reason}>{item.reason}</Text>

              {tab === 'received' &&
              (item.status === 'pending' || item.status === 'awaiting_target') ? (
                <View style={styles.actions}>
                  <PrimaryButton
                    title={item.status === 'awaiting_target' ? 'Share contact' : 'Approve'}
                    onPress={() => approveAndHandoff(item)}
                    style={{ flex: 1 }}
                  />
                  <PrimaryButton
                    title="Decline"
                    variant="danger"
                    onPress={() => void respondIntro(item.id, 'decline')}
                    style={{ flex: 1 }}
                  />
                </View>
              ) : (
                <View style={styles.actions}>
                  {(item.status === 'accepted' || item.status === 'channel_open') && preferred ? (
                    <PrimaryButton
                      title={preferred}
                      onPress={() => messageTarget(item.toId, item.toName)}
                      style={{ flex: 1 }}
                    />
                  ) : null}
                  <PrimaryButton
                    title="Profile"
                    variant="ghost"
                    onPress={() => router.push(`/person/${item.toId}`)}
                    style={{ flex: 1 }}
                  />
                </View>
              )}
            </View>
          );
        })}

        {list.length === 0 ? (
          <Text style={styles.empty}>
            {tab === 'received'
              ? 'No intro requests for you to bridge yet.'
              : 'Nothing sent yet — Discover someone and Ask their mutual.'}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020617', paddingHorizontal: Spacing.lg },
  title: { color: Colors.text, fontSize: 26, fontWeight: '800' },
  sub: { color: Colors.textMuted, marginTop: 4, marginBottom: 14 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    marginBottom: 14,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: Radii.full, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.accentSoft },
  tabText: { color: Colors.textMuted, fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: Colors.accent },
  card: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
    padding: 14,
    marginBottom: 12,
    backgroundColor: Colors.bgCard,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  mutual: { color: Colors.accent, marginTop: 4, fontSize: 12, fontWeight: '600' },
  channel: { color: Colors.textMuted, marginTop: 3, fontSize: 11 },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  reason: { color: Colors.textSecondary, marginTop: 12, lineHeight: 20, fontSize: 14 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 48, lineHeight: 20 },
});
