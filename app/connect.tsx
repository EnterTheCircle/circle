import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glyph } from '@/components/Glyph';
import { PrimaryButton } from '@/components/ui';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import {
  claimDailySlug,
  claimLiveWord,
  getIdentityId,
  joinUrl,
  secondsLeft,
} from '@/lib/identityCode';

export default function ConnectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast, sendConnectAsk, confirmConnectAsk, connectAsks, profile } = useApp();
  const web = Platform.OS === 'web';

  const [word, setWord] = useState('…');
  const [left, setLeft] = useState(30);
  const [theirWord, setTheirWord] = useState('');
  const [confirmWord, setConfirmWord] = useState<Record<string, string>>({});
  const [link, setLink] = useState('');
  const [sentNote, setSentNote] = useState('');

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      const id = await getIdentityId();
      const live = await claimLiveWord(id);
      const daily = await claimDailySlug(id);
      if (stop) return;
      setWord(live.word);
      setLeft(secondsLeft());
      setLink(joinUrl(daily.slug));
    };
    void tick();
    const timer = setInterval(() => void tick(), 1000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, []);

  const pending = connectAsks.filter((a) => a.status === 'pending');
  const mine = profile.name?.trim() || 'You';

  const send = async () => {
    const res = await sendConnectAsk(theirWord, 'word');
    if (!res.ok) {
      showToast(res.error);
      return;
    }
    setSentNote(`Read them this word: ${res.fromWord}`);
    setTheirWord('');
  };

  const copyLink = async () => {
    try {
      if (web && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(link);
        showToast('Link copied');
        return;
      }
    } catch {
      /* fall through */
    }
    showToast(link);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 28,
        paddingBottom: insets.bottom + 40,
        paddingHorizontal: web ? 32 : Spacing.lg,
        alignItems: 'center',
      }}
    >
      <Pressable style={styles.close} onPress={() => router.back()}>
        <Glyph name="close" size={18} color={Colors.textSecondary} />
      </Pressable>
      <View style={styles.canvas}>
      <Text style={styles.kicker}>Add</Text>
      <Text style={styles.title}>Your word is your identifier.</Text>
      <Text style={styles.subtitle}>
        It changes every 30 seconds. No two people hold the same word at the same time. They type yours to request you. You type theirs to connect.
      </Text>

      <View style={styles.wordCard}>
        <Text style={styles.wordLabel}>Showing now</Text>
        <Text style={styles.word}>{word}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(left / 30) * 100}%` }]} />
        </View>
        <Text style={styles.countdown}>New word in {left}s</Text>
      </View>

      <View style={web ? styles.columns : undefined}>
        <View style={[styles.card, web && styles.col]}>
          <Text style={styles.cardTitle}>Request someone</Text>
          <Text style={styles.cardDesc}>Type the word on their screen. The request lands in their notifications.</Text>
          <TextInput
            value={theirWord}
            onChangeText={setTheirWord}
            placeholder="their word"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            style={styles.input}
          />
          <PrimaryButton title="Send request" onPress={() => void send()} />
          {sentNote ? <Text style={styles.note}>{sentNote}</Text> : null}
        </View>

        <View style={[styles.card, web && styles.col]}>
          <Text style={styles.cardTitle}>Confirm a request</Text>
          <Text style={styles.cardDesc}>
            When someone uses your word, enter the word they read you. That is the only way the connection completes.
          </Text>
          {pending.length === 0 ? (
            <Text style={styles.empty}>No open requests for {mine}.</Text>
          ) : (
            pending.map((ask) => (
              <View key={ask.id} style={styles.ask}>
                <Text style={styles.askName}>{ask.fromName}</Text>
                <Text style={styles.askMeta}>
                  {ask.kind === 'link' ? 'Used your daily link' : `Asked with “${ask.toWord}”`}
                </Text>
                <TextInput
                  value={confirmWord[ask.id] || ''}
                  onChangeText={(t) => setConfirmWord((prev) => ({ ...prev, [ask.id]: t }))}
                  placeholder="their word"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  style={styles.input}
                />
                <PrimaryButton
                  title="Connect"
                  onPress={() => {
                    const ok = confirmConnectAsk(ask.id, confirmWord[ask.id] || '');
                    if (!ok) showToast('That word does not match theirs.');
                  }}
                />
              </View>
            ))
          )}
        </View>
      </View>

      <View style={web ? styles.columns : undefined}>
        <View style={[styles.card, web && styles.col]}>
          <Text style={styles.cardTitle}>Daily link</Text>
          <Text style={styles.cardDesc}>Anyone with this link can ask to join you. It changes every day.</Text>
          <Text style={styles.link} selectable>
            {link || 'Preparing your link…'}
          </Text>
          <PrimaryButton title="Copy link" variant="secondary" onPress={() => void copyLink()} />
        </View>

        <View style={[styles.card, web && styles.col, web && styles.disabled]}>
          <Text style={styles.cardTitle}>Tap to add</Text>
          <Text style={styles.cardDesc}>
            Stand next to someone and tap phones. This only works in the phone app.
          </Text>
          {web ? (
            <Text style={styles.phoneOnly}>Phone only</Text>
          ) : (
            <PrimaryButton title="Find nearby people" onPress={() => router.push('/connect-nearby')} />
          )}
        </View>
      </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  canvas: { width: '100%', maxWidth: 1040 },
  close: { position: 'absolute', right: 18, top: 16, zIndex: 2, padding: 8 },
  kicker: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: { color: Colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -0.6, marginTop: 6 },
  subtitle: { color: Colors.textSecondary, marginTop: 8, marginBottom: 18, fontSize: 15, lineHeight: 22, maxWidth: 640 },
  wordCard: {
    backgroundColor: '#0C0C16',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
    padding: 22,
    marginBottom: 16,
  },
  wordLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
  word: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: -0.8, marginTop: 6 },
  track: { height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 16, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: '#A78BFA' },
  countdown: { color: '#C4B5FD', marginTop: 8, fontWeight: '700', fontSize: 13 },
  columns: { flexDirection: 'row', gap: 14, alignItems: 'stretch' },
  col: { flex: 1 },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: 14,
  },
  disabled: { opacity: 0.45 },
  cardTitle: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  cardDesc: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 6, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    color: Colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  note: { color: '#67E8F9', marginTop: 10, fontWeight: '700' },
  empty: { color: Colors.textMuted, fontSize: 13 },
  ask: { marginBottom: 14 },
  askName: { color: Colors.text, fontWeight: '800', fontSize: 15 },
  askMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 2, marginBottom: 8 },
  link: { color: '#C4B5FD', fontSize: 14, marginBottom: 12 },
  phoneOnly: {
    color: Colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontSize: 12,
  },
});
