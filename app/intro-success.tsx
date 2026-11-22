import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '@/components/ui';
import { Colors, Radii, Spacing } from '@/constants/theme';

export default function IntroSuccess() {
  const { name = 'them', channel } = useLocalSearchParams<{ name?: string; channel?: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.screen,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, opacity },
      ]}
    >
      <View style={styles.icon}>
        <Ionicons name="git-network" size={36} color={Colors.cyan} />
      </View>
      <Text style={styles.title}>Introduction approved</Text>
      <Text style={styles.body}>
        MyCircle never hosts chat. Messaging continues in each person’s preferred app
        {channel ? ` — ${channel} for ${name}` : ''}.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>
          {name} will hear from you outside the app. The requester is notified that you approved.
        </Text>
      </View>
      <PrimaryButton
        title="Done"
        onPress={() => router.replace('/(tabs)/introductions')}
        style={{ width: '100%', marginTop: 28 }}
      />
    </Animated.View>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.cyanSoft,
    borderWidth: 1,
    borderColor: Colors.cyan + '55',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  title: { color: Colors.text, fontSize: 26, fontWeight: '700' },
  body: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  card: {
    marginTop: 24,
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  cardText: { color: Colors.textSecondary, lineHeight: 20 },
});
