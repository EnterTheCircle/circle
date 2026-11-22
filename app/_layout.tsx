import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider, useApp } from '@/context/AppContext';
import { Toast } from '@/components/ui';
import { WebSidebar } from '@/components/web/WebSidebar';
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

function SplashController() {
  const { onboardingReady } = useApp();
  useEffect(() => {
    if (onboardingReady) SplashScreen.hideAsync();
  }, [onboardingReady]);
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
  const { onboardingReady, hasSignedUp, hasCompletedHowTo } = useApp();

  if (!onboardingReady) {
    return <View style={{ flex: 1, backgroundColor: Colors.bg }} />;
  }

  const showSidebar = Platform.OS === 'web' && hasSignedUp && hasCompletedHowTo;

  if (showSidebar) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Colors.bg }}>
        <WebSidebar />
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppStack />
        </View>
      </View>
    );
  }

  return <AppStack />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <View style={{ flex: 1, backgroundColor: Colors.bg }}>
          <StatusBar style="light" />
          <SplashController />
          <RootNavigator />
          <ToastHost />
        </View>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
