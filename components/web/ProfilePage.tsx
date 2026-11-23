import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Glyph, GlyphName } from '@/components/Glyph';
import { Avatar, Badge, Card } from '@/components/ui';
import { NETWORK_STATS, channelLabel, defaultAvatar, initialsFromName } from '@/constants/mockData';
import { First10kMedal } from '@/components/First10kMedal';
import { Colors, Radii } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

function pickPhotoFile(onPicked: (dataUrl: string) => void) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onPicked(reader.result);
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

export default function ProfileWeb() {
  const router = useRouter();
  const { profile, saved, account, updateProfile, showToast } = useApp();
  const initials = initialsFromName(profile.name);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Account</Text>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.layout}>
        <View style={styles.hero}>
          <Pressable
            onPress={() =>
              pickPhotoFile((uri) => {
                updateProfile({ photo: uri });
                showToast('Photo updated');
              })
            }
            style={styles.avatarWrap}
          >
            <Avatar initials={initials} color={Colors.accent} size={96} glow photo={profile.photo} />
            <View style={styles.cameraBadge}>
              <Glyph name="camera" size={14} color="#fff" />
            </View>
          </Pressable>
          <Pressable
            onPress={() => {
              updateProfile({ photo: defaultAvatar(profile.name) });
              showToast('Using generated photo');
            }}
          >
            <Text style={styles.changePhoto}>Change photo · or reset to generated</Text>
          </Pressable>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}</Text>
            {profile.first10k ? <First10kMedal size={22} /> : null}
          </View>
          <Text style={styles.quote}>“Your circle is your world.”</Text>
          <Text style={styles.meta}>
            {profile.location ? `${profile.profession} in ${profile.location}` : profile.profession}
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

        <View style={styles.menuCol}>
          <MenuItem icon="planet" title="My Circle" subtitle="Explore your relationship globe" onPress={() => router.push('/')} />
          <MenuItem icon="bookmark" title="Saved people" subtitle={`${saved.length} remembered`} onPress={() => router.push('/saved')} />
          <MenuItem icon="edit" title="Edit profile" subtitle={profile.profession} onPress={() => router.push('/edit-profile')} />
          <MenuItem icon="shield" title="Privacy & discovery" subtitle="Control what your circle can see" onPress={() => router.push('/privacy-settings')} />
          <MenuItem icon="bell" title="Notifications" subtitle="Useful updates only" onPress={() => router.push('/notification-settings')} />
          <Card style={{ marginTop: 18 }}>
            <Badge label="COMING SOON" tone="accent" />
            <Text style={styles.verifyTitle}>MyCircle Verified</Text>
            <Text style={styles.verifyBody}>Professional and business verification coming soon.</Text>
          </Card>
        </View>
      </View>
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
  icon: GlyphName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menu, pressed && { opacity: 0.85 }]}>
      <View style={styles.menuIcon}>
        <Glyph name={icon} size={18} color={Colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      <View style={{ transform: [{ rotate: '180deg' }] }}>
        <Glyph name="chevron" size={16} color={Colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 40, paddingTop: 32, paddingBottom: 48 },
  kicker: { color: Colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: Colors.text, fontSize: 36, fontWeight: '800', marginTop: 6, letterSpacing: -0.8, marginBottom: 28 },
  layout: { flexDirection: 'row', gap: 32, alignItems: 'flex-start' },
  hero: {
    width: 380,
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: 28,
    alignItems: 'center',
  },
  avatarWrap: { position: 'relative' },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.bgCard,
  },
  changePhoto: { color: Colors.accent, fontSize: 12, fontWeight: '600', marginTop: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  name: { color: Colors.text, fontSize: 24, fontWeight: '800' },
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
  quote: { color: Colors.textSecondary, fontStyle: 'italic', marginTop: 6 },
  meta: { color: Colors.textMuted, marginTop: 8, fontSize: 13, textAlign: 'center' },
  bio: { color: Colors.textSecondary, textAlign: 'center', marginTop: 14, lineHeight: 21 },
  interestRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14 },
  interest: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  interestText: { color: Colors.accent, fontSize: 12, fontWeight: '600' },
  stats: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
  },
  statValue: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  menuCol: { flex: 1, maxWidth: 560 },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  menuSub: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  verifyTitle: { color: Colors.text, fontSize: 16, fontWeight: '800', marginTop: 10 },
  verifyBody: { color: Colors.textSecondary, marginTop: 6, lineHeight: 20 },
});
