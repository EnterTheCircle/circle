import React from 'react';
import { Platform, View } from 'react-native';
import { Slot, Tabs } from 'expo-router';
import { FloatingTabBar } from '@/components/FloatingTabBar';
import { Colors } from '@/constants/theme';
import { useIsNarrowWeb } from '@/lib/useWebLayout';

export default function TabLayout() {
  const narrowWeb = useIsNarrowWeb();

  // Wide web: sidebar in root layout; tab screens just fill the content pane.
  if (Platform.OS === 'web' && !narrowWeb) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        <Slot />
      </View>
    );
  }

  // Native + phone web: floating bottom tabs.
  return (
    <Tabs
      tabBar={() => <FloatingTabBar />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Circle' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="introductions" options={{ title: 'Introductions' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
