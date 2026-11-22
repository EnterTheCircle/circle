import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider, useApp } from '@/context/AppContext';
import { Toast } from '@/components/ui';
import { WebSidebar } from '@/components/web/WebSidebar';
import { TourHost } from '@/components/web/TourHost';
import { TOUR_STEPS } from '@/components/web/CircleGuide';
import { Colors } from '@/constants/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function ToastHost() {
  const { toast } = useApp();
  if (!toast) return null;
  return <Toast message={toast} />;
}

function SplashController({ fontsReady }: { fontsReady: boolean }) {
  const { onboardingReady } = useApp();
  useEffect(() => {
    if (onboardingReady && fontsReady) SplashScreen.hideAsync();
  }, [onboardingReady, fontsReady]);
  return null;
}

function AppStack() {
  const { hasSignedUp, hasCompletedHowTo } = useApp();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.bg },
        // Avoid RN Web default light gray card flash over the dark UI
        animation: 'fade',
      }}
    >
      {/* Public marketing — always available */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
      <Stack.Screen name="tokenomics" options={{ headerShown: false }} />
      <Stack.Screen name="circle-token" options={{ headerShown: false }} />
      <Stack.Screen name="join/[code]" options={{ headerShown: false }} />

      <Stack.Protected guard={!hasSignedUp}>
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={hasSignedUp && !hasCompletedHowTo}>
        <Stack.Screen name="how-to" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={hasSignedUp && hasCompletedHowTo}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="connect" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen
          name="notifications"
          options={{ title: 'Updates', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="saved"
          options={{ title: 'Remember for Later', headerBackTitle: 'Back' }}
        />
        <Stack.Screen name="person/[id]" options={{ title: 'Profile', headerBackTitle: 'Back' }} />
        <Stack.Screen
          name="connect-nearby"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="connect-picture"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="connect-keyword"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="connect-success"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="intro-success"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{ title: 'Edit Profile', presentation: 'modal' }}
        />
        <Stack.Screen
          name="notification-settings"
          options={{ title: 'Notification Preferences' }}
        />
        <Stack.Screen name="privacy-settings" options={{ title: 'Privacy & Discovery' }} />
      </Stack.Protected>
    </Stack>
  );
}

function RootNavigator() {
  const { onboardingReady, hasSignedUp, hasCompletedHowTo, tourMode, tourStep } = useApp();

  if (!onboardingReady) {
    return <View style={{ flex: 1, backgroundColor: Colors.bg }} />;
  }

  const showSidebar = Platform.OS === 'web' && hasSignedUp && hasCompletedHowTo;

  if (showSidebar) {
    const stepId = tourMode === 'tour' ? TOUR_STEPS[tourStep]?.id : undefined;
    const target =
      stepId === 'ask' ? 'discover' : stepId === 'introductions' ? 'introductions' : stepId;
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Colors.bg }}>
        <WebSidebar tourTarget={target} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppStack />
        </View>
        <TourHost />
      </View>
    );
  }

  return <AppStack />;
}

export default function RootLayout() {
  // Load icon fonts in the background — never block the whole app on web.
  // A stuck useFonts() was rendering a permanent blank screen on GitHub Pages.
  const [fontsReady] = useFonts({
    ...Ionicons.font,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <View style={{ flex: 1, backgroundColor: Colors.bg }}>
          <StatusBar style="light" />
          <SplashController fontsReady={fontsReady || Platform.OS === 'web'} />
          <RootNavigator />
          <ToastHost />
        </View>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
