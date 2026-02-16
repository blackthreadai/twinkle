import React, { lazy, Suspense } from 'react';
import { Platform, View, Text, ActivityIndicator } from 'react-native';

const LeaderboardScreenWeb = Platform.OS === 'web'
  ? lazy(() => import('../../src/screens/LeaderboardScreen.web'))
  : () => null;

function Loading() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
      <ActivityIndicator size="large" color="#FFD700" />
      <Text style={{ color: '#FFD700', marginTop: 12 }}>Loading leaderboard...</Text>
    </View>
  );
}

export default function LeaderboardTab() {
  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <Text style={{ color: '#FFD700', fontSize: 18 }}>Leaderboard coming soon!</Text>
      </View>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <LeaderboardScreenWeb />
    </Suspense>
  );
}
