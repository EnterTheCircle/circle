import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MarketCard, MarketingShell } from '@/components/web/MarketingShell';

export default function CircleTokenPage() {
  return (
    <MarketingShell kicker="Culture layer" title="$CIRCLE">
      <Text style={styles.lede}>
        The product is Circle — warm intros, orbit, ghost mode. $CIRCLE is how that culture travels
        on-chain and on CT. Business connection: attention → product → community, not the other way
        around.
      </Text>

      <MarketCard
        title="Product first"
        body="Enter the circle, see the graph, ask for intros. The app stands alone even if you never touch the token."
        accent="#22D3EE"
      />
      <MarketCard
        title="Token second"
        body="$CIRCLE is a belief market on whether trusted paths beat cold outreach. It’s a meme with a real surface underneath."
      />
      <MarketCard
        title="Business link"
        body="Traffic and culture fund awareness. Retention comes from intros that work. Treasury can support product — never a claim on acquisition cash."
      />

      <View style={styles.links}>
        <Pressable
          style={styles.linkBtn}
          onPress={() => Linking.openURL('https://github.com/EnterTheCircle/circle')}
        >
          <Text style={styles.linkTxt}>GitHub →</Text>
        </Pressable>
        <Pressable
          style={styles.linkBtn}
          onPress={() => Linking.openURL('https://enterthecircle.github.io/circle/')}
        >
          <Text style={styles.linkTxt}>Live app →</Text>
        </Pressable>
      </View>

      <Text style={styles.note}>
        CA / chart links can be added here when you publish the mint. Keep this page product-honest.
      </Text>
    </MarketingShell>
  );
}

const styles = StyleSheet.create({
  lede: {
    color: '#CBD5E1',
    fontSize: 17,
    lineHeight: 27,
    marginBottom: 28,
  },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  linkBtn: {
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(34,211,238,0.08)',
  },
  linkTxt: { color: '#67E8F9', fontWeight: '700', fontSize: 13 },
  note: {
    marginTop: 22,
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },
});
