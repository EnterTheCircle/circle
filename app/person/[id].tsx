import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar, PrimaryButton } from '@/components/ui';
import {
  Person,
  degreeLabel,
  getPerson,
  isConfidential,
  isGhostToSecond,
} from '@/constants/mockData';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

type Panel = 'none' | 'ask' | 'help' | 'introduce';

export default function PersonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    rememberPerson,
    isSaved,
    requestIntro,
    askHerToIntroduce,
    offerHelp,
    introduceHerTo,
    fetchPersonCircle,
    networkFirst,
    showToast,
  } = useApp();

  const person = getPerson(String(id));
  const [panel, setPanel] = useState<Panel>('none');
  const [herCircle, setHerCircle] = useState<Person[]>([]);
  const [loadingCircle, setLoadingCircle] = useState(false);
  const [helpNote, setHelpNote] = useState('');
  const [busy, setBusy] = useState(false);

  const myCircle = useMemo(
    () => networkFirst.filter((p) => p.id !== person?.id),
    [networkFirst, person?.id]
  );

  useEffect(() => {
    if (!person || person.degree !== 1 || panel !== 'ask') return;
    let cancelled = false;
    (async () => {
      setLoadingCircle(true);
      const people = await fetchPersonCircle(person.id);
      if (!cancelled) {
        setHerCircle(people);
        setLoadingCircle(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [panel, person, fetchPersonCircle]);

  if (!person) {
    return (
      <View style={styles.missing}>
        <Text style={{ color: Colors.text }}>Person not found</Text>
        <PrimaryButton title="Go back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const saved = isSaved(person.id);
  const ghost = isGhostToSecond(person);
  const confidential = isConfidential(person);
  const first = person.degree === 1;
  const second = person.degree === 2;
  const displayName = ghost || confidential ? person.profession : person.name;
  const firstName = ghost || confidential ? 'them' : person.firstName;

  const run = async (fn: () => Promise<void>, opts?: { skipNav?: boolean }) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      setPanel('none');
      setHelpNote('');
      if (!opts?.skipNav) router.push('/introductions');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Avatar
          initials={ghost || confidential ? '?' : person.initials}
          color={ghost || confidential ? '#64748B' : person.color}
          size={88}
          glow
          photo={ghost || confidential ? undefined : person.photo}
        />
        <Text style={styles.name}>{displayName}</Text>
        {!ghost && !confidential ? (
          <Text style={styles.profession}>{person.profession}</Text>
        ) : (
          <Text style={styles.profession}>Confidential</Text>
        )}
        {person.location ? <Text style={styles.location}>{person.location}</Text> : null}
        <Text style={styles.path}>
          {degreeLabel(person.degree)}
          {person.via ? ` · via ${person.via}` : ''}
        </Text>
      </View>

      {!ghost && person.bio ? (
        <View style={styles.block}>
          <Text style={styles.label}>About</Text>
          <Text style={styles.body}>{person.bio}</Text>
        </View>
      ) : null}

      {!ghost && person.interests?.length ? (
        <View style={styles.block}>
          <Text style={styles.label}>Interests</Text>
          <View style={styles.tags}>
            {person.interests.map((i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{i}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        {first && !ghost ? (
          <>
            <PrimaryButton
              title={`Ask ${firstName} to introduce you`}
              onPress={() => setPanel(panel === 'ask' ? 'none' : 'ask')}
            />
            <PrimaryButton
              title="Offer to help"
              variant="secondary"
              onPress={() => setPanel(panel === 'help' ? 'none' : 'help')}
            />
            <PrimaryButton
              title={`Introduce ${firstName} to someone`}
              variant="ghost"
              onPress={() => setPanel(panel === 'introduce' ? 'none' : 'introduce')}
            />
          </>
        ) : null}

        {second ? (
          <PrimaryButton
            title={`Ask ${person.via?.split(' ')[0] || 'mutual'} for an intro`}
            onPress={() => {
              requestIntro(person.id);
              router.push('/introductions');
            }}
          />
        ) : null}

        <PrimaryButton
          title={saved ? 'Saved for later' : 'Remember for later'}
          variant="secondary"
          onPress={() => {
            if (!saved) rememberPerson(person.id);
            else showToast('Already saved');
          }}
        />
      </View>

      {panel === 'ask' ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Who should {firstName} introduce you to?</Text>
          <Text style={styles.panelHint}>
            They approve first. Then that person chooses whether to share their preferred contact —
            sharing contact does not add them to your Circle.
          </Text>
          {loadingCircle ? (
            <ActivityIndicator color={Colors.accent} style={{ marginTop: 16 }} />
          ) : herCircle.length === 0 ? (
            <Text style={styles.empty}>No one in their circle is visible yet.</Text>
          ) : (
            herCircle.map((t) => {
              const hide = isConfidential(t) || isGhostToSecond(t);
              return (
                <Pressable
                  key={t.id}
                  style={styles.pick}
                  disabled={busy}
                  onPress={() => run(() => askHerToIntroduce(person, t))}
                >
                  <Avatar
                    initials={hide ? '?' : t.initials}
                    photo={hide ? undefined : t.photo}
                    color={hide ? '#64748B' : t.color}
                    size={40}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickName}>{hide ? t.profession : t.name}</Text>
                    <Text style={styles.pickMeta}>
                      {hide
                        ? `Confidential${t.location ? ` · ${t.location}` : ''}`
                        : `${t.profession}${t.location ? ` · ${t.location}` : ''}`}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      ) : null}

      {panel === 'help' ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Offer to help {firstName}</Text>
          <Text style={styles.panelHint}>They’ll get a notification and can accept or decline.</Text>
          <TextInput
            value={helpNote}
            onChangeText={setHelpNote}
            placeholder="What can you help with?"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            multiline
          />
          <PrimaryButton
            title="Send offer"
            onPress={() => {
              if (!helpNote.trim()) {
                showToast('Add a short note');
                return;
              }
              void run(() => offerHelp(person, helpNote));
            }}
          />
        </View>
      ) : null}

      {panel === 'introduce' ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Introduce {firstName} to someone in your circle</Text>
          <Text style={styles.panelHint}>
            {firstName} gets the request. If they accept, that person still must share contact
            separately — nobody is auto-added to anyone’s 1st circle.
          </Text>
          {myCircle.length === 0 ? (
            <Text style={styles.empty}>Your circle is empty — connect someone first.</Text>
          ) : (
            myCircle.map((t) => (
              <Pressable
                key={t.id}
                style={styles.pick}
                disabled={busy}
                onPress={() => run(() => introduceHerTo(person, t))}
              >
                <Avatar initials={t.initials} photo={t.photo} color={t.color} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickName}>{t.name}</Text>
                  <Text style={styles.pickMeta}>
                    {t.profession}
                    {t.location ? ` · ${t.location}` : ''}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.xl, paddingTop: 28, paddingBottom: 56, maxWidth: 560, width: '100%', alignSelf: 'center' },
  missing: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 28, gap: 6 },
  name: { color: Colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.6, marginTop: 10 },
  profession: { color: Colors.textSecondary, fontSize: 15 },
  location: { color: Colors.textMuted, fontSize: 13 },
  path: { color: Colors.cyan, fontSize: 12, fontWeight: '600', marginTop: 8 },
  block: { marginBottom: 20 },
  label: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  body: { color: Colors.textSecondary, lineHeight: 22, fontSize: 15 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  actions: { gap: 10, marginTop: 8 },
  panel: {
    marginTop: 22,
    padding: 16,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.bgElevated,
    gap: 10,
  },
  panelTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  panelHint: { color: Colors.textMuted, fontSize: 13, lineHeight: 19 },
  empty: { color: Colors.textMuted, marginTop: 8 },
  pick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  pickName: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  pickMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  input: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radii.lg,
    padding: 12,
    color: Colors.text,
    backgroundColor: Colors.bg,
    textAlignVertical: 'top',
  },
});
