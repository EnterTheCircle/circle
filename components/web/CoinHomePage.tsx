import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radii } from '@/constants/theme';

const AVATAR = require('../../assets/images/coin/avatar.jpg');

type Phase = 'landing' | 'story' | 'auth' | 'discover';

const NODES = [
  { angle: 18, r: 0.28, size: 10 },
  { angle: 62, r: 0.38, size: 14 },
  { angle: 110, r: 0.32, size: 11 },
  { angle: 155, r: 0.42, size: 16 },
  { angle: 200, r: 0.3, size: 12 },
  { angle: 245, r: 0.4, size: 15 },
  { angle: 290, r: 0.34, size: 11 },
  { angle: 335, r: 0.36, size: 13 },
  { angle: 40, r: 0.52, size: 8 },
  { angle: 95, r: 0.55, size: 9 },
  { angle: 175, r: 0.5, size: 8 },
  { angle: 260, r: 0.54, size: 10 },
];

const STORY_STEPS = [
  {
    icon: 'planet-outline' as const,
    title: 'See who you actually know',
    body: 'Your world as paths — first connections, then the people through them. No follower theater.',
  },
  {
    icon: 'search-outline' as const,
    title: 'Find who you need',
    body: 'Lawyer. Designer. Operator. Search inside your trusted radius — not the open internet.',
  },
  {
    icon: 'hand-left-outline' as const,
    title: 'Ask for a warm intro',
    body: 'The mutual decides. If they vouch, you talk where they already live — their real chat apps.',
  },
];

type Phantom = {
  id: string;
  name: string;
  role: string;
  via: string;
  degree: 1 | 2;
  tags: string[];
  ghost?: boolean;
};

const PHANTOMS: Phantom[] = [
  {
    id: '1',
    name: 'Misha V.',
    role: 'Product Designer',
    via: 'Your connections',
    degree: 1,
    tags: ['design', 'figma', 'brand'],
  },
  {
    id: '2',
    name: 'James C.',
    role: 'Venture Capital',
    via: 'Your connections',
    degree: 1,
    tags: ['startups', 'markets', 'founder'],
  },
  {
    id: '3',
    name: 'Confidential',
    role: 'Details hidden',
    via: 'Through Misha',
    degree: 2,
    tags: ['lawyer', 'counsel', 'legal'],
    ghost: true,
  },
  {
    id: '4',
    name: 'Priya S.',
    role: 'Data Scientist',
    via: 'Through James',
    degree: 2,
    tags: ['ai', 'ml', 'engineer'],
  },
  {
    id: '5',
    name: 'Alex R.',
    role: 'Software Engineer',
    via: 'Your connections',
    degree: 1,
    tags: ['engineer', 'ai', 'builder'],
  },
  {
    id: '6',
    name: 'Confidential',
    role: 'Details hidden',
    via: 'Through Alex',
    degree: 2,
    tags: ['stylist', 'beauty', 'hair'],
    ghost: true,
  },
  {
    id: '7',
    name: 'Sarah K.',
    role: 'Brand Strategist',
    via: 'Your connections',
    degree: 1,
    tags: ['brand', 'marketing', 'creator'],
  },
  {
    id: '8',
    name: 'Olivia M.',
    role: 'Real Estate',
    via: 'Through Sarah',
    degree: 2,
    tags: ['real estate', 'apartment', 'broker'],
  },
  {
    id: '9',
    name: 'Chris N.',
    role: 'Chef',
    via: 'Through Misha',
    degree: 2,
    tags: ['chef', 'food', 'restaurant'],
  },
  {
    id: '10',
    name: 'Confidential',
    role: 'Details hidden',
    via: 'Through James',
    degree: 2,
    tags: ['founder', 'ceo', 'operator'],
    ghost: true,
  },
];

/**
 * Web marketing funnel only — does not open the native app orbit.
 * landing → story → dummy auth → phantom discover
 */
