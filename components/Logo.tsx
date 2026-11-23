import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/theme';

/** Compact brand mark: orbit rings + center node */
export function Logo({ size = 28, compact = false }: { size?: number; compact?: boolean }) {
  const s = size;
  return (
    <View style={styles.row}>
      <Svg width={s} height={s} viewBox="0 0 32 32">
        <Circle cx="16" cy="16" r="14" stroke="#E8E0D4" strokeWidth="1" fill="none" opacity="0.28" />
        <Circle cx="16" cy="16" r="10" stroke="#E8E0D4" strokeWidth="1" fill="none" opacity="0.4" />
        <Circle cx="16" cy="16" r="6.5" stroke="#E8E0D4" strokeWidth="1.2" fill="none" opacity="0.7" strokeDasharray="14 8" />
        <Circle cx="16" cy="16" r="3.2" fill="#E8E0D4" />
        <Circle cx="26" cy="10" r="1.6" fill="#E8E0D4" opacity="0.85" />
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
  accent: { color: '#E8E0D4', fontWeight: '700' },
});
