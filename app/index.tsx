import { Redirect } from 'expo-router';
import { useApp } from '@/context/AppContext';

/** Send `/` to the right place so we never land on an empty stack. */
export default function Index() {
  const { onboardingReady, hasSignedUp, hasCompletedHowTo } = useApp();

  if (!onboardingReady) return null;

  if (!hasSignedUp) return <Redirect href="/signup" />;
  if (!hasCompletedHowTo) return <Redirect href="/how-to" />;
  return <Redirect href="/(tabs)" />;
}
