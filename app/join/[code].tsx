import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PrimaryButton } from '@/components/ui';
import { Colors, Radii } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

/** Daily invite link. The owner confirms by entering your live word. */
export default function JoinLink() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { sendConnectAsk, showToast, hasSignedUp } = useApp();
  const [sent, setSent] = useState('');
  const slug = String(code || '').replace(/-/g, ' ');

  const ask = async () => {
    if (!hasSignedUp) {
      showToast('Sign in first, then open the link again.');
      router.replace('/signup');
      return;
    }
    const res = await sendConnectAsk(slug, 'link');
    if (!res.ok) {
      showToast(res.error);
      return;
    }
    setSent(res.fromWord);
  };

  return (
    <View style={styles.page}>
      <Text style={styles.kicker}>Daily link</Text>
      <Text style={styles.title}>Join this circle</Text>
      <Text style={styles.body}>
        This link belongs to one person and changes every day. Sending a request notifies them. They connect by entering your word.
      </Text>
      <View style={styles.slug}>
        <Text style={styles.slugTxt}>{slug}</Text>
      </View>
      {sent ? (
        <Text style={styles.sent}>Request sent. Read them this word: {sent}</Text>
      ) : (
        <PrimaryButton title="Send join request" onPress={() => void ask()} />
      )}
      <Pressable onPress={() => router.replace('/')} style={{ marginTop: 16 }}>
        <Text style={styles.back}>Back to Circle</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  kicker: { color: '#67E8F9', fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', fontSize: 12 },
  title: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 8 },
  body: { color: Colors.textSecondary, textAlign: 'center', maxWidth: 460, lineHeight: 22, marginTop: 10, marginBottom: 18 },
  slug: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.4)',
    marginBottom: 18,
  },
  slugTxt: { color: '#C4B5FD', fontWeight: '800', fontSize: 16 },
  sent: { color: '#67E8F9', fontWeight: '700', textAlign: 'center', maxWidth: 420 },
  back: { color: Colors.textMuted, fontWeight: '700' },
});
