import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Person, degreeLabel } from '@/constants/mockData';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { Avatar, Badge } from '@/components/ui';

export function PersonCard({
  person,
  onPress,
  trailing,
}: {
  person: Person;
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <Avatar initials={person.initials} color={person.color} size={48} photo={person.photo} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.name}>{person.name}</Text>
          {person.verified ? <Badge label="VERIFIED" tone="cyan" /> : null}
        </View>
        <Text style={styles.meta}>
          {person.profession} · {person.location}
        </Text>
        <Text style={styles.via}>
          {person.via ? `Friend of ${person.via}` : degreeLabel(person.degree)}
        </Text>
      </View>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  body: { flex: 1, marginLeft: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  meta: { color: Colors.textSecondary, fontSize: 13, marginTop: 3 },
  via: { color: Colors.accent, fontSize: 12, marginTop: 4, fontWeight: '500' },
});
