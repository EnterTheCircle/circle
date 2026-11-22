import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MarketCard, MarketingShell } from '@/components/web/MarketingShell';

const ROWS = [
  { label: 'Community & culture', pct: '40%' },
  { label: 'Liquidity', pct: '25%' },
  { label: 'Treasury / product', pct: '20%' },
  { label: 'Contributors', pct: '10%' },
  { label: 'Early believers', pct: '5%' },
];

export default function TokenomicsPage() {
  return (
    <MarketingShell kicker="Supply" title="Tokenomics">
      <Text style={styles.lede}>
        $CIRCLE is the culture layer around the product — a portable signal for people who believe
        warm access beats cold spam. It is not equity in the app.
      </Text>

      <View style={styles.table}>
        {ROWS.map((r) => (
          <View key={r.label} style={styles.row}>
            <Text style={styles.rowLabel}>{r.label}</Text>
            <Text style={styles.rowPct}>{r.pct}</Text>
          </View>
        ))}
      </View>

      <MarketCard
        title="Fair framing"
        body="Transparent supply narrative. No fake acquisition proceeds. Product usage is the proof — the token spreads the story."
        accent="#67E8F9"
      />
      <MarketCard
        title="Utility (soft)"
        body="Culture badge, early access priority, and community identity. Not a promise of yield from intros."
      />
      <MarketCard
        title="Disclaimer"
        body="Nothing here is financial advice. Crypto is volatile. Only risk what you can afford to lose."
      />
    </MarketingShell>
  );
}

const styles = StyleSheet.create({
  lede: {
    color: '#CBD5E1',
    fontSize: 17,
    lineHeight: 27,
    marginBottom: 24,
  },
  table: {
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.18)',
    paddingVertical: 8,
    marginBottom: 22,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148,163,184,0.08)',
  },
  rowLabel: { color: '#E2E8F0', fontSize: 15, fontWeight: '600' },
  rowPct: { color: '#22D3EE', fontSize: 15, fontWeight: '800' },
});
