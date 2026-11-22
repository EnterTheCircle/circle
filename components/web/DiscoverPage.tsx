import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, PrimaryButton } from '@/components/ui';
import {
  ME,
  PEOPLE,
  Person,
  channelLabel,
  enrichPerson,
  getPerson,
  isGhostToSecond,
  openPreferredChannel,
} from '@/constants/mockData';
import { Colors, Radii } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export default function DiscoverWeb() {
  const router = useRouter();
  const { requestIntro, rememberPerson, isSaved, showToast, profile } = useApp();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [selected, setSelected] = useState<Person | null>(null);

  const reach = useMemo(
    () =>
      PEOPLE.filter((p) => p.degree === 1 || p.degree === 2)
        .map(enrichPerson)
        .filter((p) => p.discoverable !== 'hidden'),
    []
  );

  const results = useMemo(() => {
    const q = submitted.trim().toLowerCase() || query.trim().toLowerCase();
    if (!q) return reach;
    return reach.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.profession.toLowerCase().includes(q) ||
        p.interests.some((i) => i.toLowerCase().includes(q)) ||
        p.location.toLowerCase().includes(q)
    );
  }, [submitted, query, reach]);

  const askForIntro = (person: Person) => {
    const from = profile.name.split(' ')[0] || 'Surya';
    const target = isGhostToSecond(person) ? 'someone' : person.name;
    requestIntro(person.id, `${from} would like an introduction to ${target}.`);
    router.push('/introductions');
  };

  const messageViaPreferred = async (person: Person) => {
    const from = profile.name.split(' ')[0] || 'Surya';
    const result = await openPreferredChannel(
      person,
      `Hi ${person.firstName}, it's ${from} from MyCircle.`,
      { subject: `Hello from ${from}` }
    );
    if (result === 'opened') showToast(`Opening ${channelLabel(person.contactChannel || 'mycircle')}`);
    else if (result === 'mycircle') showToast(`${person.firstName} prefers MyCircle notices`);
    else showToast(`${channelLabel(person.contactChannel || 'mycircle')} not available`);
  };

  const detail = selected && results.find((p) => p.id === selected.id) ? selected : results[0];

  return (
    <View style={styles.page}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>1st & 2nd circle only</Text>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.sub}>
            Type who you need — lawyer, stylist, founder — and ask a mutual for a warm intro.
          </Text>
        </View>
        <Pressable style={styles.saved} onPress={() => router.push('/saved')}>
          <Ionicons name="bookmark-outline" size={16} color={Colors.accent} />
          <Text style={styles.savedText}>Saved</Text>
        </Pressable>
      </View>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setSubmitted(t);
          }}
          placeholder="Search people, professions, cities… e.g. lawyer"
          placeholderTextColor={Colors.textMuted}
          style={styles.searchInput}
          onSubmitEditing={() => setSubmitted(query)}
        />
        {query ? (
          <Pressable
            onPress={() => {
              setQuery('');
              setSubmitted('');
            }}
          >
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>
        <ScrollView style={styles.gridWrap} contentContainerStyle={styles.grid}>
          {results.map((person) => {
            const active = detail?.id === person.id;
            const ghost = isGhostToSecond(person);
            const profession =
              person.showProfession === false ? 'Profession hidden' : person.profession;
            return (
              <Pressable
                key={person.id}
                onPress={() => setSelected(person)}
                style={[
                  styles.card,
                  person.degree === 1 ? styles.cardDirect : styles.cardThrough,
                  active && styles.cardActive,
                ]}
              >
                {ghost ? (
                  <View style={styles.ghostPhoto}>
                    <Text style={styles.ghostMark}>?</Text>
                  </View>
                ) : (
                  <Image source={{ uri: person.photo }} style={styles.photo} />
                )}
                <Text style={[styles.name, ghost && styles.nameGhost]} numberOfLines={1}>
                  {ghost ? 'Confidential' : person.name}
                </Text>
                <Text style={styles.meta} numberOfLines={2}>
                  {ghost ? `Via ${person.via || 'mutual'}` : profession}
                </Text>
                <Text style={styles.path}>
                  {person.degree === 1 ? 'Your connections' : 'Through your circle'}
                </Text>
              </Pressable>
            );
          })}
          {results.length === 0 ? (
            <Text style={styles.empty}>No matches in your 1st–2nd circle.</Text>
          ) : null}
        </ScrollView>

        {detail ? <PersonPane person={detail} onAsk={askForIntro} onMessage={messageViaPreferred} onSave={rememberPerson} saved={isSaved(detail.id)} onProfile={() => router.push(`/person/${detail.id}`)} /> : null}
      </View>
    </View>
  );
}

