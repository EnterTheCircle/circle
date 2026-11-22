import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '@/components/Logo';
import { PrimaryButton } from '@/components/ui';
import { ContactChannel, channelLabel } from '@/constants/mockData';
import { Colors, Radii } from '@/constants/theme';
import { AccountState, ContactsPermissionState, useApp } from '@/context/AppContext';

const CHANNELS: ContactChannel[] = ['whatsapp', 'linkedin', 'imessage', 'email'];

function handlePlaceholder(channel: ContactChannel) {
  switch (channel) {
    case 'linkedin':
      return 'linkedin.com/in/your-handle';
    case 'email':
      return 'you@email.com';
    default:
      return '+1 555 123 4567';
  }
}

function handleLabel(channel: ContactChannel) {
  switch (channel) {
    case 'linkedin':
      return 'LinkedIn handle';
    case 'whatsapp':
      return 'WhatsApp number';
    case 'imessage':
      return 'iMessage number';
    case 'email':
      return 'Email address';
    default:
      return 'Contact details';
  }
}

export default function SignupWeb() {
  const { completeSignup, showToast } = useApp();
  const [phone, setPhone] = useState('');
  const [contactsPermission, setContactsPermission] =
    useState<ContactsPermissionState>('undetermined');
  const [contactChannel, setContactChannel] = useState<ContactChannel>('whatsapp');
  const [contactHandle, setContactHandle] = useState('');
  const [busy, setBusy] = useState(false);

  const canContinue = useMemo(() => {
    return phone.replace(/\D/g, '').length >= 10 && contactHandle.trim().length >= 3;
  }, [phone, contactHandle]);

  const requestContacts = () => {
    setContactsPermission('granted');
    showToast('Web demo · contacts marked as connected');
  };

  const onContinue = async () => {
    if (!canContinue || busy) return;
    setBusy(true);
    const account: AccountState = {
      phone: phone.trim(),
      contactsPermission,
      contactChannel,
      contactHandle: contactHandle.trim(),
    };
    try {
      await completeSignup(account);
      router.replace('/how-to');
    } finally {
      setBusy(false);
    }
  };

  const permColor =
    contactsPermission === 'granted'
      ? Colors.success
      : contactsPermission === 'denied'
        ? Colors.danger
        : Colors.warning;

  return (
    <View style={styles.page}>
      <View style={styles.brand}>
        <Logo size={36} />
        <Text style={styles.headline}>Need a lawyer?{'\n'}Ask your circle.</Text>
        <Text style={styles.lede}>
          Warm intros through people you already trust — not cold DMs. Search a role, find the path,
          ask the mutual, then message in WhatsApp, LinkedIn, iMessage, or email.
        </Text>
        <View style={styles.pills}>
          {['Lawyer', 'Stylist', 'Designer', 'Founder', 'Painter'].map((p) => (
            <View key={p} style={styles.pill}>
              <Text style={styles.pillText}>{p}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.formCol} contentContainerStyle={styles.formInner}>
        <Text style={styles.formTitle}>Create your circle</Text>
        <Text style={styles.formSub}>Phone · contacts · how people should reach you after an intro.</Text>

        <Text style={styles.label}>Phone number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+1 555 000 0000"
          placeholderTextColor={Colors.textMuted}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <Text style={styles.label}>Contact list</Text>
        <Pressable style={styles.permCard} onPress={requestContacts}>
          <View style={styles.permIcon}>
            <Ionicons name="people-outline" size={22} color={Colors.cyan} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.permTitle}>Allow contacts access</Text>
            <Text style={styles.permSub}>Match people you already know. We never message them for you.</Text>
          </View>
          <View style={[styles.permBadge, { borderColor: permColor + '66' }]}>
            <Text style={[styles.permBadgeText, { color: permColor }]}>{contactsPermission.toUpperCase()}</Text>
          </View>
        </Pressable>

        <Text style={styles.label}>Preferred mode of contact</Text>
        <View style={styles.channelRow}>
          {CHANNELS.map((ch) => {
            const active = contactChannel === ch;
            return (
              <Pressable
                key={ch}
                onPress={() => {
                  setContactChannel(ch);
                  setContactHandle('');
                }}
                style={[styles.channelChip, active && styles.channelChipActive]}
              >
                <Text style={[styles.channelText, active && styles.channelTextActive]}>{channelLabel(ch)}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>{handleLabel(contactChannel)}</Text>
        <TextInput
          value={contactHandle}
          onChangeText={setContactHandle}
          placeholder={handlePlaceholder(contactChannel)}
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <PrimaryButton
          title={busy ? 'Saving…' : 'Continue'}
          onPress={onContinue}
          disabled={!canContinue || busy}
          style={{ marginTop: 28, opacity: canContinue && !busy ? 1 : 0.45 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, flexDirection: 'row', backgroundColor: Colors.bg },
  brand: {
    flex: 1,
    backgroundColor: '#08080F',
    paddingHorizontal: 56,
    paddingVertical: 48,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  headline: {
    color: Colors.text,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1.4,
    marginTop: 36,
    lineHeight: 56,
  },
  lede: { color: Colors.textSecondary, fontSize: 17, lineHeight: 26, marginTop: 18, maxWidth: 440 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 28 },
  pill: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radii.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillText: { color: Colors.textMuted, fontWeight: '600' },
  formCol: { flex: 1 },
  formInner: { paddingHorizontal: 48, paddingVertical: 48, maxWidth: 520 },
  formTitle: { color: Colors.text, fontSize: 28, fontWeight: '800' },
  formSub: { color: Colors.textMuted, marginTop: 8, marginBottom: 22, lineHeight: 20 },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 16,
  },
  permCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: 14,
  },
  permIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.cyanSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permTitle: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  permSub: { color: Colors.textMuted, fontSize: 12, marginTop: 3, lineHeight: 16 },
  permBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  permBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  channelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  channelChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  channelChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  channelText: { color: Colors.textMuted, fontWeight: '600', fontSize: 13 },
  channelTextActive: { color: Colors.accent },
});
