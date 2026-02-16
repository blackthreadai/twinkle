import React, { useState } from 'react';
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

  if (!visible) return null;

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
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 340,
          backgroundColor: '#000000',
          zIndex: 1000,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#4ade80', margin: 0, fontSize: 22, fontWeight: 700 }}>Filters</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: 24,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Radius */}
        <label style={{ color: '#ccc', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          Radius: {radius} mi
        </label>
        <input
          type="range"
          min={1}
          max={25}
          step={1}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#4ade80', marginBottom: 20 }}
        />

        {/* Min Rating */}
        <label style={{ color: '#ccc', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          Minimum Rating
        </label>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setMinRating(minRating === n ? 0 : n)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 28,
                cursor: 'pointer',
                color: n <= minRating ? '#4ade80' : '#444',
                transition: 'color 0.15s',
              }}
            >
              ★
            </button>
          ))}
          {minRating > 0 && (
            <button
              onClick={() => setMinRating(0)}
              style={{ background: 'none', border: 'none', color: '#888', fontSize: 12, cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Features */}
        <label style={{ color: '#ccc', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          Features
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {ALL_FEATURES.map((f) => (
            <button
              key={f}
              onClick={() => toggleFeature(f)}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                border: `1px solid ${features.includes(f) ? '#4ade80' : '#444'}`,
                backgroundColor: features.includes(f) ? '#B22222' : '#111111',
                color: '#fff',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {FEATURE_EMOJI[f]} {f}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
          <button
            onClick={handleReset}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 12,
              border: '1px solid #666',
              background: 'none',
              color: '#ccc',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            style={{
              flex: 2,
              padding: '14px 0',
              borderRadius: 12,
              border: 'none',
              backgroundColor: '#B22222',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
