import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

export default function AddTab() {
  if (Platform.OS !== 'web') {
    const AddHouseScreen = require('@/src/screens/AddHouseScreen').default;
    return (<View style={{ flex: 1 }}><AddHouseScreen /></View>);
  }

  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    import('@/src/screens/AddHouseScreen')
      .then((mod) => setComponent(() => mod.default))
      .catch((err) => setError(err?.message || 'Failed to load'));
  }, [mounted]);

  if (!mounted || !Component) {
    return (
      <View style={styles.loading}>
        <Text style={styles.sparkle}>✨</Text>
        <Text style={styles.loadingText}>{error ? `Error: ${error}` : 'Loading...'}</Text>
      </View>
    );
  }

  return <Component />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
  sparkle: { fontSize: 48, marginBottom: 12 },
  loadingText: { color: '#FFD700', fontSize: 16 },
});
