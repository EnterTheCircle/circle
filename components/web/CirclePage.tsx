import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Glyph } from '@/components/Glyph';
import {
  DegreeFilter,
  NetworkGlobe,
  WEB_ZOOM_FOR_DEGREE,
  filterToMaxDegree,
} from '@/components/NetworkGlobe';
import { Avatar, PrimaryButton } from '@/components/ui';
import {
  NETWORK_STATS,
  FOUNDER_CONTACTS,
  PEOPLE,
  activeCircle,
  isConfidential,
  Person,
  enrichPerson,
  getPerson,
  initialsFromName,
  isGhostToSecond,
} from '@/constants/mockData';
import { Colors, Radii } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

const FILTERS: { key: DegreeFilter; label: string }[] = [
  { key: 1, label: 'Yours' },
  { key: 2, label: 'Through' },
  { key: 3, label: '3rd' },
  { key: 'all', label: 'All' },
];

function clampZoom(z: number) {
  return Math.max(0.72, Math.min(1.7, z));
}

export default function CircleWeb() {
  const router = useRouter();
  const { unreadCount, isSaved, rememberPerson, requestIntro, profile, startTour, demoMode, isAppFounder } =
    useApp();
  const [filter, setFilter] = useState<DegreeFilter>('all');
  const [zoom, setZoom] = useState(WEB_ZOOM_FOR_DEGREE[3]);
  const [focusId, setFocusId] = useState('me');
  const [preview, setPreview] = useState<Person | null>(null);
  const [globeSize, setGlobeSize] = useState(720);

  const maxDegree = filterToMaxDegree(filter);
  const handleZoomChange = useCallback((next: number) => setZoom(next), []);

  const mePerson = useMemo<Person>(() => {
    const name = profile.name?.trim() || 'You';
    const firstName = name.split(/\s+/)[0] || 'You';
    return {
      id: 'me',
      name,
      firstName,
      profession: profile.profession || 'Member',
      location: profile.location || '',
      interests: profile.interests || [],
      bio: profile.bio || '',
      degree: 0,
      color: '#FFFFFF',
      initials: initialsFromName(name),
      photo: profile.photo,
    };
  }, [profile]);

  const applyFilter = (f: DegreeFilter) => {
    setFilter(f);
    setZoom(f === 'all' ? WEB_ZOOM_FOR_DEGREE[3] : WEB_ZOOM_FOR_DEGREE[f]);
  };

  const resetView = () => {
    setZoom(WEB_ZOOM_FOR_DEGREE[3]);
    setFilter('all');
    setFocusId('me');
    setPreview(null);
  };

  const onGlobeAreaLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    // Fill nearly the whole stage — only leave a slim strip for the toolbar
    const next = Math.floor(Math.min(width + 24, height - 56));
    if (next > 360 && Math.abs(next - globeSize) > 8) setGlobeSize(next);
  };

  const people = useMemo(() => {
    const max = filterToMaxDegree(filter);
    const first = isAppFounder
      ? FOUNDER_CONTACTS.map((p) => ({ ...p, degree: 1 as const, via: undefined, viaId: undefined }))
      : activeCircle();
    const through = isAppFounder ? [] : demoMode ? PEOPLE.filter((p) => p.degree === 2) : FOUNDER_CONTACTS;
    return [...first, ...through].map(enrichPerson)
      .filter((p) => p.degree <= max)
      .sort((a, b) => a.degree - b.degree || a.name.localeCompare(b.name));
  }, [filter, demoMode, isAppFounder]);

  const focus = focusId === 'me' ? mePerson : getPerson(focusId);

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>
              {isAppFounder ? FOUNDER_CONTACTS.length : demoMode ? activeCircle().length : NETWORK_STATS.direct}
            </Text>
            <Text style={styles.statLbl}>direct</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>
              {isAppFounder
                ? 0
                : demoMode
                  ? PEOPLE.filter((p) => p.degree >= 2).length
                  : FOUNDER_CONTACTS.length}
            </Text>
            <Text style={styles.statLbl}>in reach</Text>
          </View>
        </View>
        <Pressable style={styles.bell} onPress={() => router.push('/notifications')}>
          <Glyph name="bell" size={18} color={Colors.text} />
          {unreadCount > 0 ? (
            <View style={styles.dot}>
              <Text style={styles.dotText}>{unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.globeCol} onLayout={onGlobeAreaLayout}>
          <View style={styles.globeStage}>
            <NetworkGlobe
              size={globeSize}
              maxDegree={maxDegree}
              zoom={zoom}
              onZoomChange={handleZoomChange}
              focusId={focusId}
              highlightId={preview?.id}
              hideChrome
              mePerson={mePerson}
              showFirst10k={profile.first10k}
              onInvite={() => router.push('/connect')}
              onFocusPerson={(p) => {
                setPreview(null);
                setFocusId(p.id);
              }}
              onOpenProfile={(p) => setPreview(p)}
              onResetView={resetView}
            />
          </View>

          <View style={styles.toolbar}>
            {focusId !== 'me' ? (
              <Pressable style={styles.toolBtn} onPress={() => setFocusId('me')}>
                <Glyph name="home" size={14} color={Colors.accent} />
                <Text style={styles.toolTxt}>You</Text>
              </Pressable>
            ) : null}
            <View style={styles.segment}>
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <Pressable
                    key={String(f.key)}
                    onPress={() => applyFilter(f.key)}
                    style={[styles.segmentItem, active && styles.segmentItemActive]}
                  >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{f.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.zoomRow}>
              <Pressable style={styles.iconBtn} onPress={() => setZoom((z) => clampZoom(z - 0.1))}>
                <Glyph name="minus" size={16} color={Colors.text} />
              </Pressable>
              <Pressable style={styles.iconBtn} onPress={() => setZoom((z) => clampZoom(z + 0.1))}>
                <Glyph name="plus" size={16} color={Colors.text} />
              </Pressable>
              <Pressable style={styles.toolBtn} onPress={resetView}>
                <Glyph name="locate" size={14} color={Colors.cyan} />
                <Text style={[styles.toolTxt, { color: Colors.cyan }]}>Reset</Text>
              </Pressable>
              <Pressable
                style={styles.toolBtn}
                onPress={startTour}
              >
                <Text style={styles.toolTxt}>Tour</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.side}>
          {preview ? (
            <View style={styles.preview}>
              <Pressable onPress={() => setPreview(null)} style={styles.backRow}>
                <Glyph name="chevron" size={16} color={Colors.textMuted} />
                <Text style={styles.backTxt}>Back to list</Text>
              </Pressable>
              {isGhostToSecond(preview) ? (
                <>
                  <Avatar initials="?" color="#64748B" size={72} />
                  <Text style={styles.previewName}>Confidential</Text>
                  <Text style={styles.previewMeta}>Details hidden · ghost mode</Text>
                  <Text style={styles.previewDeg}>
                    Through your circle · via {preview.via || 'mutual'}
                  </Text>
                  <Text style={styles.previewBio}>
                    This person is ghosted to 2nd circle. Ask {preview.via?.split(' ')[0] || 'your mutual'}{' '}
                    for an introduction to learn more.
                  </Text>
                </>
              ) : (
                <>
                  <Avatar
                    initials={preview.initials}
                    photo={preview.id === 'me' ? mePerson.photo : preview.photo}
                    color={preview.color}
                    size={72}
                  />
                  <Text style={styles.previewName}>
                    {preview.id === 'me'
                      ? mePerson.name
                      : isConfidential(preview)
                        ? preview.profession
                        : preview.name}
                  </Text>
                  {(preview.id === 'me' ? profile.first10k : false) ? (
                    <View style={styles.first10k}>
                      <Text style={styles.first10kText}>First 10k</Text>
                    </View>
                  ) : null}
                  <Text style={styles.previewMeta}>
                    {isConfidential(preview)
                      ? 'Confidential · through the Founder'
                      : `${preview.profession}${preview.location ? ` · ${preview.location}` : ''}`}
                  </Text>
                  <Text style={styles.previewDeg}>
                    {preview.id === 'me'
                      ? 'You'
                      : preview.degree === 1
                        ? 'Your connections'
                        : preview.degree === 2
                          ? `Through your circle · via ${preview.via || 'mutual'}`
                          : 'Further out'}
                  </Text>
                  <Text style={styles.previewBio}>{preview.bio}</Text>
                </>
              )}
              <View style={{ gap: 8, marginTop: 16, width: '100%' }}>
                {!isGhostToSecond(preview) ? (
                  <PrimaryButton
                    title="Open profile"
                    onPress={() =>
                      preview.id === 'me'
                        ? router.push('/profile')
                        : router.push(`/person/${preview.id}`)
                    }
                  />
                ) : null}
                {preview.id !== 'me' ? (
                  <>
                    {!isGhostToSecond(preview) ? (
                      <PrimaryButton
                        title={isSaved(preview.id) ? 'Saved' : 'Save'}
                        variant="secondary"
                        onPress={() => rememberPerson(preview.id)}
                      />
                    ) : null}
                    {preview.degree === 2 ? (
                      <PrimaryButton
                        title={`Ask ${preview.via?.split(' ')[0] || 'mutual'} for intro`}
                        variant={isGhostToSecond(preview) ? 'primary' : 'ghost'}
                        onPress={() => {
                          requestIntro(
                            preview.id,
                            `${profile.name.split(' ')[0]} would like an introduction to ${
                              isGhostToSecond(preview) || isConfidential(preview)
                                ? `a ${preview.profession}`
                                : preview.name
                            }.`
                          );
                          router.push('/introductions');
                        }}
                      />
                    ) : null}
                  </>
                ) : null}
              </View>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ marginBottom: 14 }}>
                <Text style={styles.sectionLabel}>Your connections</Text>
                {people.filter((p) => p.degree === 1).map((p) => {
                  const active = focusId === p.id;
                  const hidden = isConfidential(p);
                  return (
                    <Pressable
                      key={p.id}
                      style={[styles.row, styles.rowDirect, active && styles.rowActive]}
                      onPress={() => {
                        setFocusId(p.id);
                        setPreview(p);
                      }}
                    >
                      <Avatar
                        initials={hidden ? '•' : p.initials}
                        photo={hidden ? undefined : p.photo}
                        color={p.color}
                        size={40}
                      />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.rowName} numberOfLines={1}>
                          {hidden ? p.profession : p.name}
                        </Text>
                        <Text style={styles.rowMeta} numberOfLines={1}>
                          {hidden ? 'Confidential' : p.profession}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
                {people.some((p) => p.degree === 2) ? (
                  <Text style={[styles.sectionLabel, { marginTop: 12 }]}>
                    {demoMode ? 'Through your circle' : 'Through the Founder'}
                  </Text>
                ) : null}
                {people.filter((p) => p.degree === 2).map((p) => {
                  const active = focusId === p.id;
                  const hidden = isConfidential(p);
                  return (
                    <Pressable
                      key={p.id}
                      style={[styles.row, styles.rowThrough, active && styles.rowActive]}
                      onPress={() => {
                        setFocusId(p.id);
                        setPreview(p);
                      }}
                    >
                      <Avatar
                        initials={hidden ? '•' : p.initials}
                        photo={hidden ? undefined : p.photo}
                        color={p.color}
                        size={40}
                      />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.rowName} numberOfLines={1}>
                          {hidden ? p.profession : p.name}
                        </Text>
                        <Text style={styles.rowMeta} numberOfLines={1}>
                          {hidden ? 'Confidential · via Founder' : `${p.profession} · via ${p.via || 'mutual'}`}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
                <Pressable
                  style={[styles.row, styles.rowInvite]}
                  onPress={() => router.push('/connect')}
                >
                  <View style={styles.plusAvatar}>
                    <Glyph name="plus" size={18} color={Colors.accent} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.rowName}>Invite someone</Text>
                    <Text style={styles.rowMeta}>Open seats on your orbit</Text>
                  </View>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg, paddingLeft: 20, paddingRight: 24, paddingTop: 16, paddingBottom: 12 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statChip: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statNum: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  statLbl: { color: Colors.textMuted, fontSize: 11 },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  dotText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  body: { flex: 1, flexDirection: 'row', gap: 16, minHeight: 0 },
  globeCol: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    justifyContent: 'space-between',
  },
  globeStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    minHeight: 0,
    overflow: 'visible',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 2,
    marginTop: 'auto' as unknown as number,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
  },
  segmentItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radii.full },
  segmentItemActive: { backgroundColor: Colors.accentSoft },
  segmentText: { color: Colors.textMuted, fontWeight: '700', fontSize: 13 },
  segmentTextActive: { color: Colors.accent },
  zoomRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  toolTxt: { color: Colors.accent, fontWeight: '700', fontSize: 12 },
  side: {
    width: 300,
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    minHeight: 0,
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: Radii.md,
    marginBottom: 6,
    borderWidth: 1,
  },
  rowDirect: {
    backgroundColor: 'rgba(34,211,238,0.06)',
    borderColor: 'rgba(34,211,238,0.16)',
  },
  rowThrough: {
    backgroundColor: 'rgba(167,139,250,0.06)',
    borderColor: 'rgba(167,139,250,0.2)',
  },
  rowInvite: {
    backgroundColor: 'rgba(167,139,250,0.06)',
    borderColor: 'rgba(167,139,250,0.22)',
    borderStyle: 'dashed',
  },
  plusAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.55)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.72)',
  },
  rowActive: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  rowName: { color: Colors.text, fontWeight: '600', fontSize: 13 },
  rowMeta: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  preview: { alignItems: 'center', paddingTop: 4 },
  backRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 2, marginBottom: 14 },
  backTxt: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  previewName: { color: Colors.text, fontSize: 20, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  first10k: {
    marginTop: 8,
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
  previewMeta: { color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  previewDeg: { color: Colors.accent, marginTop: 6, fontWeight: '600', fontSize: 12 },
  previewBio: { color: Colors.textSecondary, marginTop: 12, lineHeight: 20, textAlign: 'center' },
});
