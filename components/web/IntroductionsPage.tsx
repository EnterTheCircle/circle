import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, PrimaryButton } from '@/components/ui';
import {
  FOUNDER,
  ME,
  buildBridgeIntroMessage,
  channelLabel,
  getPerson,
  openPreferredChannel,
} from '@/constants/mockData';
import { Colors, Radii } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export default function IntroductionsWeb() {
  const router = useRouter();
  const { intros, respondIntro, showToast, profile, isAppFounder } = useApp();
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const list = intros.filter((i) => i.type === tab);

  const approveAndHandoff = async (item: (typeof intros)[number]) => {
    const target = getPerson(item.toId);
    respondIntro(item.id, 'accepted');
    if (!target) {
      router.push({ pathname: '/intro-success', params: { name: item.toName } });
      return;
    }
    const bridge = profile.name.split(' ')[0] || ME.firstName;
    const message = buildBridgeIntroMessage(bridge, item.fromName, target, item.reason);
    const channel = target.contactChannel || 'mycircle';
    const result = await openPreferredChannel(target, message, {
      subject: `Introduction: ${item.fromName} ↔ ${target.name}`,
    });
    if (result === 'opened') showToast(`Approved · opening ${channelLabel(channel)}`);
    else if (result === 'mycircle') showToast('Approved · they’ll be notified in MyCircle');
    else showToast(`Approved · ${channelLabel(channel)} not available`);
    router.push({ pathname: '/intro-success', params: { name: item.toName, channel: channelLabel(channel) } });
  };

  const messageTarget = async (toId: string, toName: string) => {
    const target = getPerson(toId);
    if (!target) return;
    const from = profile.name.split(' ')[0] || ME.firstName;
    const result = await openPreferredChannel(target, `Hi ${target.firstName}, it's ${from} from MyCircle.`, {
      subject: `Hello from ${from}`,
    });
    if (result === 'opened') showToast(`Opening ${channelLabel(target.contactChannel || 'mycircle')}`);
    else if (result === 'mycircle') showToast(`${toName} prefers in-app notices`);
    else showToast(`${channelLabel(target.contactChannel || 'mycircle')} not available`);
  };

  return (
    <View style={styles.page}>
      <Text style={styles.kicker}>Warm handoffs</Text>
      <Text style={styles.title}>Introductions</Text>
      <Text style={styles.sub}>Approve in MyCircle. Messaging happens in their preferred app.</Text>

      {!isAppFounder ? (
      <View style={styles.founder}>
        <Avatar initials={FOUNDER.initials} photo={FOUNDER.photo} color={FOUNDER.color} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Founder of the app</Text>
          <Text style={styles.mutual}>Connected with Founder through Circle.</Text>
        </View>
        <View style={[styles.status, { borderColor: Colors.success + '66' }]}>
          <Text style={[styles.statusText, { color: Colors.success }]}>CONNECTED</Text>
        </View>
      </View>
      ) : null}

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
            item.status === 'accepted' ? Colors.success : item.status === 'declined' ? Colors.danger : Colors.warning;
          const preferred = person?.contactChannel ? channelLabel(person.contactChannel) : null;

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                {person ? (
                  <Avatar initials={person.initials} photo={person.photo} color={person.color} size={52} />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {tab === 'received'
                      ? `${item.fromName} wants an intro to ${item.toName}`
                      : `Waiting on ${item.mutual}`}
                  </Text>
                  <Text style={styles.mutual}>
                    {tab === 'received' ? `You’re the bridge · to ${item.toName}` : `You → ${item.toName}`}
                  </Text>
                  {preferred ? (
                    <Text style={styles.channel}>
                      {item.toName.split(' ')[0]} prefers {preferred}
                    </Text>
                  ) : null}
                </View>
                <View style={[styles.status, { borderColor: statusColor + '66' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.reason}>{item.reason}</Text>
              {tab === 'received' && item.status === 'pending' ? (
                <View style={styles.actions}>
                  <PrimaryButton title="Approve" onPress={() => approveAndHandoff(item)} style={{ flex: 1 }} />
                  <PrimaryButton
                    title="Decline"
                    variant="danger"
                    onPress={() => respondIntro(item.id, 'declined')}
                    style={{ flex: 1 }}
                  />
                </View>
              ) : (
                <View style={styles.actions}>
                  {item.status === 'accepted' && preferred ? (
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
              : 'Nothing sent yet — Discover someone and ask their mutual.'}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: 40, paddingTop: 32 },
  kicker: { color: Colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: Colors.text, fontSize: 36, fontWeight: '800', marginTop: 6, letterSpacing: -0.8 },
  sub: { color: Colors.textMuted, marginTop: 8, fontSize: 15, marginBottom: 20 },
  founder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    maxWidth: 640,
    backgroundColor: 'rgba(167,139,250,0.1)',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
    padding: 16,
    marginBottom: 18,
  },
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
    width: 420,
    maxWidth: '100%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: 18,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  mutual: { color: Colors.accent, marginTop: 4, fontSize: 12, fontWeight: '600' },
  channel: { color: Colors.textMuted, marginTop: 3, fontSize: 11 },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  reason: { color: Colors.textSecondary, marginTop: 14, lineHeight: 21, fontSize: 14 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  empty: { color: Colors.textMuted, marginTop: 24 },
});
