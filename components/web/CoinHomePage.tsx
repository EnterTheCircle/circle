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
  { angle: 12, r: 0.34, size: 11 },
  { angle: 48, r: 0.42, size: 14 },
  { angle: 86, r: 0.36, size: 10 },
  { angle: 128, r: 0.46, size: 15 },
  { angle: 168, r: 0.33, size: 12 },
  { angle: 210, r: 0.44, size: 13 },
  { angle: 252, r: 0.37, size: 11 },
  { angle: 294, r: 0.45, size: 14 },
  { angle: 336, r: 0.35, size: 10 },
  { angle: 70, r: 0.58, size: 8 },
  { angle: 160, r: 0.56, size: 9 },
  { angle: 250, r: 0.57, size: 8 },
  { angle: 320, r: 0.55, size: 9 },
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

const CHIPS = ['lawyer', 'designer', 'founder', 'engineer', 'stylist', 'chef'];

type Phantom = {
  id: string;
  name: string;
  role: string;
  via: string;
  degree: 1 | 2;
  tags: string[];
  ghost?: boolean;
  color: string;
};

const PHANTOMS: Phantom[] = [
  { id: '1', name: 'Misha V.', role: 'Product Designer', via: 'Your connections', degree: 1, tags: ['design', 'figma', 'brand', 'designer'], color: '#22D3EE' },
  { id: '2', name: 'James C.', role: 'Venture Capital', via: 'Your connections', degree: 1, tags: ['startups', 'markets', 'founder'], color: '#67E8F9' },
  { id: '3', name: 'Confidential', role: 'Details hidden', via: 'Through Misha', degree: 2, tags: ['lawyer', 'counsel', 'legal'], ghost: true, color: '#64748B' },
  { id: '4', name: 'Priya S.', role: 'Data Scientist', via: 'Through James', degree: 2, tags: ['ai', 'ml', 'engineer'], color: '#38BDF8' },
  { id: '5', name: 'Alex R.', role: 'Software Engineer', via: 'Your connections', degree: 1, tags: ['engineer', 'ai', 'builder'], color: '#2DD4BF' },
  { id: '6', name: 'Confidential', role: 'Details hidden', via: 'Through Alex', degree: 2, tags: ['stylist', 'beauty', 'hair'], ghost: true, color: '#64748B' },
  { id: '7', name: 'Sarah K.', role: 'Brand Strategist', via: 'Your connections', degree: 1, tags: ['brand', 'marketing', 'creator', 'designer'], color: '#A5F3FC' },
  { id: '8', name: 'Olivia M.', role: 'Real Estate', via: 'Through Sarah', degree: 2, tags: ['real estate', 'apartment', 'broker'], color: '#5EEAD4' },
  { id: '9', name: 'Chris N.', role: 'Chef', via: 'Through Misha', degree: 2, tags: ['chef', 'food', 'restaurant'], color: '#67E8F9' },
  { id: '10', name: 'Confidential', role: 'Details hidden', via: 'Through James', degree: 2, tags: ['founder', 'ceo', 'operator'], ghost: true, color: '#64748B' },
];

