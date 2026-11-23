import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import DiscoverWeb from '@/components/web/DiscoverPage';

export default function DiscoverScreen() {
  if (Platform.OS === 'web') return <DiscoverWeb />;
  return <DiscoverNative />;
}

function DiscoverNative() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { requestIntro, rememberPerson, isSaved, showToast, profile } = useApp();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const reach = useMemo(
    () =>
      PEOPLE.filter((p) => p.degree === 1 || p.degree === 2)
        .map(enrichPerson)
        .filter((p) => p.discoverable !== 'hidden'),
    []
  );

  const results = useMemo(() => {
    const q = submitted.trim().toLowerCase();
    if (!q) return reach.slice(0, 8);
    return reach.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.profession.toLowerCase().includes(q) ||
        p.interests.some((i) => i.toLowerCase().includes(q)) ||
        p.location.toLowerCase().includes(q)
    );
  }, [submitted, reach]);

  const runSearch = () => {
    const q = query.trim();
    if (!q) return;
    setSubmitted(q);
    setQuery('');
  };

  const clearSearch = () => setSubmitted('');

  const askForIntro = (person: Person) => {
    const from = profile.name.split(' ')[0] || 'You';
    const target = isGhostToSecond(person) ? 'someone' : person.name;
    requestIntro(person.id, `${from} would like an introduction to ${target}.`);
    router.push('/(tabs)/introductions');
  };

  const messageViaPreferred = async (person: Person) => {
    const from = profile.name.split(' ')[0] || 'You';
    const msg = `Hi ${person.firstName}, it's ${from} from MyCircle.`;
    const result = await openPreferredChannel(person, msg, {
      subject: `Hello from ${from}`,
    });
    if (result === 'opened') {
      showToast(`Opening ${channelLabel(person.contactChannel || 'mycircle')}`);
    } else if (result === 'mycircle') {
      showToast(`${person.firstName} prefers MyCircle notices — request noted`);
    } else {
      showToast(`${channelLabel(person.contactChannel || 'mycircle')} not available`);
    }
  };

  const renderPerson = ({ item: person }: { item: Person }) => {
    const mutual = person.viaId ? getPerson(person.viaId) : undefined;
    const profession =
      person.showProfession === false ? 'Profession hidden' : person.profession;
    const location = person.showLocation === false ? 'Location hidden' : person.location;
    const isDirect = person.degree === 1;
    const ghost = isGhostToSecond(person);

    return (
      <View
        style={[
          styles.resultCard,
          isDirect ? styles.resultDirect : styles.resultThrough,
        ]}
      >
        <View style={styles.resultTop}>
          {ghost ? (
            <View style={styles.ghostPhoto}>
              <Text style={styles.ghostMark}>?</Text>
            </View>
          ) : (
            <Image source={{ uri: person.photo }} style={styles.photo} />
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.name, ghost && styles.nameGhost]}>
              {ghost ? 'Confidential' : person.name}
            </Text>
            <Text style={styles.meta}>
              {ghost
                ? `Via ${person.via || mutual?.firstName || 'mutual'}`
                : `${profession} · ${location}`}
            </Text>
            <Text style={styles.path}>
              {isDirect ? 'Your connections' : 'Through your circle'}
            </Text>
            {!ghost && person.contactChannel ? (
              <Text style={styles.prefers}>
                Prefers {channelLabel(person.contactChannel)}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.pathStrip}>
          <Avatar initials={ME.initials} photo={ME.photo} color="#fff" size={26} />
          <View style={styles.pathLine} />
          {mutual ? (
            <>
              <Avatar
                initials={mutual.initials}
                photo={mutual.photo}
                color={mutual.color}
                size={26}
              />
              <View style={styles.pathLine} />
            </>
          ) : null}
          {ghost ? (
            <Avatar initials="?" color="#64748B" size={26} />
          ) : (
            <Avatar
              initials={person.initials}
              photo={person.photo}
              color={person.color}
              size={26}
            />
          )}
        </View>

        <View style={styles.actions}>
          {!ghost ? (
            <PrimaryButton
              title="Profile"
              variant="ghost"
              onPress={() => router.push(`/person/${person.id}`)}
            />
          ) : null}
          {isDirect ? (
            <PrimaryButton
              title="Message"
              onPress={() => messageViaPreferred(person)}
              style={{ flex: 1 }}
            />
          ) : (
            <PrimaryButton
              title={mutual ? `Ask ${mutual.firstName}` : 'Ask for intro'}
              onPress={() => askForIntro(person)}
              style={{ flex: 1 }}
            />
          )}
          {!ghost ? (
            <PrimaryButton
              title={isSaved(person.id) ? 'Saved' : 'Save'}
              variant="secondary"
              onPress={() => rememberPerson(person.id)}
            />
          ) : null}
        </View>
      </View>
    );
  };

  const chatHeader = (
    <View style={styles.chatBlock}>
      {submitted ? (
        <>
          <View style={styles.userRow}>
            <View style={styles.userBubble}>
              <Text style={styles.userText}>{submitted}</Text>
            </View>
          </View>
          <View style={styles.botRow}>
            <View style={styles.botBubble}>
              <Text style={styles.botText}>
                {results.length === 0
                  ? `No one matching “${submitted}” in reach (or they’re private).`
                  : `Found ${results.length} ${results.length === 1 ? 'person' : 'people'} below.`}
              </Text>
            </View>
          </View>
        </>
      ) : null}

      <View style={styles.composer}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search… e.g. lawyer"
          placeholderTextColor={Colors.textMuted}
          style={styles.composerInput}
          returnKeyType="search"
          onSubmitEditing={runSearch}
          blurOnSubmit
        />
        {submitted ? (
          <Pressable style={styles.clearBtn} onPress={clearSearch} hitSlop={8}>
            <Ionicons name="close" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
        <Pressable
          style={[styles.sendBtn, !query.trim() && { opacity: 0.4 }]}
          onPress={runSearch}
          disabled={!query.trim()}
        >
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>
          {submitted ? 'Matches' : 'People in reach'}
        </Text>
        <Text style={styles.sectionSub}>
          {submitted
            ? 'Ask a mutual · message opens their preferred app'
            : 'Connections & their contacts — browse or search above'}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top + 8 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={8}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.sub}>1st & 2nd circle only</Text>
        </View>
        <Pressable style={styles.savedBtn} onPress={() => router.push('/saved')}>
          <Ionicons name="bookmark-outline" size={18} color={Colors.accent} />
        </Pressable>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderPerson}
        ListHeaderComponent={chatHeader}
        ListEmptyComponent={
          <Text style={styles.empty}>No matches in your 1st–2nd circle.</Text>
        }
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 8) + 110,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020617', paddingHorizontal: Spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { color: Colors.text, fontSize: 24, fontWeight: '800' },
  sub: { color: Colors.textMuted, marginTop: 2, fontSize: 12 },
  savedBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
  },
  chatBlock: { marginBottom: 4 },
  botRow: { alignItems: 'flex-start', marginBottom: 10 },
  botBubble: {
    maxWidth: '92%',
    backgroundColor: 'rgba(30,41,59,0.9)',
    borderRadius: 18,
    borderTopLeftRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  botText: { color: '#CBD5E1', fontSize: 14, lineHeight: 20 },
  userRow: { alignItems: 'flex-end', marginBottom: 10 },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: Colors.accentStrong,
    borderRadius: 18,
    borderTopRightRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    marginBottom: 18,
  },
  composerInput: { flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 8 },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHead: { marginBottom: 12 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  sectionSub: { color: Colors.textMuted, fontSize: 12, marginTop: 3 },
  resultCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: 12,
    marginBottom: 10,
  },
  resultDirect: {
    backgroundColor: 'rgba(34,211,238,0.05)',
    borderColor: 'rgba(34,211,238,0.18)',
  },
  resultThrough: {
    backgroundColor: 'rgba(167,139,250,0.06)',
    borderColor: 'rgba(167,139,250,0.2)',
  },
  resultTop: { flexDirection: 'row', alignItems: 'center' },
  photo: { width: 48, height: 48, borderRadius: 24 },
  ghostPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(100,116,139,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostMark: { color: '#94A3B8', fontSize: 20, fontWeight: '700' },
  name: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  nameGhost: { color: Colors.textSecondary, fontStyle: 'italic' },
  meta: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  path: { color: Colors.accent, fontSize: 11, fontWeight: '600', marginTop: 4 },
  prefers: { color: Colors.textMuted, fontSize: 11, marginTop: 3 },
  pathStrip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  pathLine: { width: 16, height: 1, backgroundColor: Colors.accent + '88' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 24, lineHeight: 20 },
});
