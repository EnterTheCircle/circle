import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar, Badge, Card, Input, PrimaryButton } from '@/components/ui';
import { ME, degreeLabel, getPerson } from '@/constants/mockData';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export default function PersonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const person = getPerson(String(id));
  const router = useRouter();
  const { rememberPerson, isSaved, requestIntro, showToast } = useApp();
  const [reason, setReason] = useState('');
  const [showIntroForm, setShowIntroForm] = useState(false);

  if (!person) {
    return (
      <View style={styles.missing}>
        <Text style={{ color: Colors.text }}>Person not found</Text>
        <PrimaryButton title="Go back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const saved = isSaved(person.id);
  const via = person.viaId ? getPerson(person.viaId) : undefined;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Image source={{ uri: person.photo }} style={styles.cover} />
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            <Avatar
              initials={person.initials}
              color={person.color}
              size={86}
              glow
              photo={person.photo}
            />
          </View>
          {person.verified ? <Badge label="VERIFIED" tone="cyan" /> : null}
          <Text style={styles.name}>{person.name}</Text>
          <Text style={styles.profession}>{person.profession}</Text>
          <Text style={styles.location}>{person.location}</Text>
        </View>

        <Card>
          <Text style={styles.label}>ABOUT</Text>
          <Text style={styles.body}>{person.bio}</Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={styles.label}>INTERESTS</Text>
          <View style={styles.tags}>
            {person.interests.map((i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{i}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={styles.label}>CONNECTION PATH</Text>
          <View style={styles.pathRow}>
            <Avatar initials={ME.initials} color={Colors.accent} photo={ME.photo} size={40} />
            <Text style={styles.pathArrow}>→</Text>
            {via ? (
              <>
                <Avatar
                  initials={via.initials}
                  color={via.color}
                  photo={via.photo}
                  size={40}
                />
                <Text style={styles.pathArrow}>→</Text>
              </>
            ) : null}
            <Avatar
              initials={person.initials}
              color={person.color}
              photo={person.photo}
              size={40}
            />
          </View>
          <Text style={styles.pathVisual}>
            {degreeLabel(person.degree)}
            {person.via ? ` · through ${person.via}` : ''}
          </Text>
        </Card>

        <View style={{ marginTop: 18, gap: 10 }}>
          <PrimaryButton title="Request Introduction" onPress={() => setShowIntroForm(true)} />
          <PrimaryButton
            title={saved ? 'Saved for Later' : 'Remember for Later'}
            variant="secondary"
            onPress={() => {
              if (!saved) rememberPerson(person.id);
              else showToast('Already in your saved collection');
            }}
          />
        </View>

        {showIntroForm ? (
          <Card style={{ marginTop: 16 }}>
            <Text style={styles.label}>WHY AN INTRO?</Text>
            <Input
              value={reason}
              onChangeText={setReason}
              placeholder="Share a short reason…"
              style={{ marginTop: 10, marginBottom: 12 }}
            />
            <PrimaryButton
              title="Send request"
              onPress={() => {
                requestIntro(person.id, reason);
                setShowIntroForm(false);
                setReason('');
                router.push('/(tabs)/introductions');
              }}
            />
            <PrimaryButton
              title="Cancel"
              variant="ghost"
              onPress={() => setShowIntroForm(false)}
              style={{ marginTop: 8 }}
            />
          </Card>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  missing: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  cover: { width: '100%', height: 220 },
  content: { paddingHorizontal: Spacing.lg, marginTop: -40 },
  hero: { alignItems: 'center', marginBottom: 22, gap: 8 },
  avatarWrap: {
    borderRadius: 48,
    borderWidth: 3,
    borderColor: Colors.bg,
    marginBottom: 4,
  },
  name: { color: Colors.text, fontSize: 26, fontWeight: '700', marginTop: 4 },
  profession: { color: Colors.accent, fontSize: 15, fontWeight: '600' },
  location: { color: Colors.textMuted, fontSize: 13 },
  label: { color: Colors.textMuted, fontSize: 11, letterSpacing: 1.4, fontWeight: '700' },
  body: { color: Colors.textSecondary, marginTop: 8, lineHeight: 21 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: { color: Colors.accent, fontSize: 12, fontWeight: '600' },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  pathArrow: { color: Colors.textMuted, fontSize: 16 },
  pathVisual: {
    color: Colors.cyan,
    marginTop: 12,
    fontWeight: '600',
    fontSize: 13,
  },
});
