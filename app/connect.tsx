import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '@/components/ui';
import { Colors, Radii, Spacing } from '@/constants/theme';

const OPTIONS = [
  {
    key: 'code',
    icon: 'keypad' as const,
    title: 'ADD CODE',
    description:
      'Your code refreshes every 15 seconds. When someone sends it, you have 15 seconds to accept.',
    button: 'Open add code',
    route: '/connect-keyword' as const,
    accent: Colors.accent,
  },
  {
    key: 'tap',
    icon: 'wifi' as const,
    title: 'TAP TO CONNECT',
    description: 'Connect with someone standing right next to you — simulated proximity.',
    button: 'Find nearby people',
    route: '/connect-nearby' as const,
    accent: Colors.cyan,
  },
];

export default function ConnectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.handle} />
      <Pressable style={styles.close} onPress={() => router.back()}>
        <Ionicons name="close" size={22} color={Colors.textSecondary} />
      </Pressable>

      <Text style={styles.title}>Add someone.</Text>
      <Text style={styles.subtitle}>Only two ways in — a live code, or a real-life tap.</Text>

      {OPTIONS.map((opt) => (
        <View key={opt.key} style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: opt.accent + '22' }]}>
            <Ionicons name={opt.icon} size={22} color={opt.accent} />
          </View>
          <Text style={styles.cardTitle}>{opt.title}</Text>
          <Text style={styles.cardDesc}>{opt.description}</Text>
          <PrimaryButton title={opt.button} onPress={() => router.push(opt.route)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bgElevated, paddingHorizontal: Spacing.lg },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    marginBottom: 16,
  },
  close: { position: 'absolute', right: 18, top: 54, zIndex: 2, padding: 8 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginTop: 8 },
  subtitle: { color: Colors.textSecondary, marginTop: 6, marginBottom: 20, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: { color: Colors.text, fontSize: 13, fontWeight: '800', letterSpacing: 1.2 },
  cardDesc: { color: Colors.textSecondary, fontSize: 14, marginTop: 6, marginBottom: 14, lineHeight: 20 },
});
