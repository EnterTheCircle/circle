import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MarketCard, MarketingShell } from '@/components/web/MarketingShell';
import { CIRCLE_MARK } from '@/lib/brand';

export default function CircleTokenPage() {
  return (
    <MarketingShell kicker="Culture layer" title="$CIRCLE">
      <View style={styles.heroMark}>
        <Image source={CIRCLE_MARK} style={styles.mark} />
        <Text style={styles.tokenName}>$CIRCLE</Text>
        <Text style={styles.tokenSub}>Same mark as the product. One Circle.</Text>
      </View>

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
        body="Traffic and culture fund awareness. Retention comes from intros that work. 20% of proceeds buy back $CIRCLE — treasury supports the culture layer."
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
    </MarketingShell>
  );
}

const styles = StyleSheet.create({
  heroMark: { alignItems: 'center', marginBottom: 28, gap: 10 },
  mark: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
  },
  tokenName: {
    color: '#67E8F9',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  tokenSub: { color: '#64748B', fontSize: 13 },
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
});
