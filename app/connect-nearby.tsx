import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, PrimaryButton } from '@/components/ui';
import { NEARBY_PEOPLE, getPerson } from '@/constants/mockData';
import { Colors, Radii, Spacing } from '@/constants/theme';

export default function ConnectNearby() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [scanning, setScanning] = useState(true);
  const pulse = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    const t = setTimeout(() => setScanning(false), 1800);
    return () => clearTimeout(t);
  }, [pulse]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={22} color={Colors.text} />
        <Text style={styles.backText}>Connect</Text>
      </Pressable>

      <Text style={styles.title}>Finding nearby people</Text>
      <Text style={styles.sub}>Proximity discovery · simulated</Text>

      <View style={styles.radar}>
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.45] }),
              transform: [
                {
                  scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }),
                },
              ],
            },
          ]}
        />
        <View style={styles.core}>
          <Ionicons name="wifi" size={28} color={Colors.accent} />
        </View>
      </View>

      {scanning ? (
        <Text style={styles.scanning}>Scanning for people next to you…</Text>
      ) : (
        <View style={{ width: '100%' }}>
          {NEARBY_PEOPLE.map((p) => {
            const person = getPerson(p.id);
            return (
              <Pressable
                key={p.id}
                style={styles.person}
                onPress={() =>
                  router.push({
                    pathname: '/connect-success',
                    params: { name: p.name, method: 'Tap to Connect' },
                  })
                }
              >
                <Avatar
                  initials={person?.initials || p.name.split(' ').map((n) => n[0]).join('')}
                  color={person?.color || Colors.cyan}
                  photo={person?.photo}
                  size={52}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.personName}>{p.name}</Text>
                  <Text style={styles.personMeta}>{p.distance}</Text>
                </View>
                <Text style={styles.cta}>Connect</Text>
              </Pressable>
            );
          })}
          <PrimaryButton title="Done" variant="ghost" onPress={() => router.back()} style={{ marginTop: 8 }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 18 },
  backText: { color: Colors.text, marginLeft: 2, fontWeight: '500' },
  title: { color: Colors.text, fontSize: 24, fontWeight: '700' },
  sub: { color: Colors.textMuted, marginTop: 4, marginBottom: 24 },
  radar: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  ring: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.accentSoft,
  },
  core: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanning: { color: Colors.textSecondary },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  personName: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  personMeta: { color: Colors.cyan, fontSize: 12, marginTop: 2 },
  cta: { color: Colors.accent, fontWeight: '700' },
});
