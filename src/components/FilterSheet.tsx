import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import Slider from '@react-native-community/slider';
import type { Feature } from '../types';

const ALL_FEATURES: Feature[] = ['Lights', 'Music', 'Strobes', 'Animatronics', 'Blowups'];

const FEATURE_EMOJI: Record<Feature, string> = {
  Lights: '💡',
  Music: '🎵',
  Strobes: '⚡',
  Animatronics: '🤖',
  Blowups: '🎈',
};

export interface FilterValues {
  radius: number;
  minRating: number;
  features: Feature[];
}

interface FilterSheetProps {
  visible: boolean;
  initialValues: FilterValues;
  onApply: (values: FilterValues) => void;
  onClose: () => void;
}

export function FilterSheet({ visible, initialValues, onApply, onClose }: FilterSheetProps) {
  const [radius, setRadius] = useState(initialValues.radius);
  const [minRating, setMinRating] = useState(initialValues.minRating);
  const [features, setFeatures] = useState<Feature[]>(initialValues.features);

  const toggleFeature = (f: Feature) => {
    setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const handleReset = () => {
    setRadius(10);
    setMinRating(0);
    setFeatures([]);
  };

  const handleApply = () => {
    onApply({ radius, minRating, features });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Filters</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Radius */}
          <Text style={styles.label}>Radius: {radius} mi</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={25}
            step={1}
            value={radius}
            onValueChange={setRadius}
            minimumTrackTintColor="#FFD700"
            maximumTrackTintColor="#444"
            thumbTintColor="#FFD700"
          />

          {/* Min Rating */}
          <Text style={styles.label}>Minimum Rating</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setMinRating(minRating === n ? 0 : n)}>
                <Text style={[styles.starBtn, n <= minRating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
            {minRating > 0 && (
              <TouchableOpacity onPress={() => setMinRating(0)}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Features */}
          <Text style={styles.label}>Features</Text>
          <View style={styles.chipRow}>
            {ALL_FEATURES.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.chip, features.includes(f) && styles.chipActive]}
                onPress={() => toggleFeature(f)}
              >
                <Text style={styles.chipText}>
                  {FEATURE_EMOJI[f]} {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    marginTop: 16,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starBtn: {
    fontSize: 28,
    color: '#444',
  },
  starActive: {
    color: '#FFD700',
  },
  clearText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#444',
  },
  chipActive: {
    backgroundColor: '#B22222',
    borderColor: '#FFD700',
  },
  chipText: {
    color: '#fff',
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
  },
  resetText: {
    color: '#ccc',
    fontWeight: '600',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#B22222',
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
