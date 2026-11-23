import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import { Colors, Radii } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

const TABS: {
  name: string;
  href: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: 'index', href: '/', label: 'Circle', icon: 'planet-outline', iconActive: 'planet' },
  {
    name: 'discover',
    href: '/discover',
    label: 'Discover',
    icon: 'compass-outline',
    iconActive: 'compass',
  },
  {
    name: 'introductions',
    href: '/introductions',
    label: 'Intros',
    icon: 'git-network-outline',
    iconActive: 'git-network',
  },
  {
    name: 'profile',
    href: '/profile',
    label: 'Profile',
    icon: 'person-outline',
    iconActive: 'person',
  },
];

/** Custom tab bar — uses Expo Router only (no navigation.emit). */
export function FloatingTabBar(_props?: unknown) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { pendingIntroCount } = useApp();

  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  const isActive = (tab: (typeof TABS)[number]) => {
    if (tab.name === 'index') {
      return pathname === '/' || pathname === '/index' || pathname.endsWith('/(tabs)');
    }
    return pathname.includes(tab.name);
  };

  const renderItem = (tab: (typeof TABS)[number]) => {
    const focused = isActive(tab);
    const showBadge = tab.name === 'introductions' && pendingIntroCount > 0;
    return (
      <Pressable
        key={tab.name}
        onPress={() => {
          if (tab.name === 'index') router.push('/');
          else router.push(tab.href as any);
        }}
        style={styles.item}
      >
        <View>
          <Ionicons
            name={focused ? tab.iconActive : tab.icon}
            size={22}
            color={focused ? Colors.accent : Colors.textMuted}
          />
          {showBadge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingIntroCount > 9 ? '9+' : pendingIntroCount}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.label, focused && { color: Colors.accent }]}>{tab.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <Pressable style={styles.plus} onPress={() => router.push('/connect')}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
      <View style={styles.bar}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        {left.map(renderItem)}
        <View style={styles.spacer} />
        {right.map(renderItem)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 8,
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 40,
  },
  bar: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: '#0B1220',
    overflow: 'hidden',
    paddingVertical: 10,
    paddingHorizontal: 6,
    zIndex: 20,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  spacer: { width: 64 },
  label: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -14,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800', lineHeight: 14 },
  plus: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: -30,
    zIndex: 30,
    backgroundColor: Colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.bg,
    shadowColor: Colors.accent,
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
});
