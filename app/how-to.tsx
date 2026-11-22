import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from '@/components/Logo';
import { PrimaryButton } from '@/components/ui';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import HowToWeb from '@/components/web/HowToPage';

const STEPS = [
  {
    icon: 'phone-portrait-outline' as const,
    title: 'Connect in the real world',
    body: 'Meet someone, then connect with a tap or a 15-second rotating code. Both people must consent — no cold adds.',
  },
  {
    icon: 'compass-outline' as const,
    title: 'Discover who you need',
    body: 'Search your 1st & 2nd circle for a lawyer, stylist, designer, founder — whoever you need. Third degree stays out of reach.',
  },
  {
    icon: 'git-network-outline' as const,
    title: 'Ask for a warm intro',
    body: 'Ask the mutual. They approve or decline in Intros. Messaging opens their preferred app — WhatsApp, LinkedIn, iMessage, or email.',
  },
];

export default function HowToScreen() {
  if (Platform.OS === 'web') return <HowToWeb />;
  return <HowToNative />;
}

function HowToNative() {
  const insets = useSafeAreaInsets();
  const { completeHowTo } = useApp();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const finish = async () => {
    await completeHowTo();
    router.replace('/');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
      <View style={styles.topRow}>
        <Logo size={28} />
        <Pressable onPress={finish} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.progressRow}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]} />
        ))}
      </View>

      <View style={styles.card}>
        <LinearGradient
          colors={['rgba(34,211,238,0.12)', 'rgba(15,23,42,0.96)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.iconWrap}>
          <Ionicons name={current.icon} size={36} color={Colors.cyan} />
        </View>
        <Text style={styles.stepLabel}>Step {step + 1} of {STEPS.length}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.body}</Text>
      </View>

      <View style={styles.footer}>
        {step > 0 ? (
          <PrimaryButton
            title="Back"
            variant="ghost"
            onPress={() => setStep((s) => s - 1)}
            style={{ flex: 1 }}
          />
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <PrimaryButton
          title={isLast ? 'Get started' : 'Next'}
          onPress={() => {
            if (isLast) finish();
            else setStep((s) => s + 1);
          }}
          style={{ flex: 1.4 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skip: { color: Colors.textMuted, fontWeight: '700', fontSize: 15 },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 28,
    marginBottom: 24,
    justifyContent: 'center',
  },
  dot: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
  },
  dotActive: { backgroundColor: Colors.accent, width: 40 },
  dotDone: { backgroundColor: Colors.cyan },
  card: {
    flex: 1,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
    padding: 24,
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.cyanSoft,
    borderWidth: 1,
    borderColor: Colors.cyan + '44',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  stepLabel: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
    letterSpacing: -0.4,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    alignItems: 'center',
  },
});
