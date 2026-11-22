import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Card, ToggleRow } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export default function PrivacySettings() {
  const { privacy, togglePrivacy } = useApp();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}
    >
      <Text style={styles.intro}>
        Discovery is relationship-based. You control what friends-of-friends can see.
      </Text>
      <Card>
        <ToggleRow
          label="Show my profession"
          value={privacy.showProfession}
          onToggle={() => togglePrivacy('showProfession')}
        />
        <ToggleRow
          label="Show my interests"
          value={privacy.showInterests}
          onToggle={() => togglePrivacy('showInterests')}
        />
        <ToggleRow
          label="Allow friends-of-friends discovery"
          value={privacy.allowFoFDiscovery}
          onToggle={() => togglePrivacy('allowFoFDiscovery')}
        />
        <ToggleRow
          label="Ghost mode for 2nd circle"
          value={privacy.ghostToSecond}
          onToggle={() => togglePrivacy('ghostToSecond')}
          description="Friends-of-friends see you as Confidential — not your name or profession"
        />
        <ToggleRow
          label="Allow introduction requests"
          value={privacy.allowIntroRequests}
          onToggle={() => togglePrivacy('allowIntroRequests')}
        />
        <ToggleRow
          label="Share new professional connections with my circle"
          value={privacy.shareProfessionalConnections}
          onToggle={() => togglePrivacy('shareProfessionalConnections')}
          description="Opt-in only — never broadcasted by default in the real product"
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  intro: { color: Colors.textSecondary, marginBottom: 16, lineHeight: 20 },
});
