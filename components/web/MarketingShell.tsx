import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Radii } from '@/constants/theme';
import { CIRCLE_MARK } from '@/lib/brand';

const LINKS: { href: string; label: string }[] = [
  { href: '/about', label: 'About' },
  { href: '/tokenomics', label: 'Tokenomics' },
  { href: '/circle-token', label: '$CIRCLE' },
];

export function MarketingShell({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <View style={styles.page}>
      <View style={styles.top}>
        <Pressable style={styles.brand} onPress={() => router.push('/signup')}>
          <Image source={CIRCLE_MARK} style={styles.mark} />
          <Text style={styles.word}>CIRCLE</Text>
        </Pressable>
        <View style={styles.nav}>
          {LINKS.map((l) => (
            <Pressable
              key={l.href}
              onPress={() => router.push(l.href as any)}
              style={[styles.navPill, l.label === '$CIRCLE' && styles.navPillAccent]}
            >
              <Text style={[styles.navTxt, l.label === '$CIRCLE' && styles.navTxtAccent]}>
                {l.label}
              </Text>
            </Pressable>
          ))}
          <Pressable style={styles.enterMini} onPress={() => router.push('/signup')}>
            <Text style={styles.enterMiniTxt}>Enter</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title}>{title}</Text>
        {children}
        <Pressable style={styles.back} onPress={() => router.push('/signup')}>
          <Text style={styles.backTxt}>← Back to home</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export function MarketCard({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent?: string;
}) {
  return (
    <View style={[styles.card, accent ? { borderColor: accent + '44' } : null]}>
      <Text style={[styles.cardTitle, accent ? { color: accent } : null]}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#020617' },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148,163,184,0.1)',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 26, height: 26, borderRadius: 13 },
  word: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
  },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  navPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.14)',
    backgroundColor: 'rgba(248,250,252,0.04)',
  },
  navPillAccent: {
    borderColor: 'rgba(34,211,238,0.35)',
    backgroundColor: 'rgba(34,211,238,0.08)',
  },
  navTxt: {
    color: 'rgba(226,232,240,0.72)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  navTxtAccent: { color: '#67E8F9' },
  enterMini: {
    marginLeft: 4,
    backgroundColor: 'rgba(248,250,252,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  enterMiniTxt: { color: '#020617', fontWeight: '800', fontSize: 12 },
  body: {
    paddingHorizontal: 36,
    paddingTop: 40,
    paddingBottom: 64,
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center',
  },
  kicker: {
    color: '#22D3EE',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 28,
  },
  card: {
    backgroundColor: 'rgba(15,23,42,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.14)',
    borderRadius: Radii.lg,
    padding: 20,
    marginBottom: 14,
  },
  cardTitle: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardBody: { color: '#94A3B8', fontSize: 15, lineHeight: 23 },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
  },
  backTxt: { color: '#94A3B8', fontWeight: '600', fontSize: 14 },
});
