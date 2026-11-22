import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Person, degreeLabel, isGhostToSecond } from '@/constants/mockData';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { Avatar, Badge, PrimaryButton } from '@/components/ui';

export function ProfilePreview({
  person,
  onView,
  onSave,
  onIntro,
  onClose,
  saved,
  bottomInset = 0,
}: {
  person: Person;
  onView: () => void;
  onSave: () => void;
  onIntro: () => void;
  onClose: () => void;
  saved: boolean;
  bottomInset?: number;
}) {
  const ghost = isGhostToSecond(person);

  return (
    <View style={[styles.wrap, { marginBottom: bottomInset }]}>
      <LinearGradient
        colors={['transparent', 'rgba(5,5,8,0.88)', Colors.bg]}
        style={styles.fade}
        pointerEvents="none"
      />
      <View style={styles.card}>
        <View style={styles.handle} />
        <View style={styles.header}>
          {ghost ? (
            <Avatar initials="?" color="#64748B" size={52} glow />
          ) : (
            <Avatar
              initials={person.initials}
              color={person.color}
              size={52}
              glow
              photo={person.photo}
            />
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.row}>
              <Text style={[styles.name, ghost && styles.nameGhost]} numberOfLines={1}>
                {ghost ? 'Confidential' : person.name}
              </Text>
              {!ghost && person.verified ? <Badge label="VERIFIED" tone="cyan" /> : null}
            </View>
            <Text style={styles.meta} numberOfLines={1}>
              {ghost ? 'Details hidden' : `${person.profession} · ${person.location}`}
            </Text>
            <Text style={styles.path}>
              {degreeLabel(person.degree)}
              {person.via ? ` · via ${person.via}` : ''}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.close} hitSlop={10}>
            <Ionicons name="close" size={18} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {!ghost && person.interests.length > 0 ? (
          <View style={styles.tags}>
            {person.interests.slice(0, 3).map((i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{i}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.actions}>
          {!ghost ? (
            <PrimaryButton title="View Profile" onPress={onView} style={{ flex: 1 }} />
          ) : null}
          {!ghost ? (
            <PrimaryButton
              title={saved ? 'Saved' : 'Save'}
              onPress={onSave}
              variant="secondary"
              style={{ flex: 1 }}
            />
          ) : null}
        </View>
        {person.degree > 0 && person.id !== 'me' ? (
          <PrimaryButton
            title={
              ghost
                ? `Ask ${person.via?.split(' ')[0] || 'mutual'} for intro`
                : 'Request Introduction'
            }
            onPress={onIntro}
            variant={ghost ? 'primary' : 'ghost'}
            style={{ marginTop: 8 }}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 0,
  },
  fade: {
    position: 'absolute',
    left: -Spacing.lg,
    right: -Spacing.lg,
    top: -36,
    height: 40,
  },
  card: {
    backgroundColor: 'rgba(18,18,26,0.96)',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.lg,
    paddingTop: 10,
    paddingBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    marginBottom: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { color: Colors.text, fontSize: 16, fontWeight: '700', maxWidth: '70%' },
  nameGhost: { color: Colors.textSecondary, fontStyle: 'italic' },
  meta: { color: Colors.textSecondary, fontSize: 13, marginTop: 3 },
  path: { color: Colors.cyan, fontSize: 12, marginTop: 5, fontWeight: '600' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.full,
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: { color: Colors.accent, fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