/** Web marketing funnel — landing → story → demo auth → phantom search */
export default function CoinHomePage() {
  const { width, height } = useWindowDimensions();
  const [phase, setPhase] = useState<Phase>('landing');
  const [storyIndex, setStoryIndex] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [selected, setSelected] = useState<Phantom | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const entering = useRef(false);

  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const expand = useRef(new Animated.Value(0)).current;
  const fadeUi = useRef(new Animated.Value(1)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const storyFade = useRef(new Animated.Value(1)).current;

  // Orbit sits behind UI — sized so it doesn't fight the copy
  const stage = Math.min(width * 0.78, height * 0.72, 720);

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 52000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2400,
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
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [storyIndex, phase, storyFade]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const results = useMemo(() => {
    const q = submitted.trim().toLowerCase();
    if (!q) return PHANTOMS;
    return PHANTOMS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.via.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }, [submitted]);

  useEffect(() => {
    if (results.length === 0) setSelected(null);
    else if (!selected || !results.some((r) => r.id === selected.id)) setSelected(results[0]);
  }, [results, selected]);

  const startEnter = () => {
    if (entering.current || phase !== 'landing') return;
    entering.current = true;

    Animated.parallel([
      Animated.timing(fadeUi, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(expand, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(flash, { toValue: 0.85, duration: 220, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 650, useNativeDriver: true }),
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

  const runSearch = (q: string) => {
    setQuery(q);
    setSubmitted(q);
  };

  if (phase === 'story') {
    const step = STORY_STEPS[storyIndex];
    return (
      <View style={styles.page}>
        <Orbit
          stage={stage * 0.85}
          spin={spin}
          pulse={pulse}
          expand={expand}
          muted
          showCore
        />
        <Animated.View style={[styles.storyWrap, { opacity: storyFade }]}>
          <Text style={styles.storyKicker}>
            How it works · {storyIndex + 1} / {STORY_STEPS.length}
          </Text>
          <View style={styles.storyIcon}>
            <Ionicons name={step.icon} size={30} color="#22D3EE" />
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
          <Text style={styles.authSub}>Demo access — any username and password works.</Text>
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
    const wide = width >= 960;
    return (
      <View style={styles.discoverPage}>
        <View style={styles.discoverInner}>
          <View style={styles.discoverTop}>
            <View style={styles.navBrand}>
              <Image source={AVATAR} style={styles.navMark} />
              <Text style={styles.navWord}>CIRCLE</Text>
            </View>
            <View style={styles.helloPill}>
              <Text style={styles.hello}>Hi, {username.trim() || 'there'}</Text>
            </View>
          </View>

          <Text style={styles.discoverTitle}>Find people</Text>
          <Text style={styles.discoverSub}>
            Search your circle by role or skill. Friends-of-friends can appear as Confidential.
          </Text>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color="#22D3EE" />
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
              <Pressable onPress={() => runSearch('')}>
                <Ionicons name="close-circle" size={18} color="#64748B" />
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {CHIPS.map((c) => {
              const on = submitted.toLowerCase() === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => runSearch(on ? '' : c)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{c}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={[styles.discoverBody, wide && styles.discoverBodyWide]}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.resultList}
              showsVerticalScrollIndicator={false}
            >
              {([1, 2] as const).map((degree) => {
                const group = results.filter((p) => p.degree === degree);
                if (group.length === 0) return null;
                return (
                  <View key={degree} style={{ marginBottom: 18 }}>
                    <Text style={styles.sectionLabel}>
                      {degree === 1 ? 'Your connections' : 'Through your circle'}
                    </Text>
                    <View style={styles.cardGrid}>
                      {group.map((p) => {
                        const active = selected?.id === p.id;
                        return (
                          <Pressable
                            key={p.id}
                            onPress={() => setSelected(p)}
                            style={[
                              styles.personCard,
                              degree === 1 ? styles.personDirect : styles.personThrough,
                              active && styles.personActive,
                              wide && styles.personCardWide,
                            ]}
                          >
                            <View
                              style={[
                                styles.avatar,
                                { backgroundColor: p.color + '33' },
                                p.ghost && styles.avatarGhost,
                              ]}
                            >
                              <Text style={styles.avatarTxt}>{p.ghost ? '?' : p.name[0]}</Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <Text
                                style={[styles.personName, p.ghost && styles.personGhost]}
                                numberOfLines={1}
                              >
                                {p.name}
                              </Text>
                              <Text style={styles.personRole} numberOfLines={1}>
                                {p.role}
                              </Text>
                              <Text style={styles.personVia} numberOfLines={1}>
                                {p.via}
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
              {results.length === 0 ? (
                <Text style={styles.empty}>No matches. Try “lawyer” or “design”.</Text>
              ) : null}
            </ScrollView>

            {selected && wide ? (
              <View style={styles.detailPane}>
                <View
                  style={[
                    styles.detailAvatar,
                    { backgroundColor: selected.color + '33' },
                    selected.ghost && styles.avatarGhost,
                  ]}
                >
                  <Text style={styles.detailAvatarTxt}>
                    {selected.ghost ? '?' : selected.name[0]}
                  </Text>
                </View>
                <Text style={[styles.detailName, selected.ghost && styles.personGhost]}>
                  {selected.name}
                </Text>
                <Text style={styles.detailRole}>{selected.role}</Text>
                <Text style={styles.detailVia}>{selected.via}</Text>
                <Text style={styles.detailBody}>
                  {selected.ghost
                    ? 'Ghost mode — ask a mutual for an intro to learn more.'
                    : `In your demo circle as a ${selected.degree === 1 ? 'direct' : '2nd-degree'} path.`}
                </Text>
                <Pressable
                  style={styles.detailCta}
                  onPress={() =>
                    setToast(
                      selected.degree === 1
                        ? `Opening chat with ${selected.name.split(' ')[0]}…`
                        : `Intro requested via ${selected.via.replace('Through ', '')}`
                    )
                  }
                >
                  <Text style={styles.detailCtaTxt}>
                    {selected.degree === 1 ? 'Message' : 'Ask for intro'}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>

        {toast ? (
          <View style={styles.toast}>
            <Text style={styles.toastTxt}>{toast}</Text>
          </View>
        ) : null}

        {!wide && selected ? (
          <View style={styles.mobileBar}>
            <Text style={styles.mobileBarTxt} numberOfLines={1}>
              {selected.name} · {selected.via}
            </Text>
            <Pressable
              style={styles.mobileBarBtn}
              onPress={() =>
                setToast(selected.degree === 1 ? 'Opening chat…' : 'Intro requested')
              }
            >
              <Text style={styles.mobileBarBtnTxt}>
                {selected.degree === 1 ? 'Message' : 'Ask intro'}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  // Landing — copy on top / bottom, orbit only as backdrop (no collision)
  return (
    <View style={styles.page}>
      <Orbit
        stage={stage}
        spin={spin}
        pulse={pulse}
        expand={expand}
        showCore
      />

      <Animated.View
        pointerEvents={phase === 'landing' ? 'auto' : 'none'}
        style={[styles.landingUi, { opacity: fadeUi }]}
      >
        <View style={styles.landingTop}>
          <Text style={styles.brand}>CIRCLE</Text>
          <Text style={styles.line}>Your world, as paths — not posts.</Text>
        </View>

        <View style={styles.landingBottom}>
          <Pressable
            onPress={startEnter}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaTxt}>Enter the circle</Text>
            <Ionicons name="arrow-forward" size={18} color="#020617" style={{ marginLeft: 10 }} />
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]} />
    </View>
  );
}

function Orbit({
  stage,
  spin,
  pulse,
  expand,
  muted,
  showCore,
}: {
  stage: number;
  spin: Animated.Value;
  pulse: Animated.Value;
  expand: Animated.Value;
  muted?: boolean;
  showCore?: boolean;
}) {
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const reverse = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });
  const breathe = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.035],
  });
  const ringOp = muted
    ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.14, 0.22] })
    : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.65] });
  const fadeOut = expand.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: muted ? [0.45, 0.3, 0] : [1, 0.7, 0],
  });
  const outerScale = expand.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.85],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.stage,
        {
          width: stage,
          height: stage,
          opacity: fadeOut,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.ring,
          styles.ringOuter,
          {
            opacity: ringOp,
            transform: [{ rotate }, { scale: outerScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ringMid,
          {
            opacity: ringOp,
            transform: [{ rotate: reverse }, { scale: breathe }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ringInner,
          {
            opacity: ringOp,
            transform: [{ rotate }, { scale: breathe }],
          },
        ]}
      />

      {NODES.map((n, i) => {
        const rad = (n.angle * Math.PI) / 180;
        const dist = (stage / 2) * n.r;
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist;
        const stretch = 1.55 + (i % 4) * 0.08;
        return (
          <Animated.View
            key={i}
            style={[
              styles.node,
              {
                width: n.size,
                height: n.size,
                borderRadius: n.size / 2,
                opacity: muted ? 0.35 : 0.85,
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
                  { scale: breathe },
                ],
              },
            ]}
          />
        );
      })}

      {showCore ? (
        <Animated.View style={[styles.core, { transform: [{ scale: breathe }] }]}>
          <Image source={AVATAR} style={styles.coreImg} />
        </Animated.View>
      ) : null}
    </Animated.View>
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
    borderWidth: 1.5,
    borderRadius: 9999,
  },
  ringOuter: {
    width: '92%',
    height: '92%',
    borderColor: 'rgba(34,211,238,0.28)',
  },
  ringMid: {
    width: '68%',
    height: '68%',
    borderColor: 'rgba(148,163,184,0.22)',
    borderStyle: 'dashed',
  },
  ringInner: {
    width: '42%',
    height: '42%',
    borderColor: 'rgba(34,211,238,0.45)',
  },
  node: {
    position: 'absolute',
    backgroundColor: '#22D3EE',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.75,
    shadowRadius: 10,
  },
  core: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: 'rgba(248,250,252,0.9)',
    overflow: 'hidden',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.5,
    shadowRadius: 28,
    zIndex: 1,
  },
  coreImg: { width: '100%', height: '100%' },
  landingUi: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    paddingTop: 72,
    paddingBottom: 64,
    paddingHorizontal: 28,
    zIndex: 3,
  },
  landingTop: { alignItems: 'center' },
  landingBottom: { alignItems: 'center' },
  brand: {
    color: '#F8FAFC',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  line: {
    color: '#94A3B8',
    fontSize: 17,
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  cta: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 40,
    paddingVertical: 17,
    borderRadius: 999,
    shadowColor: '#22D3EE',
    shadowOpacity: 0.4,
    shadowRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaFull: { alignSelf: 'stretch', marginTop: 8 },
  ctaDisabled: { opacity: 0.35 },
  ctaPressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  ctaTxt: {
    color: '#020617',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  flash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(34,211,238,0.3)',
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
  },
  discoverInner: {
    flex: 1,
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 20,
  },
  discoverTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navMark: { width: 28, height: 28, borderRadius: 14 },
  navWord: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
  },
  helloPill: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hello: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  discoverTitle: {
    color: '#F8FAFC',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  discoverSub: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 18,
    maxWidth: 560,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.25)',
    borderRadius: Radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    paddingVertical: 12,
  },
  chipRow: { gap: 8, paddingBottom: 18 },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(15,23,42,0.8)',
  },
  chipOn: {
    borderColor: 'rgba(34,211,238,0.5)',
    backgroundColor: 'rgba(34,211,238,0.12)',
  },
  chipTxt: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  chipTxtOn: { color: '#22D3EE' },
  discoverBody: { flex: 1, minHeight: 0 },
  discoverBodyWide: { flexDirection: 'row', gap: 22 },
  resultList: { paddingBottom: 80 },
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  cardGrid: { gap: 10 },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  personCardWide: {},
  personDirect: {
    backgroundColor: 'rgba(34,211,238,0.06)',
    borderColor: 'rgba(34,211,238,0.18)',
  },
  personThrough: {
    backgroundColor: 'rgba(148,163,184,0.05)',
    borderColor: 'rgba(148,163,184,0.16)',
  },
  personActive: {
    borderColor: '#22D3EE',
    backgroundColor: 'rgba(34,211,238,0.12)',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGhost: { backgroundColor: 'rgba(100,116,139,0.35)' },
  avatarTxt: { color: '#F8FAFC', fontWeight: '800', fontSize: 16 },
  personName: { color: '#F8FAFC', fontWeight: '700', fontSize: 15 },
  personGhost: { fontStyle: 'italic', color: '#CBD5E1' },
  personRole: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  personVia: { color: '#22D3EE', fontSize: 11, fontWeight: '600', marginTop: 3 },
  detailPane: {
    width: 300,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    padding: 22,
  },
  detailAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  detailAvatarTxt: { color: '#F8FAFC', fontSize: 28, fontWeight: '800' },
  detailName: { color: '#F8FAFC', fontSize: 22, fontWeight: '800' },
  detailRole: { color: '#94A3B8', marginTop: 6, fontSize: 14 },
  detailVia: { color: '#22D3EE', marginTop: 8, fontWeight: '700', fontSize: 13 },
  detailBody: { color: '#94A3B8', marginTop: 14, lineHeight: 21, fontSize: 14 },
  detailCta: {
    marginTop: 20,
    backgroundColor: '#22D3EE',
    borderRadius: Radii.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  detailCtaTxt: { color: '#020617', fontWeight: '800', fontSize: 15 },
  empty: { color: '#64748B', marginTop: 24, fontSize: 14 },
  toast: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Radii.full,
  },
  toastTxt: { color: '#F8FAFC', fontWeight: '600', fontSize: 13 },
  mobileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.15)',
    backgroundColor: 'rgba(2,6,23,0.96)',
  },
  mobileBarTxt: { flex: 1, color: '#CBD5E1', fontSize: 13 },
  mobileBarBtn: {
    backgroundColor: '#22D3EE',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mobileBarBtnTxt: { color: '#020617', fontWeight: '800', fontSize: 13 },
});
