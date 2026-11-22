import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Badge, Card } from '@/components/ui';
import { NETWORK_STATS, channelLabel } from '@/constants/mockData';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import ProfileWeb from '@/components/web/ProfilePage';

export default function ProfileScreen() {
  if (Platform.OS === 'web') return <ProfileWeb />;
  return <ProfileNative />;
}

function ProfileNative() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, saved, account } = useApp();

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 130, paddingHorizontal: Spacing.lg }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Avatar initials={initials} color={Colors.accent} size={84} glow photo={profile.photo} />
        <Text style={styles.name}>{profile.name.toUpperCase()}</Text>
        {profile.first10k ? (
          <View style={styles.first10k}>
            <Text style={styles.first10kText}>First 10k</Text>
          </View>
        ) : null}
        <Text style={styles.quote}>“Your circle is your world.”</Text>
        <Text style={styles.meta}>
          {profile.location} · {profile.profession}
        </Text>
        {account.contactHandle ? (
          <Text style={styles.meta}>
            Prefers {channelLabel(account.contactChannel)} · {account.contactHandle}
          </Text>
        ) : null}
        <Text style={styles.bio}>{profile.bio}</Text>
        <View style={styles.interestRow}>
          {profile.interests.map((i) => (
            <View key={i} style={styles.interest}>
              <Text style={styles.interestText}>{i}</Text>
            </View>
          ))}
        </View>
        <View style={styles.stats}>
          <Stat value={String(NETWORK_STATS.direct)} label="Direct" />
          <View style={styles.statDivider} />
          <Stat value={String(NETWORK_STATS.extended)} label="Extended" />
          <View style={styles.statDivider} />
          <Stat value={String(saved.length)} label="Saved" />
        </View>
      </View>

      <MenuItem
        icon="people-outline"
        title="My Circle"
        subtitle="Explore your relationship globe"
        onPress={() => router.push('/')}
      />
      <MenuItem
        icon="bookmark-outline"
        title="My Saved People"
        subtitle={`${saved.length} people remembered`}
        onPress={() => router.push('/saved')}
      />
      <MenuItem
        icon="sparkles-outline"
        title="My Interests"
        subtitle={profile.interests.join(', ')}
        onPress={() => router.push('/edit-profile')}
      />
      <MenuItem
        icon="briefcase-outline"
        title="My Professional Information"
        subtitle={profile.profession}
        onPress={() => router.push('/edit-profile')}
      />
      <MenuItem
        icon="shield-outline"
        title="Privacy & Discovery Settings"
        subtitle="Control what your circle can see"
        onPress={() => router.push('/privacy-settings')}
      />
      <MenuItem
        icon="notifications-outline"
        title="Notification Preferences"
        subtitle="Useful updates only"
        onPress={() => router.push('/notification-settings')}
      />

      <Card style={{ marginTop: 18 }}>
        <Badge label="COMING SOON" tone="accent" />
        <Text style={styles.verifyTitle}>MYCIRCLE VERIFIED</Text>
        <Text style={styles.verifyBody}>
          Professional and business verification coming soon.
        </Text>
      </Card>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menu, pressed && { opacity: 0.8 }]}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={18} color={Colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  hero: { alignItems: 'center', marginBottom: 22 },
  name: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 14,
  },
  first10k: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(167,139,250,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.5)',
  },
  first10kText: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  quote: { color: Colors.textSecondary, fontStyle: 'italic', marginTop: 6, fontSize: 14 },
  meta: { color: Colors.textMuted, marginTop: 8, fontSize: 13 },
  bio: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  interestRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14 },
  interest: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  interestText: { color: Colors.accent, fontSize: 12, fontWeight: '600' },
  stats: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
  },
  statValue: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  menuSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  verifyTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 10,
  },
  verifyBody: { color: Colors.textSecondary, marginTop: 6, lineHeight: 20 },
});
