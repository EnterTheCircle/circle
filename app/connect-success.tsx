import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '@/components/ui';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export default function ConnectSuccess() {
  const { name = 'New connection', method = 'Connect' } = useLocalSearchParams<{
    name?: string;
    method?: string;
  }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addConnection } = useApp();
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    addConnection(String(name));
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, [addConnection, name, scale]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <Animated.View style={[styles.icon, { transform: [{ scale }] }]}>
        <Ionicons name="checkmark" size={42} color="#fff" />
      </Animated.View>
      <Text style={styles.title}>You're connected</Text>
      <Text style={styles.body}>
        You and {name} both confirmed. Mutual consent recorded via {method}.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>NEXT</Text>
        <Text style={styles.cardText}>
          Exchange contact details outside MyCircle whenever you're ready. No chat inside the app —
          by design.
        </Text>
      </View>
      <PrimaryButton
        title="Back to Circle"
        onPress={() => router.replace('/')}
        style={{ width: '100%', marginTop: 24 }}
      />
      <PrimaryButton
        title="Discover more people"
        variant="ghost"
        onPress={() => router.replace('/(tabs)/discover')}
        style={{ width: '100%', marginTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  icon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    marginBottom: 24,
  },
  title: { color: Colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.4 },
  body: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    fontSize: 15,
  },
  card: {
    marginTop: 28,
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
  },
  cardLabel: { color: Colors.accent, fontSize: 11, letterSpacing: 1.5, fontWeight: '700' },
  cardText: { color: Colors.textSecondary, marginTop: 8, lineHeight: 20 },
});
