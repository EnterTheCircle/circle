import React, { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  DegreeFilter,
  NetworkGlobe,
  ZOOM_FOR_DEGREE,
  filterToMaxDegree,
} from '@/components/NetworkGlobe';
import { ProfilePreview } from '@/components/ProfilePreview';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/ui';
import { ME, NETWORK_STATS, Person, getPerson } from '@/constants/mockData';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import CircleWeb from '@/components/web/CirclePage';

const TAB_CLEARANCE = 118;
const FILTERS: { key: DegreeFilter; label: string }[] = [
  { key: 1, label: 'Yours' },
  { key: 2, label: 'Through' },
  { key: 3, label: '3rd' },
  { key: 'all', label: 'All' },
];

export default function CircleScreen() {
  if (Platform.OS === 'web') return <CircleWeb />;
  return <CircleNative />;
}

function CircleNative() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { unreadCount, isSaved, rememberPerson, requestIntro, profile } = useApp();
  const [filter, setFilter] = useState<DegreeFilter>('all');
  const [zoom, setZoom] = useState(ZOOM_FOR_DEGREE[3]);
  const [focusId, setFocusId] = useState('me');
  const [preview, setPreview] = useState<Person | null>(null);

  const maxDegree = filterToMaxDegree(filter);
  const bottomPad = Math.max(insets.bottom, 10) + TAB_CLEARANCE;

  const handleZoomChange = useCallback((next: number) => setZoom(next), []);

  const applyFilter = (f: DegreeFilter) => {
    setFilter(f);
    if (f !== 'all') setZoom(ZOOM_FOR_DEGREE[f]);
    else setZoom(ZOOM_FOR_DEGREE[3]);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 4 }]}>
      <LinearGradient
        colors={['#020617', '#050510', '#020617']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(124,58,237,0.12)', 'transparent', 'rgba(8,145,178,0.08)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.topRow}>
        <Logo />
        <View style={styles.topActions}>
          <Pressable style={styles.bell} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={20} color={Colors.text} />
            {unreadCount > 0 ? (
              <View style={styles.dot}>
                <Text style={styles.dotText}>{unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/profile')}>
            <Avatar
              initials={profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
              color={Colors.accent}
              size={34}
              photo={ME.photo}
            />
          </Pressable>
        </View>
      </View>

      <Text style={styles.reach}>
        {preview
          ? `Path · ${preview.firstName}`
          : focusId === 'me'
            ? `${NETWORK_STATS.extended} people in your universe`
            : `${getPerson(focusId)?.firstName}'s orbit`}
      </Text>

      <View style={styles.globeArea}>
        <NetworkGlobe
          maxDegree={maxDegree}
          zoom={zoom}
          onZoomChange={handleZoomChange}
          focusId={focusId}
          highlightId={preview?.id}
          onInvite={() => router.push('/connect')}
          onFocusPerson={(p) => {
            setPreview(null);
            setFocusId(p.id);
            if (p.id !== 'me' && filter === 1) applyFilter(2);
          }}
          onOpenProfile={(p) => setPreview(p)}
          onResetView={() => {
            setZoom(ZOOM_FOR_DEGREE[3]);
            setFilter('all');
          }}
        />
      </View>

      {preview ? (
        <ProfilePreview
          person={preview}
          saved={isSaved(preview.id)}
          bottomInset={bottomPad - 24}
          onClose={() => setPreview(null)}
          onView={() => {
            if (preview.id === 'me') router.push('/(tabs)/profile');
            else router.push(`/person/${preview.id}`);
            setPreview(null);
          }}
          onSave={() => {
            if (preview.id !== 'me') rememberPerson(preview.id);
          }}
          onIntro={() => {
            requestIntro(preview.id, '');
            setPreview(null);
          }}
        />
      ) : (
        <View style={[styles.legendBlock, { paddingBottom: bottomPad }]}>
          <View style={styles.segment}>
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <Pressable
                  key={String(f.key)}
                  onPress={() => applyFilter(f.key)}
                  style={[styles.segmentItem, active && styles.segmentItemActive]}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hint}>Drag to rotate · pinch to zoom · tap twice for profile</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020617', paddingHorizontal: Spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.8)',
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
  reach: { color: '#64748B', fontSize: 12, marginTop: 6, marginBottom: 0 },
  globeArea: { flex: 1.35, justifyContent: 'center', minHeight: 380, marginTop: 4 },
  legendBlock: { alignItems: 'center' },
  segment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
    padding: 3,
  },
  segmentItem: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radii.full },
  segmentItemActive: {
    backgroundColor: 'rgba(167,139,250,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.45)',
  },
  segmentText: { color: '#64748B', fontSize: 13, fontWeight: '700' },
  segmentTextActive: { color: '#C4B5FD' },
  hint: { color: '#475569', fontSize: 10, marginTop: 10, letterSpacing: 0.3 },
});
