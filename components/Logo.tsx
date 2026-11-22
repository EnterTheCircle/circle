import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/theme';

/** Compact brand mark: glowing orbit + MyCircle / Circle */
export function Logo({ size = 28, compact = false }: { size?: number; compact?: boolean }) {
  const s = size;
  return (
    <View style={styles.row}>
      <Svg width={s} height={s} viewBox="0 0 32 32">
        <Defs>
          <RadialGradient id="lg" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#67E8F9" stopOpacity="1" />
            <Stop offset="70%" stopColor="#A78BFA" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="16" cy="16" r="14" stroke="#A78BFA" strokeWidth="1" fill="none" opacity="0.45" />
        <Circle cx="16" cy="16" r="9" stroke="#22D3EE" strokeWidth="1" fill="none" opacity="0.55" />
        <Circle cx="16" cy="16" r="4.2" fill="url(#lg)" />
        <Circle cx="25" cy="11" r="2.2" fill="#22D3EE" opacity="0.95" />
        <Circle cx="8" cy="20" r="1.8" fill="#C4B5FD" opacity="0.9" />
      </Svg>
      {compact ? (
        <Text style={styles.wordCompact}>CIRCLE</Text>
      ) : (
        <Text style={styles.word}>
          My<Text style={styles.accent}>Circle</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  word: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  wordCompact: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2.4,
  },
  accent: { color: '#C4B5FD', fontWeight: '700' },
});
