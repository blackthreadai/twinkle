import React, { useState } from 'react';
import type { House, Feature } from '../types';

interface HouseMarkerWebProps {
  house: House;
  onClick?: (house: House) => void;
}

function ratingToColor(rating: number): string {
  if (rating >= 4) return '#FFD700';
  if (rating >= 3) return '#FFA500';
  if (rating >= 2) return '#CD853F';
  return '#8B7355';
}

function ratingToScale(rating: number): number {
  if (rating >= 4.5) return 1.3;
  if (rating >= 4) return 1.15;
  if (rating >= 3) return 1;
  return 0.85;
}

export function HouseMarkerWeb({ house, onClick }: HouseMarkerWebProps) {
  const [hovered, setHovered] = useState(false);
  const rating = house.avg_rating ?? 0;
  const color = ratingToColor(rating);
  const scale = ratingToScale(rating);

  return (
    <div
      onClick={() => onClick?.(house)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `scale(${hovered ? scale * 1.2 : scale})`,
        transition: 'transform 0.2s ease',
        filter: `drop-shadow(0 0 ${rating >= 4 ? '8px' : '4px'} ${color})`,
        position: 'relative',
      }}
    >
      <span style={{ fontSize: 28, color, lineHeight: 1 }}>✦</span>
      {rating > 0 && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#1a1a2e',
            backgroundColor: color,
            borderRadius: 6,
            padding: '1px 4px',
            marginTop: -2,
          }}
        >
          {rating.toFixed(1)}
        </span>
      )}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            marginBottom: 8,
            backgroundColor: '#1a1a2e',
            border: `1px solid ${color}`,
            borderRadius: 8,
            padding: '6px 10px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            minWidth: 120,
          }}
        >
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
            {house.address.split(',')[0]}
          </div>
          <div style={{ color, fontSize: 11, marginTop: 2 }}>
            {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))} {rating.toFixed(1)}
          </div>
        </div>
      )}
    </div>
  );
}
