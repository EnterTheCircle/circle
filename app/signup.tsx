import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { Logo } from '@/components/Logo';
import { PrimaryButton } from '@/components/ui';
import { ContactChannel, channelLabel } from '@/constants/mockData';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { AccountState, ContactsPermissionState, useApp } from '@/context/AppContext';
import CoinHomePage from '@/components/web/CoinHomePage';

const CHANNELS: ContactChannel[] = ['whatsapp', 'linkedin', 'imessage', 'email'];

function handlePlaceholder(channel: ContactChannel) {
  switch (channel) {
    case 'linkedin':
      return 'linkedin.com/in/your-handle';
    case 'whatsapp':
      return '+1 555 123 4567';
    case 'imessage':
      return '+1 555 123 4567';
    case 'email':
      return 'you@email.com';
    default:
      return 'Your handle';
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

export default function SignupScreen() {
  // Web: coin / brand marketing home with one-step entry. Native app signup unchanged.
  if (Platform.OS === 'web') return <CoinHomePage />;
  return <SignupNative />;
}

function SignupNative() {
  const insets = useSafeAreaInsets();
  const { completeSignup, showToast } = useApp();
  const [phone, setPhone] = useState('');
  const [contactsPermission, setContactsPermission] =
    useState<ContactsPermissionState>('undetermined');
  const [contactChannel, setContactChannel] = useState<ContactChannel>('whatsapp');
  const [contactHandle, setContactHandle] = useState('');
  const [busy, setBusy] = useState(false);

  const canContinue = useMemo(() => {
    const phoneOk = phone.replace(/\D/g, '').length >= 10;
    const handleOk = contactHandle.trim().length >= 3;
    return phoneOk && handleOk;
  }, [phone, contactHandle]);

  const requestContacts = async () => {
    if (Platform.OS === 'web') {
      // Browser has no system contacts API — simulate a successful grant for the prototype.
      setContactsPermission('granted');
      showToast('Web demo · contacts marked as connected');
      return;
    }
    try {
      const current = await Contacts.getPermissionsAsync();
      let status = current.status;
      if (status !== 'granted') {
        const next = await Contacts.requestPermissionsAsync();
        status = next.status;
      }
      const mapped: ContactsPermissionState =
        status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';
      setContactsPermission(mapped);
      if (mapped === 'granted') {
        try {
          const count = await Contacts.Contact.getCount();
          showToast(
            count > 0
              ? `Contacts connected · ${count} on device`
              : 'Contacts permission granted'
          );
        } catch {
          showToast('Contacts permission granted');
        }
      } else {
        showToast('Contacts permission declined — you can enable later');
      }
    } catch {
      setContactsPermission('denied');
      showToast('Could not request contacts permission');
    }
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
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top + 12 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: Math.max(insets.bottom, 16) + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Logo size={32} />
        <Text style={styles.title}>Create your circle</Text>
        <Text style={styles.sub}>
          Phone to join · contacts to find people you already know · preferred app for intros.
        </Text>

        <Text style={styles.label}>Phone number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+1 555 000 0000"
          placeholderTextColor={Colors.textMuted}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          style={styles.input}
        />

        <Text style={styles.label}>Contact list</Text>
        <Pressable style={styles.permCard} onPress={requestContacts}>
          <View style={styles.permIcon}>
            <Ionicons name="people-outline" size={22} color={Colors.cyan} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.permTitle}>Allow contacts access</Text>
            <Text style={styles.permSub}>
              Helps MyCircle spot who is already in your world. We never message them for you.
            </Text>
          </View>
          <View style={[styles.permBadge, { borderColor: permColor + '66' }]}>
            <Text style={[styles.permBadgeText, { color: permColor }]}>
              {contactsPermission.toUpperCase()}
            </Text>
          </View>
        </Pressable>

        <Text style={styles.label}>Preferred mode of contact</Text>
        <Text style={styles.hint}>
          When someone wants to reach you after an intro, MyCircle opens this app — not an in-app
          chat.
        </Text>
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
                <Text style={[styles.channelText, active && styles.channelTextActive]}>
                  {channelLabel(ch)}
                </Text>
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
          keyboardType={
            contactChannel === 'email'
              ? 'email-address'
              : contactChannel === 'linkedin'
                ? 'default'
                : 'phone-pad'
          }
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  title: { color: Colors.text, fontSize: 28, fontWeight: '800', marginTop: 20 },
  sub: { color: Colors.textMuted, marginTop: 8, lineHeight: 20, marginBottom: 22 },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 14,
  },
  hint: { color: Colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 10, marginTop: -2 },
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
  permBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
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
  channelChipActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentSoft,
  },
  channelText: { color: Colors.textMuted, fontWeight: '600', fontSize: 13 },
  channelTextActive: { color: Colors.accent },
});
