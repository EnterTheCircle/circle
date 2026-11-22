import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radii } from '@/constants/theme';

const NATIVE = Platform.OS !== 'web';

export const TOUR_STEPS = [
  {
    id: 'circle' as const,
    route: '/',
    kicker: 'Circle',
    title: 'This is your orbit',
    body: 'You sit in the center. The Founder is your first connection. Every other atom is a + for someone you add. Yours, Through, and 3rd are the rings.',
  },
  {
    id: 'discover' as const,
    route: '/discover',
    kicker: 'Discover',
    title: 'Search who you need',
    body: 'Type a role — lawyer, stylist, founder. Circle looks through your 1st and 2nd, then you ask the mutual for a warm intro.',
    example: 'Try “lawyer”',
  },
  {
    id: 'add' as const,
    route: '/connect',
    kicker: 'Add',
    title: 'Your word adds people',
    body: 'Your identifier changes every 30 seconds. They type it to request you. You type theirs to connect. The daily link does the same, and it changes every day. Tap to add is phone only.',
  },
  {
    id: 'introductions' as const,
    route: '/introductions',
    kicker: 'Introductions',
    title: 'Warm asks live here',
    body: 'You are already connected with the Founder through Circle. New asks from your circle show up here for you to approve.',
  },
  {
    id: 'profile' as const,
    route: '/profile',
    kicker: 'Profile',
    title: 'Change your photo',
    body: 'Profile holds your name, First 10k badge, and photo. Tap the picture to upload your own, or reset to the generated one.',
  },
];

const STEPS = TOUR_STEPS;

export function WelcomeOverlay({
  name,
  onTour,
  onSkip,
}: {
  name: string;
  onTour: () => void;
  onSkip: () => void;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(18)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 520, useNativeDriver: NATIVE }),
      Animated.timing(rise, { toValue: 0, duration: 640, useNativeDriver: NATIVE }),
    ]).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ring, { toValue: 1, duration: 2200, useNativeDriver: NATIVE }),
        Animated.timing(ring, { toValue: 0, duration: 2200, useNativeDriver: NATIVE }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fade, rise, ring]);

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] });

  return (
    <View style={styles.scrim}>
      <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: rise }] }]}>
        <View style={styles.orbitWrap}>
          <Animated.View style={[styles.ring, styles.ringOuter, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
          <Animated.View style={[styles.ring, styles.ringInner, { opacity: ringOpacity }]} />
          <View style={styles.core} />
        </View>
        <Text style={styles.eyebrow}>First 10k</Text>
        <Text style={styles.welcome}>Welcome</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.lead}>
          You’re in the center. The Founder is already on your orbit, and every + is a seat for someone you trust.
        </Text>
        <Pressable style={styles.primary} onPress={onTour}>
          <Text style={styles.primaryTxt}>Show me how this works</Text>
        </Pressable>
        <Pressable style={styles.ghost} onPress={onSkip}>
          <Text style={styles.ghostTxt}>I’ll look around</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export function TourOverlay({
  step,
  onNext,
  onBack,
  onClose,
}: {
  step: number;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const item = STEPS[step];
  const last = step === STEPS.length - 1;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: NATIVE }).start();
  }, [step, fade]);

  return (
    <View pointerEvents="box-none">
      <Animated.View style={[styles.tourCard, { opacity: fade }]}>
        <View style={styles.tourTop}>
          <Text style={styles.stepCount}>
            {step + 1} / {STEPS.length}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>
        <Text style={styles.kicker}>{item.kicker}</Text>
        <Text style={styles.tourTitle}>{item.title}</Text>
        <Text style={styles.tourBody}>{item.body}</Text>
        {item.example ? (
          <View style={styles.example}>
            <Text style={styles.exampleTxt}>{item.example}</Text>
          </View>
        ) : null}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotOn]} />
          ))}
        </View>
        <View style={styles.tourActions}>
          {step > 0 ? (
            <Pressable style={styles.backBtn} onPress={onBack}>
              <Text style={styles.backTxt}>Back</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable style={styles.primary} onPress={last ? onClose : onNext}>
            <Text style={styles.primaryTxt}>{last ? 'Enter your circle' : 'Next'}</Text>
          </Pressable>
        </View>
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
    backgroundColor: 'rgba(2,2,8,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
    padding: 24,
  },
  card: {
    width: 440,
    maxWidth: '100%',
    backgroundColor: '#0C0C16',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
    paddingHorizontal: 32,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
  },
  orbitWrap: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 999,
  },
  ringOuter: {
    width: 88,
    height: 88,
    borderColor: 'rgba(34,211,238,0.7)',
  },
  ringInner: {
    width: 62,
    height: 62,
    borderColor: 'rgba(167,139,250,0.8)',
  },
  core: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#67E8F9',
  },
  eyebrow: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  welcome: {
    color: Colors.textMuted,
    fontSize: 15,
    marginTop: 14,
    letterSpacing: 0.4,
  },
  name: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 2,
    textAlign: 'center',
  },
  lead: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 22,
  },
  primary: {
    backgroundColor: Colors.accentStrong,
    borderRadius: Radii.full,
    paddingHorizontal: 22,
    paddingVertical: 12,
    minWidth: 180,
    alignItems: 'center',
  },
  primaryTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  ghost: { marginTop: 12, paddingVertical: 8 },
  ghostTxt: { color: Colors.textMuted, fontWeight: '600', fontSize: 13 },
  tourScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 24,
    zIndex: 40,
    backgroundColor: 'rgba(2,2,8,0.28)',
  },
  tourCard: {
    width: 380,
    maxWidth: '100%',
    backgroundColor: '#0C0C16',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
    padding: 22,
  },
  tourTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepCount: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  skip: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  kicker: {
    color: '#67E8F9',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 14,
  },
  tourTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 6, letterSpacing: -0.4 },
  tourBody: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 8 },
  example: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(34,211,238,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
  },
  exampleTxt: { color: '#67E8F9', fontWeight: '700', fontSize: 12 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)' },
  dotOn: { backgroundColor: '#C4B5FD', width: 16 },
  tourActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  backBtn: { paddingVertical: 10, paddingHorizontal: 8 },
  backTxt: { color: Colors.textSecondary, fontWeight: '700', fontSize: 14 },
});
