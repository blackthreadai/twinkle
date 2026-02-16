import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

export default function ExploreTab() {
  // Native: direct import
  if (Platform.OS !== 'web') {
    const MapScreen = require('@/src/screens/MapScreen').default;
    return <MapScreen />;
  }

  // Web: must lazy-load to avoid SSR issues with Leaflet
  const [MapComponent, setMapComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    import('@/src/screens/MapScreen')
      .then((mod) => {
        setMapComponent(() => mod.default);
      })
      .catch((err) => {
        console.error('Failed to load map:', err);
        setError(err?.message || 'Failed to load map');
      });
  }, [mounted]);

  if (!mounted || !MapComponent) {
    return (
      <View style={styles.loading}>
        <Text style={styles.sparkle}>✨</Text>
        <Text style={styles.loadingText}>
          {error ? `Error: ${error}` : 'Loading Twinkle...'}
        </Text>
      </View>
    );
  }

  return <MapComponent />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: { fontSize: 48, marginBottom: 12 },
  loadingText: { color: '#FFD700', fontSize: 16 },
});
