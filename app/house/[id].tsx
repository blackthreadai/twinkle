import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

export default function HouseDetailRoute() {
  if (Platform.OS !== 'web') {
    const Screen = require('@/src/screens/HouseDetailScreen').default;
    return <Screen />;
  }

  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import('@/src/screens/HouseDetailScreen').then((mod) => {
      setComponent(() => mod.default);
    });
  }, []);

  if (!Component) {
    return (
      <View style={styles.loading}>
        <Text style={styles.sparkle}>✨</Text>
        <Text style={styles.text}>Loading...</Text>
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
