import React from 'react';
import { Platform } from 'react-native';
import FounderStatsPage from '@/components/web/FounderStatsPage';
import { Redirect } from 'expo-router';
import { useApp } from '@/context/AppContext';

export default function StatsScreen() {
  const { isAppFounder } = useApp();
  if (!isAppFounder) return <Redirect href="/" />;
  if (Platform.OS !== 'web') {
    // Same page works on native; keep simple.
  }
  return <FounderStatsPage />;
}
