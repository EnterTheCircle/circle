import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/ui';
import { ME } from '@/constants/mockData';
import { Colors, Radii } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

const NAV: {
  href: string;
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  match: (path: string) => boolean;
}[] = [
  {
    href: '/',
    label: 'Circle',
    hint: 'Your universe',
    icon: 'planet-outline',
    match: (p) => p === '/' || p === '/index',
  },
  {
    href: '/discover',
    label: 'Discover',
    hint: 'Find who you need',
    icon: 'compass-outline',
    match: (p) => p.includes('discover'),
  },
  {
    href: '/introductions',
    label: 'Introductions',
    hint: 'Approve warm asks',
    icon: 'git-network-outline',
    match: (p) => p.includes('introductions'),
  },
  {
    href: '/profile',
    label: 'Profile',
    hint: 'You & preferences',
    icon: 'person-outline',
    match: (p) => p.includes('profile') || p.includes('privacy') || p.includes('notification'),
  },
];

export function WebSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { pendingIntroCount, profile, unreadCount } = useApp();

  return (
    <View style={styles.rail}>
      <Pressable onPress={() => router.push('/')}>
        <Logo size={30} />
      </Pressable>
      <Text style={styles.tagline}>Need someone? Ask your circle.</Text>

      <View style={styles.nav}>
        {NAV.map((item) => {
          const active = item.match(pathname);
          const badge = item.label === 'Introductions' ? pendingIntroCount : 0;
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as any)}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemHover,
                active && styles.itemActive,
              ]}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={active ? Colors.accent : Colors.textMuted}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{item.label}</Text>
                <Text style={styles.itemHint}>{item.hint}</Text>
              </View>
              {badge > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <Pressable style={styles.connect} onPress={() => router.push('/connect')}>
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.connectText}>Connect</Text>
      </Pressable>

      <Pressable style={styles.user} onPress={() => router.push('/profile')}>
        <Avatar initials="SK" photo={ME.photo} color={Colors.accent} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName} numberOfLines={1}>
            {profile.name}
          </Text>
          <Text style={styles.userMeta}>
            {unreadCount > 0 ? `${unreadCount} updates` : 'Your circle'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 248,
    backgroundColor: '#08080F',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  tagline: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 10,
    marginBottom: 22,
    lineHeight: 17,
  },
  nav: { gap: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: Radii.md,
  },
  itemHover: { backgroundColor: 'rgba(255,255,255,0.04)' },
  itemActive: {
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.28)',
  },
  itemLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },
  itemLabelActive: { color: Colors.text },
  itemHint: { color: Colors.textMuted, fontSize: 11, marginTop: 1 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  connect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accentStrong,
    borderRadius: Radii.md,
    paddingVertical: 12,
    marginBottom: 16,
  },
  connectText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  userName: { color: Colors.text, fontWeight: '700', fontSize: 13 },
  userMeta: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
});
