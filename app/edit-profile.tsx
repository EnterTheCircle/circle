import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, PrimaryButton } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export default function EditProfile() {
  const { profile, updateProfile, showToast } = useApp();
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [profession, setProfession] = useState(profile.profession);
  const [bio, setBio] = useState(profile.bio);
  const [interests, setInterests] = useState(profile.interests.join(', '));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
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
  label: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 8,
  },
});
