import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { AccountState, useApp } from '@/context/AppContext';

const AVATAR = require('../../assets/images/coin/avatar.jpg');

const NODES = [
  { angle: 18, r: 0.28, size: 10, delay: 0 },
  { angle: 62, r: 0.38, size: 14, delay: 80 },
  { angle: 110, r: 0.32, size: 11, delay: 140 },
  { angle: 155, r: 0.42, size: 16, delay: 40 },
  { angle: 200, r: 0.3, size: 12, delay: 120 },
  { angle: 245, r: 0.4, size: 15, delay: 60 },
  { angle: 290, r: 0.34, size: 11, delay: 160 },
  { angle: 335, r: 0.36, size: 13, delay: 20 },
  { angle: 40, r: 0.52, size: 8, delay: 100 },
  { angle: 95, r: 0.55, size: 9, delay: 180 },
  { angle: 175, r: 0.5, size: 8, delay: 90 },
  { angle: 260, r: 0.54, size: 10, delay: 150 },
];

/**
 * Web-only: one full-screen “Enter the circle” moment.
 * Tap → orbit animation → product. Native app unchanged.
 */
export default function CoinHomePage() {
  const { width, height } = useWindowDimensions();
  const { enterFromLanding, updateProfile, showToast } = useApp();
  const [phase, setPhase] = useState<'idle' | 'entering' | 'done'>('idle');
  const busy = useRef(false);

  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const expand = useRef(new Animated.Value(0)).current;
  const fadeUi = useRef(new Animated.Value(1)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const nodePop = useRef(new Animated.Value(0)).current;

  const stage = Math.min(width, height) * 0.92;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 48000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    spinLoop.start();
    pulseLoop.start();
    return () => {
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, [spin, pulse]);

  const enter = async () => {
    if (busy.current || phase !== 'idle') return;
    busy.current = true;
    setPhase('entering');

    Animated.parallel([
      Animated.timing(fadeUi, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(expand, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(nodePop, {
        toValue: 1,
        duration: 900,
        delay: 200,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(flash, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(flash, {
          toValue: 0,
          duration: 700,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(async () => {
      const account: AccountState = {
        phone: '',
        contactsPermission: 'undetermined',
        contactChannel: 'imessage',
        contactHandle: 'guest',
      };
      try {
        updateProfile({ name: 'You' });
        await enterFromLanding(account);
        setPhase('done');
        showToast('You’re in');
        router.replace('/');
      } finally {
        busy.current = false;
      }
    });
  };

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const ringScale = Animated.multiply(
    pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }),
    expand.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] })
  );
  const ringOpacity = expand.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0.55, 0.85, 0],
  });
  const coreScale = Animated.add(
    pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }),
    expand.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] })
  );

  return (
    <View style={styles.page}>
      <View style={[styles.stage, { width: stage, height: stage }]}>
        <Animated.View
          style={[
            styles.ring,
            styles.ringOuter,
            {
              opacity: ringOpacity,
              transform: [{ rotate }, { scale: ringScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ringMid,
            {
              opacity: ringOpacity,
              transform: [
                {
                  rotate: spin.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-360deg'],
                  }),
                },
                {
                  scale: Animated.multiply(
                    pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }),
                    expand.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] })
                  ),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ringInner,
            {
              opacity: ringOpacity,
              transform: [
                { rotate },
                {
                  scale: expand.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.55],
                  }),
                },
              ],
            },
          ]}
        />

        {NODES.map((n, i) => {
          const rad = (n.angle * Math.PI) / 180;
          const dist = (stage / 2) * n.r;
          const x = Math.cos(rad) * dist;
          const y = Math.sin(rad) * dist;
          const stretch = 1.75 + (i % 3) * 0.15;
          return (
            <Animated.View
              key={i}
              style={[
                styles.node,
                {
                  width: n.size,
                  height: n.size,
                  borderRadius: n.size / 2,
                  opacity: nodePop.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.45, 0.95],
                  }),
                  transform: [
                    {
                      translateX: expand.interpolate({
                        inputRange: [0, 1],
                        outputRange: [x, x * stretch],
                      }),
                    },
                    {
                      translateY: expand.interpolate({
                        inputRange: [0, 1],
                        outputRange: [y, y * stretch],
                      }),
                    },
                    {
                      scale: nodePop.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.4, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          );
        })}

        <Animated.View style={[styles.core, { transform: [{ scale: coreScale }] }]}>
          <Image source={AVATAR} style={styles.coreImg} />
        </Animated.View>
      </View>

      <Animated.View
        pointerEvents={phase === 'idle' ? 'auto' : 'none'}
        style={[styles.overlay, { opacity: fadeUi }]}
      >
        <Text style={styles.brand}>CIRCLE</Text>
        <Text style={styles.line}>Your world, as paths — not posts.</Text>
        <Pressable
          onPress={enter}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaTxt}>Enter the circle</Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[styles.flash, { opacity: flash }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stage: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 9999,
  },
  ringOuter: {
    width: '88%',
    height: '88%',
    borderColor: 'rgba(34,211,238,0.22)',
  },
  ringMid: {
    width: '64%',
    height: '64%',
    borderColor: 'rgba(148,163,184,0.2)',
    borderStyle: 'dashed',
  },
  ringInner: {
    width: '38%',
    height: '38%',
    borderColor: 'rgba(34,211,238,0.4)',
  },
  node: {
    position: 'absolute',
    backgroundColor: '#22D3EE',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  core: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(248,250,252,0.85)',
    overflow: 'hidden',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.45,
    shadowRadius: 24,
  },
  coreImg: { width: '100%', height: '100%' },
  overlay: {
    alignItems: 'center',
    paddingHorizontal: 28,
    zIndex: 2,
  },
  brand: {
    color: '#F8FAFC',
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 10,
    marginBottom: 14,
  },
  line: {
    color: '#94A3B8',
    fontSize: 17,
    marginBottom: 36,
    textAlign: 'center',
    maxWidth: 360,
    lineHeight: 24,
  },
  cta: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 44,
    paddingVertical: 18,
    borderRadius: 999,
    shadowColor: '#22D3EE',
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  ctaPressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  ctaTxt: {
    color: '#020617',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  flash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(34,211,238,0.28)',
    zIndex: 5,
  },
});