function PersonPane({
  person,
  onAsk,
  onMessage,
  onSave,
  saved,
  onProfile,
}: {
  person: Person;
  onAsk: (p: Person) => void;
  onMessage: (p: Person) => void;
  onSave: (id: string) => void;
  saved: boolean;
  onProfile: () => void;
}) {
  const mutual = person.viaId ? getPerson(person.viaId) : undefined;
  const isDirect = person.degree === 1;
  const ghost = isGhostToSecond(person);
  const profession = person.showProfession === false ? 'Profession hidden' : person.profession;
  const location = person.showLocation === false ? 'Location hidden' : person.location;

  return (
    <View style={styles.pane}>
      {ghost ? (
        <View style={[styles.panePhoto, styles.ghostPhotoLarge]}>
          <Text style={styles.ghostMarkLarge}>?</Text>
        </View>
      ) : (
        <Image source={{ uri: person.photo }} style={styles.panePhoto} />
      )}
      <Text style={[styles.paneName, ghost && styles.nameGhost]}>
        {ghost ? 'Confidential' : person.name}
      </Text>
      <Text style={styles.paneMeta}>
        {ghost ? 'Details hidden · ghost mode' : `${profession} · ${location}`}
      </Text>
      <Text style={styles.panePath}>
        {isDirect
          ? 'Your connections'
          : `Through your circle · via ${person.via || mutual?.firstName}`}
      </Text>
      {!ghost && person.contactChannel ? (
        <Text style={styles.prefers}>Prefers {channelLabel(person.contactChannel)}</Text>
      ) : null}

      <View style={styles.pathStrip}>
        <Avatar initials={ME.initials} photo={ME.photo} color="#fff" size={32} />
        <View style={styles.pathLine} />
        {mutual ? (
          <>
            <Avatar initials={mutual.initials} photo={mutual.photo} color={mutual.color} size={32} />
            <View style={styles.pathLine} />
          </>
        ) : null}
        {ghost ? (
          <Avatar initials="?" color="#64748B" size={32} />
        ) : (
          <Avatar initials={person.initials} photo={person.photo} color={person.color} size={32} />
        )}
      </View>

      <Text style={styles.bio}>
        {ghost
          ? `This person is ghosted to 2nd circle. Ask ${mutual?.firstName || 'your mutual'} for an introduction to learn more.`
          : person.bio}
      </Text>

      <View style={{ gap: 8, marginTop: 18 }}>
        {isDirect ? (
          <PrimaryButton title="Message in their app" onPress={() => onMessage(person)} />
        ) : (
          <PrimaryButton
            title={mutual ? `Ask ${mutual.firstName} for an intro` : 'Ask for intro'}
            onPress={() => onAsk(person)}
          />
        )}
        {!ghost ? (
          <>
            <PrimaryButton title="View profile" variant="ghost" onPress={onProfile} />
            <PrimaryButton
              title={saved ? 'Saved' : 'Save for later'}
              variant="secondary"
              onPress={() => onSave(person.id)}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: 40, paddingTop: 32, paddingBottom: 24 },
  top: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22 },
  kicker: { color: Colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: Colors.text, fontSize: 36, fontWeight: '800', marginTop: 6, letterSpacing: -0.8 },
  sub: { color: Colors.textMuted, marginTop: 8, fontSize: 15, maxWidth: 520, lineHeight: 22 },
  saved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  savedText: { color: Colors.accent, fontWeight: '700', fontSize: 13 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 4,
    maxWidth: 720,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 16, paddingVertical: 14 },
  body: { flex: 1, flexDirection: 'row', gap: 24, marginTop: 24, minHeight: 0 },
  gridWrap: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingBottom: 40 },
  card: {
    width: 180,
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  cardDirect: {
    backgroundColor: 'rgba(34,211,238,0.05)',
    borderColor: 'rgba(34,211,238,0.18)',
  },
  cardThrough: {
    backgroundColor: 'rgba(167,139,250,0.06)',
    borderColor: 'rgba(167,139,250,0.2)',
  },
  cardActive: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  photo: { width: 56, height: 56, borderRadius: 28, marginBottom: 10 },
  ghostPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 10,
    backgroundColor: 'rgba(100,116,139,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostMark: { color: '#94A3B8', fontSize: 22, fontWeight: '700' },
  ghostPhotoLarge: {
    backgroundColor: 'rgba(100,116,139,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostMarkLarge: { color: '#94A3B8', fontSize: 36, fontWeight: '700' },
  name: { color: Colors.text, fontWeight: '700', fontSize: 14 },
  nameGhost: { color: Colors.textSecondary, fontStyle: 'italic' },
  meta: { color: Colors.textSecondary, fontSize: 12, marginTop: 4, minHeight: 32 },
  path: { color: Colors.accent, fontSize: 11, fontWeight: '600', marginTop: 6 },
  empty: { color: Colors.textMuted, marginTop: 24 },
  pane: {
    width: 320,
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: 22,
  },
  panePhoto: { width: 88, height: 88, borderRadius: 44, marginBottom: 14 },
  paneName: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  paneMeta: { color: Colors.textSecondary, marginTop: 6, fontSize: 14 },
  panePath: { color: Colors.accent, marginTop: 8, fontWeight: '600' },
  prefers: { color: Colors.textMuted, marginTop: 4, fontSize: 12 },
  pathStrip: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  pathLine: { width: 22, height: 1, backgroundColor: Colors.accent + '88' },
  bio: { color: Colors.textSecondary, marginTop: 16, lineHeight: 21, fontSize: 14 },
});
