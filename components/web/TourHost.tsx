import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TOUR_STEPS, TourOverlay, WelcomeOverlay } from '@/components/web/CircleGuide';
import { First10kAward } from '@/components/web/First10kAward';
import { useApp } from '@/context/AppContext';

const TOPS: Record<string, number> = {
  circle: 188,
  rings: 210,
  discover: 248,
  ask: 248,
  introductions: 328,
  profile: 398,
};

/** Points the tour at Circle, Discover, Add, Introductions, and Profile. */
export function TourHost() {
  const router = useRouter();
  const { tourMode, tourStep, profile, startTour, dismissTour, setTourStep, badgeCelebrate, dismissBadge } =
    useApp();
  const step = TOUR_STEPS[tourStep] || TOUR_STEPS[0];

  useEffect(() => {
    if (tourMode !== 'tour') return;
    router.push(step.route as '/');
  }, [tourMode, tourStep, step.route, router]);

  if (badgeCelebrate) {
    const name = profile.name?.trim().split(/\s+/)[0] || 'You';
    return <First10kAward name={name} onDone={dismissBadge} />;
  }

  if (tourMode === 'welcome') {
    const name = profile.name?.trim().split(/\s+/)[0] || 'there';
    return (
      <WelcomeOverlay
        name={name}
        onTour={startTour}
        onSkip={dismissTour}
      />
    );
  }

  if (tourMode !== 'tour') return null;

  const atBottom = step.id === 'add';

  return (
    <View style={styles.layer} pointerEvents="box-none">
      <View style={[styles.anchor, atBottom ? styles.bottom : { top: TOPS[step.id] ?? 240 }]} pointerEvents="auto">
        <View style={styles.arrow} />
        <TourOverlay
          step={tourStep}
          onBack={() => setTourStep(Math.max(0, tourStep - 1))}
          onNext={() => setTourStep(Math.min(TOUR_STEPS.length - 1, tourStep + 1))}
          onClose={dismissTour}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
  },
  anchor: {
    position: 'absolute',
    left: 276,
    width: 380,
  },
  bottom: { bottom: 28, top: undefined },
  arrow: {
    position: 'absolute',
    left: -7,
    top: 28,
    width: 14,
    height: 14,
    backgroundColor: '#0C0C16',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
    transform: [{ rotate: '45deg' }],
  },
});
