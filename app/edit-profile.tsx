import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Input, PrimaryButton } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { defaultAvatar, initialsFromName } from '@/constants/mockData';

function pickPhotoFile(onPicked: (dataUrl: string) => void) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onPicked(reader.result);
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

export default function EditProfile() {
  const { profile, updateProfile, showToast } = useApp();
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [profession, setProfession] = useState(profile.profession);
  const [bio, setBio] = useState(profile.bio);
  const [interests, setInterests] = useState(profile.interests.join(', '));
  const [photo, setPhoto] = useState(profile.photo);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.photoBlock}>
        <Avatar initials={initialsFromName(name)} photo={photo} color={Colors.accent} size={88} glow />
        <Pressable
          onPress={() =>
            pickPhotoFile((uri) => {
              setPhoto(uri);
              showToast('Photo selected — save to keep it');
            })
          }
        >
          <Text style={styles.photoLink}>Upload photo</Text>
        </Pressable>
        <Pressable onPress={() => setPhoto(defaultAvatar(name || 'circle'))}>
          <Text style={styles.photoReset}>Use generated default</Text>
        </Pressable>
      </View>
      <Field label="Name" value={name} onChangeText={setName} />
      <Field label="Location" value={location} onChangeText={setLocation} />
      <Field label="Profession" value={profession} onChangeText={setProfession} />
      <Field label="Bio" value={bio} onChangeText={setBio} />
      <Field
        label="Interests (comma separated)"
        value={interests}
        onChangeText={setInterests}
      />
      <PrimaryButton
        title="Save changes"
        onPress={() => {
          updateProfile({
            name,
            location,
            profession,
            bio,
            photo,
            interests: interests
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          });
          showToast('Profile updated');
          router.back();
        }}
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <Input value={value} onChangeText={onChangeText} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  photoBlock: { alignItems: 'center', marginBottom: 20, gap: 8 },
  photoLink: { color: Colors.accent, fontWeight: '700', fontSize: 13 },
  photoReset: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  label: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 8,
  },
});
