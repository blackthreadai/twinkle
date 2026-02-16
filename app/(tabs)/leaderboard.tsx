import React, { lazy, Suspense } from 'react';
import { Platform, View, Text, ActivityIndicator } from 'react-native';

const LeaderboardScreenWeb = Platform.OS === 'web'
  ? lazy(() => import('../../src/screens/LeaderboardScreen.web'))
  : () => null;

function Loading() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
      <ActivityIndicator size="large" color="#4ade80" />
      <Text style={{ color: '#4ade80', marginTop: 12 }}>Loading leaderboard...</Text>
    </View>
  );
}

export default function LeaderboardTab() {
  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <Text style={{ color: '#4ade80', fontSize: 18 }}>Leaderboard coming soon!</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Suspense fallback={<Loading />}>
        <LeaderboardScreenWeb />
      </Suspense>
    </View>
  );
}
