import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet, ActivityIndicator } from 'react-native';

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <Text style={styles.sparkle}>✨</Text>
      <Text style={styles.loadingText}>Loading Twinkle...</Text>
    </View>
  );
}

export default function ExploreTab() {
  if (Platform.OS !== 'web') {
    const MapScreen = require('@/src/screens/MapScreen').default;
    return <MapScreen />;
  }

  const [MapComponent, setMapComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import('@/src/screens/MapScreen').then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  if (!MapComponent) return <LoadingScreen />;
  return <MapComponent />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: { fontSize: 48, marginBottom: 12 },
  loadingText: { color: '#FFD700', fontSize: 16 },
});
