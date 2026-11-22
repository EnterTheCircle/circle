import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Card, ToggleRow } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export default function NotificationSettings() {
  const { notificationSettings, toggleNotificationSetting } = useApp();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}
    >
      <Text style={styles.intro}>
        These updates respect what people explicitly choose to share with their circle.
      </Text>
      <Card>
        <ToggleRow
          label="New connections in my circle"
          value={notificationSettings.newConnections}
          onToggle={() => toggleNotificationSetting('newConnections')}
        />
        <ToggleRow
          label="Professional connections"
          value={notificationSettings.professional}
          onToggle={() => toggleNotificationSetting('professional')}
        />
        <ToggleRow
          label="Shared interests"
          value={notificationSettings.sharedInterests}
          onToggle={() => toggleNotificationSetting('sharedInterests')}
        />
        <ToggleRow
          label="Local discoveries"
          value={notificationSettings.localDiscoveries}
          onToggle={() => toggleNotificationSetting('localDiscoveries')}
        />
        <ToggleRow
          label="Verification updates"
          value={notificationSettings.verification}
          onToggle={() => toggleNotificationSetting('verification')}
          description="When someone in your path becomes professionally verified"
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  intro: { color: Colors.textSecondary, marginBottom: 16, lineHeight: 20 },
});
