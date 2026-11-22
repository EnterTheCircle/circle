import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton } from '@/components/ui';
import { ME, getPerson } from '@/constants/mockData';
import { Colors, Radii, Spacing } from '@/constants/theme';

export default function ConnectPicture() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [captured, setCaptured] = useState(false);
  const other = getPerson('alex')!;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={22} color={Colors.text} />
        <Text style={styles.backText}>Connect</Text>
      </Pressable>

      <Text style={styles.title}>Picture Together</Text>
      <Text style={styles.sub}>Simulated camera · no permissions needed</Text>

      <View style={styles.viewfinder}>
        <LinearGradient colors={['#1a1030', '#0a0a10', '#102030']} style={StyleSheet.absoluteFill} />
        {!captured ? (
          <>
            <View style={styles.faces}>
              <Image source={{ uri: ME.photo }} style={styles.face} />
              <Image source={{ uri: other.photo }} style={styles.face} />
            </View>
            <Text style={styles.hint}>Stand side by side</Text>
          </>
        ) : (
          <View style={styles.preview}>
            <View style={styles.faces}>
              <Image source={{ uri: ME.photo }} style={styles.faceLarge} />
              <Image source={{ uri: other.photo }} style={styles.faceLarge} />
            </View>
            <Text style={styles.previewText}>Photo captured</Text>
            <Text style={styles.previewSub}>Ready to confirm with {other.firstName}</Text>
          </View>
        )}
      </View>

      {!captured ? (
        <Pressable style={styles.shutter} onPress={() => setCaptured(true)}>
          <View style={styles.shutterInner} />
        </Pressable>
      ) : (
        <View style={{ width: '100%', gap: 10 }}>
          <PrimaryButton
            title="Confirm connection"
            onPress={() =>
              router.push({
                pathname: '/connect-success',
                params: { name: other.name, method: 'Picture Together' },
              })
            }
          />
          <PrimaryButton title="Retake" variant="ghost" onPress={() => setCaptured(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 18 },
  backText: { color: Colors.text, marginLeft: 2, fontWeight: '500' },
  title: { color: Colors.text, fontSize: 24, fontWeight: '700', alignSelf: 'flex-start' },
  sub: { color: Colors.textMuted, marginTop: 4, marginBottom: 20, alignSelf: 'flex-start' },
  viewfinder: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  faces: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  face: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.7)',
  },
  faceLarge: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: Colors.cyan,
  },
  hint: { color: Colors.textSecondary, marginTop: 24 },
  preview: { alignItems: 'center', gap: 10 },
  previewText: { color: Colors.text, fontSize: 18, fontWeight: '700', marginTop: 16 },
  previewSub: { color: Colors.textSecondary },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.accentStrong,
  },
});
