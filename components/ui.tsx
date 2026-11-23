import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';
import { avatarSource } from '@/lib/avatars';

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Wordmark() {
  return <Text style={styles.wordmark}>MYCIRCLE</Text>;
}

export function Avatar({
  initials,
  color = Colors.accent,
  size = 44,
  glow,
  photo,
}: {
  initials: string;
  color?: string;
  size?: number;
  glow?: boolean;
  photo?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = !!photo && !failed;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + '33',
          borderColor: color + '88',
          shadowColor: glow ? color : 'transparent',
          shadowOpacity: glow ? 0.55 : 0,
          shadowRadius: glow ? 12 : 0,
          overflow: 'hidden',
        },
      ]}
    >
      {showPhoto ? (
        <Image
          source={avatarSource(photo)}
          style={{ width: size, height: size }}
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={[styles.avatarText, { fontSize: size * 0.32, color }]}>{initials}</Text>
      )}
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const bg =
    variant === 'primary'
      ? Colors.accentStrong
      : variant === 'secondary'
        ? Colors.accentSoft
        : variant === 'danger'
          ? 'rgba(248,113,113,0.15)'
          : 'transparent';
  const color =
    variant === 'danger' ? Colors.danger : variant === 'ghost' ? Colors.textSecondary : Colors.text;
  const border =
    variant === 'ghost' || variant === 'secondary' ? Colors.borderStrong : 'transparent';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: border, opacity: pressed || disabled ? 0.7 : 1 },
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color }]} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: Colors.accentSoft, borderColor: Colors.accent },
      ]}
    >
      <Text style={[styles.chipText, active && { color: Colors.accent }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Input({
  value,
  onChangeText,
  placeholder,
  style,
  multiline,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  style?: StyleProp<TextStyle>;
  multiline?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      style={[styles.input, style]}
      autoCapitalize={multiline ? 'sentences' : 'none'}
      autoCorrect={!!multiline}
      multiline={multiline}
    />
  );
}

export function ToggleRow({
  label,
  value,
  onToggle,
  description,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  description?: string;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {description ? <Text style={styles.toggleDesc}>{description}</Text> : null}
      </View>
      <View style={[styles.toggle, value && styles.toggleOn]}>
        <View style={[styles.toggleKnob, value && styles.toggleKnobOn]} />
      </View>
    </Pressable>
  );
}

export function Badge({ label, tone = 'accent' }: { label: string; tone?: 'accent' | 'cyan' | 'muted' }) {
  const color = tone === 'cyan' ? Colors.cyan : tone === 'muted' ? Colors.textMuted : Colors.accent;
  return (
    <View style={[styles.badge, { borderColor: color + '66', backgroundColor: color + '18' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function Toast({ message }: { message: string }) {
  return (
    <View style={styles.toast}>
      <LinearGradient
        colors={['rgba(139,92,246,0.35)', 'rgba(18,18,26,0.95)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

export function LoadingBlock() {
  return (
    <View style={{ padding: 40, alignItems: 'center' }}>
      <ActivityIndicator color={Colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  wordmark: {
    ...Typography.wordmark,
    color: Colors.text,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: Radii.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    marginRight: 8,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.text,
  },
  sectionSubtitle: {
    ...Typography.subtitle,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  input: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: Colors.text,
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  toggleLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  toggleDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1F1F2A',
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.textMuted,
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.accent,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toast: {
    position: 'absolute',
    bottom: 110,
    left: 24,
    right: 24,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  toastText: {
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
});
