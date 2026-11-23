import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { First10kMedal } from '@/components/First10kMedal';
import { Colors } from '@/constants/theme';

const NATIVE = Platform.OS !== 'web';

/** One-time celebration when a new member earns First 10k. */
export function First10kAward({ name, onDone }: { name: string; onDone: () => void }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;
  const rise = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: NATIVE }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: NATIVE }),
      Animated.timing(rise, { toValue: 0, duration: 420, useNativeDriver: NATIVE }),
    ]).start();
  }, [fade, rise, scale]);

  return (
    <View style={styles.scrim}>
      <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: rise }] }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <First10kMedal size={92} />
        </Animated.View>
        <Text style={styles.kicker}>Earned</Text>
        <Text style={styles.title}>First 10k</Text>
        <Text style={styles.body}>
          {name}, you’re in the first 10,000. The medal now sits next to your name.
        </Text>
        <Pressable style={styles.btn} onPress={onDone}>
          <Text style={styles.btnTxt}>See your circle</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2,2,8,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: 24,
  },
  card: {
    width: 420,
    maxWidth: '100%',
    backgroundColor: '#0C0C16',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(246,211,122,0.45)',
    paddingHorizontal: 28,
    paddingVertical: 32,
    alignItems: 'center',
  },
  kicker: {
    color: '#F6D37A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 18,
  },
  title: { color: '#fff', fontSize: 36, fontWeight: '800', letterSpacing: -0.8, marginTop: 4 },
  body: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
    fontSize: 15,
  },
  btn: {
    marginTop: 22,
    backgroundColor: Colors.accentStrong,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  btnTxt: { color: '#fff', fontWeight: '800' },
});
