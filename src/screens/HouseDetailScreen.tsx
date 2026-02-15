import { View, Text, StyleSheet } from 'react-native';

export default function HouseDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 House Details</Text>
      <Text style={styles.subtitle}>Photos, ratings, and reviews</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
});
