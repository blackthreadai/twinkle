import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { House } from '../types';

interface HouseMarkerProps {
  house: House;
}

function ratingToColor(rating: number): string {
  if (rating >= 4) return '#FFD700'; // bright gold
  if (rating >= 3) return '#FFA500'; // orange
  if (rating >= 2) return '#CD853F'; // dim gold
  return '#8B7355'; // muted brown
}

function ratingToOpacity(rating: number): number {
  if (rating >= 4) return 1;
  if (rating >= 3) return 0.85;
  if (rating >= 2) return 0.7;
  return 0.55;
}

export function HouseMarker({ house }: HouseMarkerProps) {
  const rating = house.avg_rating ?? 0;
  const color = ratingToColor(rating);
  const opacity = ratingToOpacity(rating);

  return (
    <View style={[styles.container, { opacity }]}>
      <Text style={[styles.star, { color, textShadowColor: color }]}>✦</Text>
      {rating > 0 && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{rating.toFixed(1)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontSize: 32,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: -4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1a1a2e',
  },
});
