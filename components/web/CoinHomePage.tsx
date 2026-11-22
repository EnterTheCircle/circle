import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccountState, useApp } from '@/context/AppContext';
import { CircleChannel } from '@/lib/circleAuth';
import { Radii } from '@/constants/theme';
import {
  requestPasswordReset,
  resetPassword,
  signIn,
  signUp,
} from '@/lib/circleAuth';
import { defaultAvatar } from '@/constants/mockData';

const AVATAR = require('../../assets/images/coin/avatar.jpg');
/** Native driver is flaky for multi-prop web animations — callbacks never fire. */
const NATIVE = Platform.OS !== 'web';

type Phase = 'landing' | 'story' | 'auth';
type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

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
    title: 'See who you actually know',
    body: 'Your world as paths — first connections, then the people through them. No follower theater.',
  },
  {
    title: 'Find who you need',
    body: 'Lawyer. Designer. Operator. Search inside your trusted radius — not the open internet.',
  },
  {
    title: 'Ask for a warm intro',
    body: 'The mutual decides. If they vouch, you talk where they already live — their real chat apps.',
  },
];

/**
 * Web funnel: landing → how it works → demo login → real atom / Circle app.
 */
export default function CoinHomePage() {
  const { width, height } = useWindowDimensions();
  const { enterFromLanding, updateProfile, showToast } = useApp();
  const [phase, setPhase] = useState<Phase>('landing');
  const [storyIndex, setStoryIndex] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [channel, setChannel] = useState<CircleChannel>('whatsapp');
  const [credential, setCredential] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const entering = useRef(false);

  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const expand = useRef(new Animated.Value(0)).current;
  const fadeUi = useRef(new Animated.Value(1)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const storyFade = useRef(new Animated.Value(1)).current;

  const stage = Math.min(width * 0.78, height * 0.72, 720);

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 52000,
        easing: Easing.linear,
        useNativeDriver: NATIVE,
      })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: NATIVE,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: NATIVE,
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
      useNativeDriver: NATIVE,
    }).start();
  }, [storyIndex, phase, storyFade]);

  const startEnter = () => {
    if (entering.current || phase !== 'landing') return;
    entering.current = true;

    let advanced = false;
    const goStory = () => {
      if (advanced) return;
      advanced = true;
      setPhase('story');
      entering.current = false;
    };

    Animated.parallel([
      Animated.timing(fadeUi, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE,
      }),
      Animated.timing(expand, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE,
      }),
      Animated.sequence([
        Animated.timing(flash, { toValue: 0.85, duration: 200, useNativeDriver: NATIVE }),
        Animated.timing(flash, { toValue: 0, duration: 500, useNativeDriver: NATIVE }),
      ]),
    ]).start(({ finished }) => {
      if (finished) goStory();
    });
    // Hard fallback so the funnel never sticks on landing (web Animated quirks)
    setTimeout(goStory, 700);
  };

  const nextStory = () => {
    if (storyIndex < STORY_STEPS.length - 1) setStoryIndex((i) => i + 1);
    else setPhase('auth');
  };

  const enterApp = async (
    displayName: string,
    handle: string,
    contactChannel: AccountState['contactChannel'] = 'email'
  ) => {
    const account: AccountState = {
      phone: contactChannel === 'whatsapp' || contactChannel === 'imessage' ? handle : '',
      contactsPermission: 'undetermined',
      contactChannel,
      contactHandle: handle,
    };
    updateProfile({ name: displayName, photo: defaultAvatar(displayName) });
    await AsyncStorage.removeItem('circle.guide.v2');
    await enterFromLanding(account);
    router.replace('/');
    setTimeout(() => {
      try {
        router.replace('/(tabs)');
      } catch {
        /* ignore */
      }
    }, 50);
  };

  const submitAuth = async () => {
    if (busy) return;
    setAuthError('');
    setAuthInfo('');
    setBusy(true);
    try {
      if (authMode === 'signin') {
        const res = await signIn({ username: email, password });
        if (!res.ok) {
          setAuthError(res.error);
          return;
        }
        await enterApp(
          res.session.name,
          res.session.credential || res.session.email,
          res.session.channel || 'email'
        );
        return;
      }
      if (authMode === 'signup') {
        const res = await signUp({
          firstName,
          lastName,
          username,
          password,
          channel,
          credential,
        });
        if (!res.ok) {
          setAuthError(res.error);
          return;
        }
        await enterApp(res.session.name, res.session.credential || '', res.session.channel || channel);
        return;
      }
      if (authMode === 'forgot') {
        const res = await requestPasswordReset(email);
        if (!res.ok) {
          setAuthError(res.error);
          return;
        }
        setAuthInfo(res.message);
        if (res.demoToken) {
          setResetToken(res.demoToken);
          setAuthMode('reset');
          setAuthInfo(
            `${res.message} Demo mode: use the code below to set a new password (email delivery comes next).`
          );
        }
        return;
      }
      if (authMode === 'reset') {
        const res = await resetPassword({ token: resetToken.trim(), password });
        if (!res.ok) {
          setAuthError(res.error);
          return;
        }
        setAuthInfo('Password updated. Sign in with your new password.');
        setPassword('');
        setAuthMode('signin');
      }
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'story') {
    const step = STORY_STEPS[storyIndex];
    return (
      <View style={styles.page}>
        <Orbit stage={stage * 0.85} spin={spin} pulse={pulse} expand={expand} muted showCore />
        <Animated.View style={[styles.storyWrap, { opacity: storyFade }]}>
          <Text style={styles.storyKicker}>
            How it works · {storyIndex + 1} / {STORY_STEPS.length}
          </Text>
          <View style={styles.storyIcon}>
            <Text style={styles.storyGlyph}>
              {storyIndex === 0 ? '◎' : storyIndex === 1 ? '⌕' : '↝'}
            </Text>
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
    const title =
      authMode === 'signin'
        ? 'Sign in'
        : authMode === 'signup'
          ? 'Create account'
          : authMode === 'forgot'
            ? 'Forgot password'
            : 'Reset password';
    const cta =
      authMode === 'signin'
        ? 'Sign in'
        : authMode === 'signup'
          ? 'Create account'
          : authMode === 'forgot'
            ? 'Send reset link'
            : 'Update password';

    const credentialHint =
      channel === 'linkedin'
        ? 'LinkedIn profile link'
        : channel === 'whatsapp'
          ? 'WhatsApp number'
          : channel === 'imessage'
            ? 'iMessage number'
            : channel === 'discord'
              ? 'Discord username'
              : 'Email address';

    return (
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.authScroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.authCard}>
          <Image source={AVATAR} style={styles.authMark} />
          <Text style={styles.authBrand}>CIRCLE</Text>
          <Text style={styles.authTitle}>{title}</Text>
          <Text style={styles.authSub}>
            {authMode === 'forgot'
              ? 'Enter your email and we’ll help you get back in.'
              : authMode === 'reset'
                ? 'Choose a new password for your account.'
                : 'Warm intros through people you already trust.'}
          </Text>

          {authMode === 'signin' || authMode === 'signup' ? (
            <View style={styles.authTabs}>
              <Pressable
                onPress={() => {
                  setAuthMode('signin');
                  setAuthError('');
                }}
                style={[styles.authTab, authMode === 'signin' && styles.authTabOn]}
              >
                <Text style={[styles.authTabTxt, authMode === 'signin' && styles.authTabTxtOn]}>
                  Sign in
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setAuthMode('signup');
                  setAuthError('');
                }}
                style={[styles.authTab, authMode === 'signup' && styles.authTabOn]}
              >
                <Text style={[styles.authTabTxt, authMode === 'signup' && styles.authTabTxtOn]}>
                  Sign up
                </Text>
              </Pressable>
            </View>
          ) : null}

          {authMode === 'signup' ? (
            <>
              <View style={styles.nameRow}>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  placeholderTextColor="#64748B"
                  autoCapitalize="words"
                  style={[styles.input, styles.nameInput]}
                />
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  placeholderTextColor="#64748B"
                  autoCapitalize="words"
                  style={[styles.input, styles.nameInput]}
                />
              </View>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                style={styles.input}
              />
            </>
          ) : null}

          {authMode === 'signin' || authMode === 'forgot' ? (
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={authMode === 'signin' ? 'Username' : 'Email'}
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              keyboardType={authMode === 'forgot' ? 'email-address' : 'default'}
              style={styles.input}
            />
          ) : null}

          {authMode === 'reset' ? (
            <TextInput
              value={resetToken}
              onChangeText={setResetToken}
              placeholder="Reset code"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              style={styles.input}
            />
          ) : null}

          {authMode !== 'forgot' ? (
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={authMode === 'reset' ? 'New password' : 'Password'}
              placeholderTextColor="#64748B"
              secureTextEntry
              style={styles.input}
              onSubmitEditing={authMode === 'signup' ? undefined : submitAuth}
            />
          ) : null}

          {authMode === 'signup' ? (
            <>
              <Text style={styles.fieldLabel}>How should people reach you?</Text>
              <View style={styles.channelRow}>
                {(
                  [
                    ['whatsapp', 'WhatsApp'],
                    ['imessage', 'iMessage'],
                    ['email', 'Email'],
                    ['linkedin', 'LinkedIn'],
                    ['discord', 'Discord'],
                  ] as const
                ).map(([key, label]) => (
                  <Pressable
                    key={key}
                    onPress={() => setChannel(key)}
                    style={[styles.channelPill, channel === key && styles.channelPillOn]}
                  >
                    <Text style={[styles.channelTxt, channel === key && styles.channelTxtOn]}>{label}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                value={credential}
                onChangeText={setCredential}
                placeholder={credentialHint}
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                keyboardType={
                  channel === 'whatsapp' || channel === 'imessage'
                    ? 'phone-pad'
                    : channel === 'email'
                      ? 'email-address'
                      : 'default'
                }
                style={styles.input}
              />
            </>
          ) : null}

          {authError ? <Text style={styles.authError}>{authError}</Text> : null}
          {authInfo ? <Text style={styles.authInfo}>{authInfo}</Text> : null}

          <Pressable
            onPress={submitAuth}
            disabled={busy}
            style={({ pressed }) => [
              styles.cta,
              styles.ctaFull,
              busy && styles.ctaDisabled,
              pressed && !busy && styles.ctaPressed,
            ]}
          >
            <Text style={styles.ctaTxt}>{busy ? 'Please wait…' : cta}</Text>
          </Pressable>

          {authMode === 'signin' ? (
            <Pressable
              onPress={() => {
                setAuthMode('forgot');
                setAuthError('');
                setAuthInfo('');
              }}
              style={styles.linkBtn}
            >
              <Text style={styles.linkTxt}>Forgot password?</Text>
            </Pressable>
          ) : null}

          {authMode === 'forgot' || authMode === 'reset' ? (
            <Pressable
              onPress={() => {
                setAuthMode('signin');
                setAuthError('');
                setAuthInfo('');
              }}
              style={styles.linkBtn}
            >
              <Text style={styles.linkTxt}>Back to sign in</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.page}>
      <Orbit stage={stage} spin={spin} pulse={pulse} expand={expand} showCore />

      <Animated.View
        pointerEvents={phase === 'landing' ? 'auto' : 'none'}
        style={[styles.landingUi, { opacity: fadeUi }]}
      >
        <View style={styles.landingTop}>
          <View style={styles.landingNav}>
            <Pressable
              onPress={() => router.push('/about')}
              style={({ pressed }) => [styles.navPill, pressed && styles.navPillPressed]}
            >
              <Text style={styles.navPillTxt}>About</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/tokenomics')}
              style={({ pressed }) => [styles.navPill, pressed && styles.navPillPressed]}
            >
              <Text style={styles.navPillTxt}>Tokenomics</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/circle-token')}
              style={({ pressed }) => [styles.navPill, styles.navPillAccent, pressed && styles.navPillPressed]}
            >
              <Text style={[styles.navPillTxt, styles.navPillTxtAccent]}>$CIRCLE</Text>
            </Pressable>
          </View>

          <Text style={styles.brandEyebrow}>ENTER THE</Text>
          <Text style={styles.brand}>
            CIR<Text style={styles.brandAccent}>CLE</Text>
          </Text>
          <View style={styles.brandRule} />
          <Text style={styles.line}>Your world, as paths — not posts.</Text>
        </View>

        <View style={styles.landingBottom}>
          <Pressable
            onPress={startEnter}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaTxt}>Enter the circle</Text>
            <Text style={styles.ctaArrow}>→</Text>
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
      style={[styles.stage, { width: stage, height: stage, opacity: fadeOut }]}
    >
      <Animated.View
        style={[
          styles.ring,
          styles.ringOuter,
          { opacity: ringOp, transform: [{ rotate }, { scale: outerScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ringMid,
          { opacity: ringOp, transform: [{ rotate: reverse }, { scale: breathe }] },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ringInner,
          { opacity: ringOp, transform: [{ rotate }, { scale: breathe }] },
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
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 28,
    zIndex: 3,
  },
  landingTop: { alignItems: 'center', paddingTop: 8 },
  landingNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  navPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.14)',
    backgroundColor: 'rgba(248,250,252,0.04)',
  },
  navPillAccent: {
    borderColor: 'rgba(34,211,238,0.35)',
    backgroundColor: 'rgba(34,211,238,0.08)',
  },
  navPillPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  navPillTxt: {
    color: 'rgba(226,232,240,0.72)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  navPillTxtAccent: { color: '#67E8F9' },
  landingBottom: { alignItems: 'center' },
  brandEyebrow: {
    color: '#67E8F9',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  brand: {
    color: '#F8FAFC',
    fontSize: 68,
    fontWeight: '200',
    letterSpacing: 16,
    marginBottom: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(34,211,238,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 28,
  },
  brandAccent: {
    color: '#A5F3FC',
    fontWeight: '800',
    letterSpacing: 16,
  },
  brandRule: {
    width: 56,
    height: 2,
    backgroundColor: 'rgba(34,211,238,0.55)',
    marginBottom: 16,
    borderRadius: 2,
  },
  line: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 26,
    letterSpacing: 0.3,
    fontWeight: '400',
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
    gap: 10,
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
  ctaArrow: {
    color: '#020617',
    fontSize: 18,
    fontWeight: '700',
    marginTop: -1,
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
  storyGlyph: {
    color: '#22D3EE',
    fontSize: 26,
    fontWeight: '600',
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
  authScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  authCard: {
    width: '100%',
    maxWidth: 480,
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
  authTabs: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 8,
    marginBottom: 4,
  },
  authTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    alignItems: 'center',
  },
  authTabOn: {
    borderColor: 'rgba(34,211,238,0.45)',
    backgroundColor: 'rgba(34,211,238,0.1)',
  },
  authTabTxt: { color: '#64748B', fontWeight: '700', fontSize: 13 },
  authTabTxtOn: { color: '#22D3EE' },
  nameRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
  nameInput: { flex: 1 },
  fieldLabel: {
    alignSelf: 'stretch',
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 4,
  },
  channelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignSelf: 'stretch' },
  channelPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.28)',
  },
  channelPillOn: { borderColor: 'rgba(34,211,238,0.55)', backgroundColor: 'rgba(34,211,238,0.12)' },
  channelTxt: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  channelTxtOn: { color: '#67E8F9' },
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
  authError: {
    alignSelf: 'stretch',
    color: '#F87171',
    fontSize: 13,
    lineHeight: 18,
  },
  authInfo: {
    alignSelf: 'stretch',
    color: '#67E8F9',
    fontSize: 12,
    lineHeight: 18,
  },
  linkBtn: { marginTop: 4, paddingVertical: 6 },
  linkTxt: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
});
