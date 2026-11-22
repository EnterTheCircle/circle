import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input, PrimaryButton } from '@/components/ui';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

const CODE_POOL = ['MADRID42', 'BROOKLYN15', 'ORBIT77', 'CIRCLE09', 'NEON31', 'AURORA5'];

function nextCode(prev?: string) {
  const pool = CODE_POOL.filter((c) => c !== prev);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function ConnectKeyword() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addConnection, showToast } = useApp();

  const [myCode, setMyCode] = useState(() => nextCode());
  const [codeSeconds, setCodeSeconds] = useState(15);
  const [entered, setEntered] = useState('');
  const [incoming, setIncoming] = useState<{ name: string; code: string } | null>(null);
  const [acceptSeconds, setAcceptSeconds] = useState(15);

  // Rotate own code every 15s
  useEffect(() => {
    setCodeSeconds(15);
    const tick = setInterval(() => {
      setCodeSeconds((s) => {
        if (s <= 1) {
          setMyCode((prev) => nextCode(prev));
          return 15;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [myCode]);

  // Accept window countdown
  useEffect(() => {
    if (!incoming) return;
    setAcceptSeconds(15);
    const tick = setInterval(() => {
      setAcceptSeconds((s) => {
        if (s <= 1) {
          clearInterval(tick);
          setIncoming(null);
          showToast('Request expired — ask them to send again');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [incoming, showToast]);

  const sendCode = useCallback(() => {
    const normalized = entered.trim().toUpperCase();
    if (!normalized) return;
    if (!CODE_POOL.includes(normalized) && normalized !== myCode) {
      showToast('Code not recognized — try MADRID42 or BROOKLYN15');
      return;
    }
    // Simulate: sending a code creates an incoming request on "their" side —
    // for the prototype, it lands here as a request you must accept in 15s.
    setIncoming({ name: 'Alex Rivera', code: normalized });
    setEntered('');
    showToast('Code sent — waiting for mutual accept');
  }, [entered, myCode, showToast]);

  const accept = () => {
    if (!incoming) return;
    addConnection('alex');
    router.push({
      pathname: '/connect-success',
      params: { name: incoming.name, method: 'Add code' },
    });
  };

  const progress = useMemo(() => codeSeconds / 15, [codeSeconds]);
  const acceptProgress = acceptSeconds / 15;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={22} color={Colors.text} />
        <Text style={styles.backText}>Connect</Text>
      </Pressable>

      <Text style={styles.title}>Live add code</Text>
      <Text style={styles.sub}>
        Share your code. It refreshes every 15 seconds. After someone sends yours, you have 15
        seconds to accept.
      </Text>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>YOUR CODE · REFRESHES IN {codeSeconds}s</Text>
        <Text style={styles.code}>{myCode}</Text>
        <View style={styles.timerTrack}>
          <View style={[styles.timerFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.hint}>Demo codes also work: MADRID42 · BROOKLYN15</Text>
      </View>

      <Text style={styles.or}>ENTER THEIR CODE</Text>
      <Input
        value={entered}
        onChangeText={setEntered}
        placeholder="Type a live code"
        style={styles.input}
      />
      <PrimaryButton
        title="Send connection"
        onPress={sendCode}
        disabled={!entered.trim()}
        style={{ width: '100%', marginTop: 12 }}
      />

      {incoming ? (
        <View style={styles.incoming}>
          <Text style={styles.incomingLabel}>INCOMING · {acceptSeconds}s TO ACCEPT</Text>
          <Text style={styles.incomingTitle}>{incoming.name} wants to connect</Text>
          <Text style={styles.incomingMeta}>via code {incoming.code}</Text>
          <View style={styles.timerTrack}>
            <View
              style={[
                styles.timerFill,
                { width: `${acceptProgress * 100}%`, backgroundColor: Colors.cyan },
              ]}
            />
          </View>
          <View style={styles.row}>
            <PrimaryButton title="Accept" onPress={accept} style={{ flex: 1 }} />
            <PrimaryButton
              title="Decline"
              variant="danger"
              onPress={() => setIncoming(null)}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: Spacing.lg },
  back: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  backText: { color: Colors.text, marginLeft: 2, fontWeight: '500' },
  title: { color: Colors.text, fontSize: 26, fontWeight: '700' },
  sub: { color: Colors.textMuted, marginTop: 8, marginBottom: 22, lineHeight: 20 },
  codeCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.accent + '55',
    padding: 22,
    alignItems: 'center',
    marginBottom: 24,
  },
  codeLabel: { color: Colors.textMuted, letterSpacing: 1.2, fontSize: 10, fontWeight: '700' },
  code: { color: Colors.text, fontSize: 36, fontWeight: '800', letterSpacing: 4, marginVertical: 12 },
  timerTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
    marginTop: 4,
  },
  timerFill: { height: '100%', backgroundColor: Colors.accent },
  hint: { color: Colors.textMuted, marginTop: 12, fontSize: 11 },
  or: {
    color: Colors.textMuted,
    letterSpacing: 1.4,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: { width: '100%', textAlign: 'center', letterSpacing: 2, fontWeight: '700' },
  incoming: {
    marginTop: 22,
    backgroundColor: 'rgba(34,211,238,0.08)',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.cyan + '55',
    padding: 16,
  },
  incomingLabel: { color: Colors.cyan, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  incomingTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginTop: 8 },
  incomingMeta: { color: Colors.textSecondary, marginTop: 4, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, marginTop: 14 },
});
