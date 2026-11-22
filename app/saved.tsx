import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Chip, PrimaryButton } from '@/components/ui';
import { SAVED_CATEGORIES, SavedCategory, getPerson } from '@/constants/mockData';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export default function SavedScreen() {
  const { saved, removeSaved, moveSaved } = useApp();
  const router = useRouter();
  const [category, setCategory] = useState<SavedCategory | 'All'>('All');
  const [movingId, setMovingId] = useState<string | null>(null);

  const list = useMemo(
    () =>
      saved.filter((s) => category === 'All' || s.category === category),
    [saved, category]
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.note}>Connected to your world through someone you know.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        <Chip label="All" active={category === 'All'} onPress={() => setCategory('All')} />
        {SAVED_CATEGORIES.map((c) => (
          <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      {list.map((item) => {
        const person = getPerson(item.personId);
        if (!person) return null;
        return (
          <View key={item.personId} style={styles.card}>
            <View style={styles.row}>
              <Avatar initials={person.initials} color={person.color} size={46} photo={person.photo} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{person.name}</Text>
                <Text style={styles.meta}>{person.profession}</Text>
                <Text style={styles.noteLine}>{item.note}</Text>
                <Text style={styles.cat}>{item.category}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <PrimaryButton
                title="View"
                onPress={() => router.push(`/person/${person.id}`)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Move"
                variant="secondary"
                onPress={() => setMovingId(movingId === person.id ? null : person.id)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Remove"
                variant="danger"
                onPress={() => removeSaved(person.id)}
                style={{ flex: 1 }}
              />
            </View>
            {movingId === person.id ? (
              <View style={styles.moveBox}>
                <Text style={styles.moveLabel}>Move to category</Text>
                <View style={styles.moveChips}>
                  {SAVED_CATEGORIES.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      active={item.category === c}
                      onPress={() => {
                        moveSaved(person.id, c);
                        setMovingId(null);
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        );
      })}

      {list.length === 0 ? (
        <Text style={styles.empty}>No saved people in this category.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  note: { color: Colors.textSecondary, marginBottom: 14, lineHeight: 20 },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { color: Colors.text, fontWeight: '700', fontSize: 16 },
  meta: { color: Colors.textSecondary, marginTop: 2, fontSize: 13 },
  noteLine: { color: Colors.textMuted, marginTop: 4, fontSize: 12 },
  cat: { color: Colors.accent, marginTop: 6, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  moveBox: { marginTop: 12 },
  moveLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 8, letterSpacing: 1 },
  moveChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 40 },
});
