import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

export default function HouseDetailRoute() {
  if (Platform.OS !== 'web') {
    const Screen = require('@/src/screens/HouseDetailScreen').default;
    return <Screen />;
  }

  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    import('@/src/screens/HouseDetailScreen')
      .then((mod) => setComponent(() => mod.default))
      .catch((err) => {
        console.error('Failed to load HouseDetailScreen:', err);
        setError(err?.message || 'Load failed');
      });
  }, [mounted]);

  if (!mounted || !Component) {
    return (
      <View style={styles.loading}>
        <Text style={styles.sparkle}>✨</Text>
        <Text style={styles.text}>{error ? `Error: ${error}` : 'Loading...'}</Text>
      </View>
    );
  }

  return <Component />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
  sparkle: { fontSize: 48, marginBottom: 12 },
  text: { color: '#FFD700', fontSize: 16 },
});
