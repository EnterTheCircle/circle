import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '@/components/Logo';
import { PrimaryButton } from '@/components/ui';
import { Colors, Radii } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

const STEPS = [
  {
    icon: 'phone-portrait-outline' as const,
    title: 'Connect in the real world',
    body: 'Meet someone, then connect with a tap or a 15-second rotating code. Both people must consent — no cold adds.',
  },
  {
    icon: 'compass-outline' as const,
    title: 'Discover who you need',
    body: 'Search your 1st & 2nd circle for a lawyer, stylist, designer, founder. Third degree stays out of reach.',
  },
  {
    icon: 'git-network-outline' as const,
    title: 'Ask for a warm intro',
    body: 'Ask the mutual. They approve or decline. Messaging opens their preferred app — never an in-app chat.',
  },
];

export default function HowToWeb() {
  const { completeHowTo } = useApp();
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  const finish = async () => {
    await completeHowTo();
    router.replace('/');
  };

  return (
    <View style={styles.page}>
      <View style={styles.top}>
        <Logo size={30} />
        <Pressable onPress={finish}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <Text style={styles.kicker}>How MyCircle works</Text>
      <Text style={styles.title}>Three steps. No cold DMs.</Text>

      <View style={styles.row}>
        {STEPS.map((s, i) => {
          const active = i === step;
          return (
            <Pressable
              key={s.title}
              onPress={() => setStep(i)}
              style={[styles.card, active && styles.cardActive]}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={s.icon} size={28} color={Colors.cyan} />
              </View>
              <Text style={styles.stepLabel}>Step {i + 1}</Text>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text style={styles.body}>{s.body}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        {step > 0 ? (
          <PrimaryButton title="Back" variant="ghost" onPress={() => setStep((s) => s - 1)} style={{ width: 140 }} />
        ) : (
          <View style={{ width: 140 }} />
        )}
        <PrimaryButton
          title={isLast ? 'Get started' : 'Next'}
          onPress={() => (isLast ? finish() : setStep((s) => s + 1))}
          style={{ width: 180 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: 56, paddingVertical: 40 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skip: { color: Colors.textMuted, fontWeight: '700', fontSize: 15 },
  kicker: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 48,
  },
  title: { color: Colors.text, fontSize: 40, fontWeight: '800', marginTop: 8, letterSpacing: -1, marginBottom: 36 },
  row: { flexDirection: 'row', gap: 18, flex: 1 },
  card: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
  },
  cardActive: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.cyanSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  stepLabel: { color: Colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  cardTitle: { color: Colors.text, fontSize: 22, fontWeight: '800', marginTop: 8 },
  body: { color: Colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 28 },
});