export default function CoinHomePage() {
  const { width, height } = useWindowDimensions();
  const [phase, setPhase] = useState<Phase>('landing');
  const [storyIndex, setStoryIndex] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const entering = useRef(false);

  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const expand = useRef(new Animated.Value(0)).current;
  const fadeUi = useRef(new Animated.Value(1)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const nodePop = useRef(new Animated.Value(0)).current;
  const storyFade = useRef(new Animated.Value(1)).current;

  const stage = Math.min(width, height) * 0.92;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 42000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2000,
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

  useEffect(() => {
    if (phase !== 'story') return;
    storyFade.setValue(0);
    Animated.timing(storyFade, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [storyIndex, phase, storyFade]);

  const results = useMemo(() => {
    const q = submitted.trim().toLowerCase();
    if (!q) return PHANTOMS.slice(0, 6);
    return PHANTOMS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.via.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }, [submitted]);

  const startEnter = () => {
    if (entering.current || phase !== 'landing') return;
    entering.current = true;

    Animated.parallel([
      Animated.timing(fadeUi, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(expand, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(nodePop, {
        toValue: 1,
        duration: 800,
        delay: 160,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(flash, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(flash, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setPhase('story');
      entering.current = false;
    });
  };

  const nextStory = () => {
    if (storyIndex < STORY_STEPS.length - 1) setStoryIndex((i) => i + 1);
    else setPhase('auth');
  };

  const dummyEnter = () => {
    if (username.trim().length < 2 || password.trim().length < 2) return;
    setPhase('discover');
  };

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const ringScale = Animated.multiply(
    pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] }),
    expand.interpolate({ inputRange: [0, 1], outputRange: [1, 2.35] })
  );
  const ringOpacity = expand.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.55, 0.9, 0],
  });
  const coreScale = Animated.add(
    pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }),
    expand.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] })
  );

  if (phase === 'story') {
    const step = STORY_STEPS[storyIndex];
    return (
      <View style={styles.page}>
        <OrbitBackdrop
          stage={stage * 0.7}
          spin={spin}
          pulse={pulse}
          expand={expand}
          nodePop={nodePop}
          muted
        />
        <Animated.View style={[styles.storyWrap, { opacity: storyFade }]}>
          <Text style={styles.storyKicker}>
            How it works · {storyIndex + 1}/{STORY_STEPS.length}
          </Text>
          <View style={styles.storyIcon}>
            <Ionicons name={step.icon} size={32} color="#22D3EE" />
          </View>
          <Text style={styles.storyTitle}>{step.title}</Text>
          <Text style={styles.storyBody}>{step.body}</Text>
          <View style={styles.dots}>
            {STORY_STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === storyIndex && styles.dotOn]} />
            ))}
          </View>
          <Pressable onPress={nextStory} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
            <Text style={styles.ctaTxt}>
              {storyIndex < STORY_STEPS.length - 1 ? 'Next' : 'Get started'}
            </Text>
          </Pressable>
          <Pressable onPress={() => setPhase('auth')} style={styles.skip}>
            <Text style={styles.skipTxt}>Skip</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  if (phase === 'auth') {
    const can = username.trim().length >= 2 && password.trim().length >= 2;
    return (
      <View style={styles.page}>
        <View style={styles.authCard}>
          <Image source={AVATAR} style={styles.authMark} />
          <Text style={styles.authBrand}>CIRCLE</Text>
          <Text style={styles.authTitle}>Enter the circle</Text>
          <Text style={styles.authSub}>Demo access — any username & password works.</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#64748B"
            secureTextEntry
            style={styles.input}
            onSubmitEditing={dummyEnter}
          />
          <Pressable
            onPress={dummyEnter}
            disabled={!can}
            style={({ pressed }) => [
              styles.cta,
              styles.ctaFull,
              !can && styles.ctaDisabled,
              pressed && can && styles.ctaPressed,
            ]}
          >
            <Text style={styles.ctaTxt}>Enter</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === 'discover') {
    return (
      <View style={styles.discoverPage}>
        <View style={styles.discoverTop}>
          <View style={styles.navBrand}>
            <Image source={AVATAR} style={styles.navMark} />
            <Text style={styles.navWord}>CIRCLE</Text>
          </View>
          <Text style={styles.hello}>Hi {username.trim() || 'there'}</Text>
        </View>

        <Text style={styles.discoverTitle}>Find people</Text>
        <Text style={styles.discoverSub}>
          Search your circle — roles, skills, or names. Some 2nds stay Confidential.
        </Text>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setSubmitted(t);
            }}
            placeholder="Try lawyer, designer, founder…"
            placeholderTextColor="#64748B"
            style={styles.searchInput}
            autoFocus
          />
          {query ? (
            <Pressable
              onPress={() => {
                setQuery('');
                setSubmitted('');
              }}
            >
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </Pressable>
          ) : null}
        </View>

        <ScrollView contentContainerStyle={styles.resultList} showsVerticalScrollIndicator={false}>
          {results.map((p) => (
            <View
              key={p.id}
              style={[styles.personCard, p.degree === 1 ? styles.personDirect : styles.personThrough]}
            >
              <View style={[styles.avatar, p.ghost && styles.avatarGhost]}>
                <Text style={styles.avatarTxt}>{p.ghost ? '?' : p.name[0]}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.personName, p.ghost && styles.personGhost]} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.personRole} numberOfLines={1}>
                  {p.role}
                </Text>
                <Text style={styles.personVia} numberOfLines={1}>
                  {p.via}
                </Text>
              </View>
              <Pressable style={styles.askBtn}>
                <Text style={styles.askTxt}>{p.degree === 1 ? 'Message' : 'Ask intro'}</Text>
              </Pressable>
            </View>
          ))}
          {results.length === 0 ? (
            <Text style={styles.empty}>No matches in this demo circle. Try “lawyer” or “design”.</Text>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  // Landing
  return (
    <View style={styles.page}>
      <OrbitBackdrop
        stage={stage}
        spin={spin}
        pulse={pulse}
        expand={expand}
        nodePop={nodePop}
        rotate={rotate}
        ringScale={ringScale}
        ringOpacity={ringOpacity}
        coreScale={coreScale}
      />

      <Animated.View
        pointerEvents={phase === 'landing' ? 'auto' : 'none'}
        style={[styles.overlay, { opacity: fadeUi }]}
      >
        <Text style={styles.brand}>CIRCLE</Text>
        <Text style={styles.line}>Your world, as paths — not posts.</Text>
        <Pressable onPress={startEnter} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
          <Text style={styles.ctaTxt}>Enter the circle</Text>
        </Pressable>
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]} />
    </View>
  );
}

