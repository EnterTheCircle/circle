import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CIRCLE_MARK } from '@/lib/brand';

const LINKS: { href: string; label: string; accent?: boolean }[] = [
  { href: '/about', label: 'About' },
  { href: '/tokenomics', label: 'Tokenomics' },
  { href: '/circle-token', label: '$CIRCLE', accent: true },
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
            <Pressable key={l.href} onPress={() => router.push(l.href as any)} style={styles.navLink}>
              <Text style={[styles.navTxt, l.accent && styles.navTxtAccent]}>{l.label}</Text>
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
        <View style={styles.rule} />
        {children}
        <Pressable style={styles.back} onPress={() => router.push('/signup')}>
          <Text style={styles.backTxt}>← Home</Text>
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
    <View style={styles.section}>
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
    paddingHorizontal: 36,
    paddingVertical: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.14)',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 28, height: 28, borderRadius: 14 },
  word: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3.2,
  },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 22, flexWrap: 'wrap' },
  navLink: { paddingVertical: 6 },
  navTxt: {
    color: 'rgba(226,232,240,0.62)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  navTxtAccent: { color: '#67E8F9', fontWeight: '700' },
  enterMini: {
    marginLeft: 6,
    borderWidth: 1,
    borderColor: 'rgba(248,250,252,0.85)',
    backgroundColor: 'rgba(248,250,252,0.96)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  enterMiniTxt: { color: '#020617', fontWeight: '700', fontSize: 12, letterSpacing: 0.4 },
  body: {
    paddingHorizontal: 36,
    paddingTop: 56,
    paddingBottom: 72,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  kicker: {
    color: 'rgba(103,232,249,0.85)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 44,
    fontWeight: '200',
    letterSpacing: 1,
    marginBottom: 18,
  },
  rule: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(34,211,238,0.45)',
    marginBottom: 28,
  },
  section: {
    paddingVertical: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.14)',
  },
  cardTitle: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  cardBody: { color: 'rgba(148,163,184,0.95)', fontSize: 15, lineHeight: 24 },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 36,
  },
  backTxt: { color: 'rgba(148,163,184,0.85)', fontWeight: '500', fontSize: 14 },
});
