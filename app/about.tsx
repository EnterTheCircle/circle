import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MarketCard, MarketingShell } from '@/components/web/MarketingShell';

export default function AboutPage() {
  return (
    <MarketingShell kicker="Product" title="About Circle">
      <Text style={styles.lede}>
        Circle is a relationship graph for warm access — not another feed. You see who you know,
        who sits through them, and you ask for introductions the way the real world already works.
      </Text>

      <MarketCard
        title="The problem"
        body="Cold DMs and follower counts pretend to be access. Real doors open when someone you trust vouchsafes you."
      />
      <MarketCard
        title="What we built"
        body="An orbit of your 1st circle and the people through it. Discover by role. Ask a mutual. Message in the apps people already use."
        accent="#22D3EE"
      />
      <MarketCard
        title="Privacy by design"
        body="Ghost mode lets friends-of-friends see Confidential instead of your name and profession — until a warm intro lands."
      />
      <MarketCard
        title="Open source"
        body="The client is public on GitHub so anyone can inspect the product. No production backend yet — the demo proves the experience."
      />

      <View style={styles.quote}>
        <Text style={styles.quoteTxt}>
          “Followers are vanity. Paths are power.”
        </Text>
      </View>
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
  quote: {
    marginTop: 18,
    borderLeftWidth: 3,
    borderLeftColor: '#22D3EE',
    paddingLeft: 16,
  },
  quoteTxt: {
    color: '#E2E8F0',
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '600',
    lineHeight: 28,
  },
});