function OrbitBackdrop({
  stage,
  spin,
  pulse,
  expand,
  nodePop,
  rotate,
  ringScale,
  ringOpacity,
  coreScale,
  muted,
}: {
  stage: number;
  spin: Animated.Value;
  pulse: Animated.Value;
  expand: Animated.Value;
  nodePop: Animated.Value;
  rotate?: Animated.AnimatedInterpolation<string>;
  ringScale?: Animated.AnimatedInterpolation<number> | Animated.Value;
  ringOpacity?: Animated.AnimatedInterpolation<number> | Animated.Value;
  coreScale?: Animated.AnimatedInterpolation<number> | Animated.Value;
  muted?: boolean;
}) {
  const rot =
    rotate ??
    spin.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  const rScale =
    ringScale ??
    pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.03],
    });
  const rOp =
    ringOpacity ??
    (muted
      ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.28] })
      : new Animated.Value(0.5));
  const cScale =
    coreScale ??
    pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.05],
    });

  return (
    <View style={[styles.stage, { width: stage, height: stage, opacity: muted ? 0.35 : 1 }]}>
      <Animated.View
        style={[
          styles.ring,
          styles.ringOuter,
          { opacity: rOp, transform: [{ rotate: rot }, { scale: rScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ringMid,
          {
            opacity: rOp,
            transform: [
              {
                rotate: spin.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-360deg'],
                }),
              },
              { scale: rScale },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ringInner,
          { opacity: rOp, transform: [{ rotate: rot }, { scale: rScale }] },
        ]}
      />

      {NODES.map((n, i) => {
        const rad = (n.angle * Math.PI) / 180;
        const dist = (stage / 2) * n.r;
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist;
        const stretch = 1.7 + (i % 3) * 0.12;
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
                  outputRange: muted ? [0.25, 0.35] : [0.45, 0.95],
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

      <Animated.View style={[styles.core, { transform: [{ scale: cScale }] }]}>
        <Image source={AVATAR} style={styles.coreImg} />
      </Animated.View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaFull: { width: '100%', marginTop: 8 },
  ctaDisabled: { opacity: 0.35 },
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
  storyWrap: {
    zIndex: 2,
    alignItems: 'center',
    paddingHorizontal: 36,
    maxWidth: 480,
  },
  storyKicker: {
    color: '#22D3EE',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 22,
  },
  storyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34,211,238,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  storyTitle: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  storyBody: {
    color: '#94A3B8',
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'center',
    marginBottom: 28,
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(148,163,184,0.35)',
  },
  dotOn: { backgroundColor: '#22D3EE', width: 22 },
  skip: { marginTop: 18 },
  skipTxt: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  authCard: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    borderRadius: Radii.xl,
    padding: 28,
    gap: 12,
    alignItems: 'center',
    zIndex: 2,
  },
  authMark: { width: 48, height: 48, borderRadius: 24, marginBottom: 4 },
  authBrand: {
    color: '#F8FAFC',
    fontWeight: '900',
    letterSpacing: 4,
    fontSize: 14,
  },
  authTitle: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  authSub: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(2,6,23,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#F8FAFC',
    fontSize: 16,
  },
  discoverPage: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 24,
  },
  discoverTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navMark: { width: 28, height: 28, borderRadius: 14 },
  navWord: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
  },
  hello: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  discoverTitle: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  discoverSub: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 22,
    maxWidth: 520,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    borderRadius: Radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 20,
    maxWidth: 560,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    paddingVertical: 12,
  },
  resultList: { paddingBottom: 40, gap: 10, maxWidth: 640 },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  personDirect: {
    backgroundColor: 'rgba(34,211,238,0.06)',
    borderColor: 'rgba(34,211,238,0.18)',
  },
  personThrough: {
    backgroundColor: 'rgba(148,163,184,0.06)',
    borderColor: 'rgba(148,163,184,0.16)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(34,211,238,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGhost: { backgroundColor: 'rgba(100,116,139,0.35)' },
  avatarTxt: { color: '#F8FAFC', fontWeight: '800', fontSize: 16 },
  personName: { color: '#F8FAFC', fontWeight: '700', fontSize: 15 },
  personGhost: { fontStyle: 'italic', color: '#CBD5E1' },
  personRole: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  personVia: { color: '#22D3EE', fontSize: 11, fontWeight: '600', marginTop: 3 },
  askBtn: {
    borderWidth: 1,
    borderColor: 'rgba(248,250,252,0.2)',
    borderRadius: Radii.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  askTxt: { color: '#F8FAFC', fontSize: 12, fontWeight: '700' },
  empty: { color: '#64748B', marginTop: 24, fontSize: 14 },
});
