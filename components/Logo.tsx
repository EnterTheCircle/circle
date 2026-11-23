import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { CIRCLE_MARK } from '@/lib/brand';

/** Single brand mark: cyan network sphere + CIRCLE wordmark (same as homepage / $CIRCLE). */
export function Logo({
  size = 28,
  compact = false,
  markOnly = false,
}: {
  size?: number;
  compact?: boolean;
  markOnly?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Image source={CIRCLE_MARK} style={{ width: size, height: size, borderRadius: size / 2 }} />
      {markOnly ? null : compact ? (
        <Text style={styles.wordCompact}>CIRCLE</Text>
      ) : (
        <Text style={styles.word}>CIRCLE</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  word: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3.6,
  },
  wordCompact: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 3.8,
  },
});
