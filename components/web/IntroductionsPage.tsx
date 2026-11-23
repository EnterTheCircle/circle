import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, PrimaryButton } from '@/components/ui';
import {
  IntroRequest,
  channelLabel,
  getPerson,
  openPreferredChannel,
} from '@/constants/mockData';
import { Colors, Radii } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useIsNarrowWeb } from '@/lib/useWebLayout';

function headline(item: IntroRequest, tab: 'received' | 'sent') {
  if (item.kind === 'offer_help') {
    return tab === 'received'
      ? `${item.fromName} offered to help`
      : `Offer sent to ${item.toName}`;
  }
  if (item.kind === 'ask_her_circle') {
    return tab === 'received'
      ? `${item.fromName} wants an intro to ${item.toName}`
      : `Asked ${item.bridgeName || 'them'} to intro you to ${item.toName}`;
  }
  if (item.kind === 'introduce_her') {
    return tab === 'received'
      ? `${item.fromName} wants to introduce you to ${item.toName}`
      : `Offered ${item.bridgeName || 'them'} an intro to ${item.toName}`;
  }
  return tab === 'received'
    ? `${item.fromName} wants an intro to ${item.toName}`
    : `Waiting on ${item.mutual}`;
}

function statusLabel(item: IntroRequest) {
  if (item.status === 'awaiting_target') return 'WAITING ON THEM';
  if (item.status === 'channel_open') return 'CONTACT SHARED';
  return item.status.toUpperCase();
}

export default function IntroductionsWeb() {
  const narrow = useIsNarrowWeb();
  const router = useRouter();
  const { intros, respondIntro, showToast, profile, refreshIntros, demoMode } = useApp();
  const [tab, setTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    void refreshIntros();
  }, [refreshIntros]);

  const list = intros.filter((i) => i.type === tab);

  const messageRevealed = async (item: IntroRequest) => {
    const target = getPerson(item.toId);
    if (!target?.contactHandle && !item.channelRevealed) {
      showToast('Contact not shared yet');
      return;
    }
    const from = profile.name.split(' ')[0] || 'Hi';
    if (!target) return;
    const result = await openPreferredChannel(
      target,
      `Hi ${target.firstName}, ${from} here via Circle.`,
      { subject: `Hello from ${from}` }
    );
    if (result === 'opened') showToast(`Opening ${channelLabel(target.contactChannel || 'mycircle')}`);
    else showToast('Preferred channel not available on this device');
  };

  return (
    <View style={[styles.page, narrow && styles.pageNarrow]}>
      <Text style={styles.kicker}>Warm handoffs</Text>
      <Text style={[styles.title, narrow && styles.titleNarrow]}>Introductions</Text>
      <Text style={styles.sub}>
        Approve in Circle. Sharing a preferred contact is not the same as joining someone’s 1st
        circle.
      </Text>

      <View style={styles.tabs}>
        {(['received', 'sent'] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'received' ? 'Received' : 'Sent'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {list.map((item) => {
          const person = getPerson(item.toId);
          const statusColor =
            item.status === 'channel_open' || item.status === 'accepted'
              ? Colors.success
              : item.status === 'declined'
                ? Colors.danger
                : item.status === 'awaiting_target'
                  ? Colors.cyan
                  : Colors.warning;

          const bridgePending = tab === 'received' && item.status === 'pending';
          const targetPending = tab === 'received' && item.status === 'awaiting_target';

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                {person ? (
                  <Avatar
                    initials={item.targetConfidential ? '?' : person.initials}
                    photo={item.targetConfidential ? undefined : person.photo}
                    color={item.targetConfidential ? '#64748B' : person.color}
                    size={48}
                  />
                ) : (
                  <Avatar initials="?" color="#64748B" size={48} />
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.cardTitle}>{headline(item, tab)}</Text>
                  <Text style={styles.mutual}>
                    {item.kind === 'offer_help'
                      ? item.reason || 'Offer to help'
                      : item.targetConfidential
                        ? 'Profile stays confidential until they share contact'
                        : `Via ${item.bridgeName || item.mutual}`}
                  </Text>
                </View>
                <View style={[styles.status, { borderColor: statusColor + '66' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel(item)}</Text>
                </View>
              </View>

              {bridgePending || targetPending ? (
                <View style={styles.actions}>
                  <PrimaryButton
                    title={targetPending ? 'Share contact' : 'Approve'}
                    onPress={() => void respondIntro(item.id, 'accept')}
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
                  {item.status === 'channel_open' ? (
                    <PrimaryButton
                      title="Open contact"
                      onPress={() => void messageRevealed(item)}
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

              {item.status === 'awaiting_target' && tab === 'sent' ? (
                <Text style={styles.foot}>
                  Bridge approved. Waiting on {item.toName} to share contact — not a Circle connect.
                </Text>
              ) : null}
              {item.status === 'declined' ? (
                <Text style={styles.foot}>Declined. Everyone involved was notified.</Text>
              ) : null}
              {!demoMode && item.status === 'channel_open' ? (
                <Text style={styles.foot}>
                  Contact shared. They’re still not in your 1st circle unless you Connect.
                </Text>
              ) : null}
            </View>
          );
        })}
        {list.length === 0 ? (
          <Text style={styles.empty}>
            {tab === 'received'
              ? 'No intro requests yet.'
              : 'Nothing sent yet — open someone in your circle to ask, offer help, or introduce.'}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: 40, paddingTop: 32 },
  pageNarrow: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 96 },
  kicker: { color: Colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: Colors.text, fontSize: 36, fontWeight: '800', marginTop: 6, letterSpacing: -0.8 },
  titleNarrow: { fontSize: 28 },
  sub: { color: Colors.textMuted, marginTop: 8, fontSize: 15, marginBottom: 20, maxWidth: 560, lineHeight: 22 },
  tabs: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    marginBottom: 22,
  },
  tab: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: Radii.full },
  tabActive: { backgroundColor: Colors.accentSoft },
  tabText: { color: Colors.textMuted, fontWeight: '700' },
  tabTextActive: { color: Colors.accent },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingBottom: 48 },
  card: {
    width: 440,
    maxWidth: '100%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: 18,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  mutual: { color: Colors.textSecondary, marginTop: 4, fontSize: 12, lineHeight: 17 },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  foot: { color: Colors.textMuted, fontSize: 12, marginTop: 12, lineHeight: 17 },
  empty: { color: Colors.textMuted, marginTop: 24 },
});
