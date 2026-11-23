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
import { Glyph } from '@/components/Glyph';
import { PrimaryButton } from '@/components/ui';
import {
  PEOPLE,
  Person,
  channelLabel,
  enrichPerson,
  getPerson,
  isConfidential,
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
    const from = profile.name.split(' ')[0] || 'You';
    const target = isGhostToSecond(person) ? 'someone' : person.name;
    requestIntro(person.id, `${from} would like an introduction to ${target}.`);
    router.push('/introductions');
  };

  const messageViaPreferred = async (person: Person) => {
    const from = profile.name.split(' ')[0] || 'You';
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
          <Glyph name="bookmark" size={16} color={Colors.accent} />
          <Text style={styles.savedText}>Saved</Text>
        </Pressable>
      </View>

      <View style={styles.search}>
        <Glyph name="search" size={18} color={Colors.textMuted} />
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
            <Glyph name="close" size={16} color={Colors.textMuted} />
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
                {ghost || person.confidential ? (
                  <View style={styles.ghostPhoto}>
                    <Text style={styles.ghostMark}>{person.confidential ? '•' : '?'}</Text>
                  </View>
                ) : (
                  <Image source={{ uri: person.photo }} style={styles.photo} />
                )}
                <Text style={[styles.name, (ghost || person.confidential) && styles.nameGhost]} numberOfLines={2}>
                  {ghost ? 'Confidential' : person.confidential ? person.profession : person.name}
                </Text>
                <Text style={styles.meta} numberOfLines={2}>
                  {ghost ? `Via ${person.via || 'mutual'}` : person.confidential ? 'Confidential' : profession}
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

  const pathLabel = ghost
    ? 'Hidden'
    : isDirect
      ? 'You'
      : mutual
        ? `You → ${mutual.firstName}`
        : 'Through your circle';

  return (
    <View style={styles.pane}>
      <View style={styles.paneHead}>
        {ghost || isConfidential(person) ? (
          <View style={[styles.panePhoto, styles.ghostPhotoLarge]}>
            <Text style={styles.ghostMarkLarge}>{isConfidential(person) ? '•' : '?'}</Text>
          </View>
        ) : (
          <Image source={{ uri: person.photo }} style={styles.panePhoto} />
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.paneName, (ghost || isConfidential(person)) && styles.nameGhost]} numberOfLines={2}>
            {ghost ? 'Confidential' : isConfidential(person) ? person.profession : person.name}
          </Text>
          <Text style={styles.paneMeta} numberOfLines={2}>
            {ghost
              ? 'Details hidden'
              : isConfidential(person)
                ? 'Confidential · through the Founder'
                : `${profession}${location ? ` · ${location}` : ''}`}
          </Text>
          {!ghost && !isConfidential(person) && person.contactChannel ? (
            <Text style={styles.prefers}>Prefers {channelLabel(person.contactChannel)}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.pathChip}>
        <Text style={styles.pathChipTxt}>{pathLabel}</Text>
      </View>

      <Text style={styles.bio}>
        {ghost
          ? `Ask ${mutual?.firstName || 'your mutual'} for an introduction. You can track it under Introductions.`
          : person.bio}
      </Text>

      <View style={styles.paneActions}>
        {isDirect ? (
          <PrimaryButton title="Message" onPress={() => onMessage(person)} />
        ) : (
          <PrimaryButton
            title={mutual ? `Ask ${mutual.firstName}` : 'Ask for intro'}
            onPress={() => onAsk(person)}
          />
        )}
        {!ghost ? (
          <View style={styles.paneRow}>
            <PrimaryButton title="Profile" variant="ghost" onPress={onProfile} style={{ flex: 1 }} />
            <PrimaryButton
              title={saved ? 'Saved' : 'Save'}
              variant="secondary"
              onPress={() => onSave(person.id)}
              style={{ flex: 1 }}
            />
          </View>
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
  body: { flex: 1, flexDirection: 'row', gap: 20, marginTop: 20, minHeight: 0, alignItems: 'flex-start' },
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
    width: 340,
    backgroundColor: '#101018',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.28)',
    padding: 18,
    alignSelf: 'flex-start',
  },
  paneHead: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  panePhoto: { width: 64, height: 64, borderRadius: 32 },
  paneName: { color: Colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  paneMeta: { color: Colors.textSecondary, marginTop: 4, fontSize: 13, lineHeight: 18 },
  prefers: { color: Colors.textMuted, marginTop: 4, fontSize: 12 },
  pathChip: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.28)',
  },
  pathChipTxt: { color: '#C4B5FD', fontSize: 12, fontWeight: '700' },
  bio: { color: Colors.textSecondary, marginTop: 12, lineHeight: 20, fontSize: 14 },
  paneActions: { gap: 8, marginTop: 16 },
  paneRow: { flexDirection: 'row', gap: 8 },
});
