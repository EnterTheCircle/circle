import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/ui';
import { ME } from '@/constants/mockData';
import { Colors, Radii } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { signOut as authSignOut } from '@/lib/circleAuth';

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
  const { pendingIntroCount, profile, unreadCount, signOut } = useApp();

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'YO';

  const onSignOut = async () => {
    await authSignOut();
    await signOut();
    router.replace('/signup');
  };

  return (
    <View style={styles.rail}>
      <Pressable onPress={() => router.push('/')} style={styles.brandRow}>
        <Logo size={28} compact />
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
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <Ionicons
                  name={item.icon}
                  size={17}
                  color={active ? '#C4B5FD' : Colors.textMuted}
                />
              </View>
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
        <Avatar initials={initials} photo={ME.photo} color={Colors.accent} size={36} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.userName} numberOfLines={1}>
            {profile.name}
          </Text>
          <Text style={styles.userMeta}>
            {unreadCount > 0 ? `${unreadCount} updates` : 'Your circle'}
          </Text>
        </View>
      </Pressable>

      <Pressable style={styles.signOut} onPress={onSignOut}>
        <Ionicons name="log-out-outline" size={15} color={Colors.textMuted} />
        <Text style={styles.signOutTxt}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 260,
    backgroundColor: '#07070D',
    borderRightWidth: 1,
    borderRightColor: 'rgba(167,139,250,0.14)',
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  brandRow: { marginBottom: 2 },
  tagline: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 10,
    marginBottom: 24,
    lineHeight: 17,
  },
  nav: { gap: 6 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemHover: { backgroundColor: 'rgba(255,255,255,0.04)' },
  itemActive: {
    backgroundColor: 'rgba(139,92,246,0.14)',
    borderColor: 'rgba(167,139,250,0.35)',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  iconWrapActive: { backgroundColor: 'rgba(167,139,250,0.18)' },
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
    paddingVertical: 13,
    marginBottom: 14,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.35,
    shadowRadius: 12,
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
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  signOutTxt: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
});
