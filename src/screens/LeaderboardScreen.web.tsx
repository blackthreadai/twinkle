import React, { useState } from 'react';
import { nationalMockHouses } from '../data/mockHouses';
import type { House, Feature } from '../types';

const FEATURE_EMOJI: Record<string, string> = {
  Lights: '🎄', Music: '🎶', Strobes: '⚡', Animatronics: '🦌', Blowups: '⛄',
};

function rankStyle(rank: number): React.CSSProperties {
  if (rank === 1) return { color: '#4ade80', fontWeight: 800, fontSize: 22, textShadow: '0 0 8px rgba(255,215,0,0.5)' };
  if (rank === 2) return { color: '#C0C0C0', fontWeight: 800, fontSize: 20, textShadow: '0 0 6px rgba(192,192,192,0.4)' };
  if (rank === 3) return { color: '#CD7F32', fontWeight: 800, fontSize: 20, textShadow: '0 0 6px rgba(205,127,50,0.4)' };
  return { color: '#888', fontWeight: 700, fontSize: 18 };
}

function rankBorder(rank: number): string {
  if (rank === 1) return '2px solid #4ade80';
  if (rank === 2) return '2px solid #C0C0C0';
  if (rank === 3) return '2px solid #CD7F32';
  return '1px solid #333';
}

function rankBg(rank: number): string {
  if (rank === 1) return 'linear-gradient(135deg, #111111, #1a1a0a)';
  if (rank === 2) return 'linear-gradient(135deg, #111111, #1a1a1e)';
  if (rank === 3) return 'linear-gradient(135deg, #111111, #1e1a0a)';
  return '#111111';
}

function medalEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export default function LeaderboardScreenWeb() {
  const [tab, setTab] = useState<'local' | 'national'>('local');
  const [zipFilter, setZipFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Dallas zip codes for local
  const dallasZips = ['75201', '75205', '75206', '75208', '75209', '75214', '75218', '75219', '75230', '75240'];

  const localHouses = nationalMockHouses
    .filter(h => {
      const inDallas = dallasZips.includes(h.zip_code || '');
      if (zipFilter) return h.zip_code === zipFilter;
      return inDallas;
    })
    .sort((a, b) => b.votes - a.votes);

  const nationalHouses = [...nationalMockHouses]
    .sort((a, b) => b.votes - a.votes);

  const houses = tab === 'local' ? localHouses : nationalHouses;

  return (
    <div style={{
      width: '100%', height: '100%', background: '#000000',
      fontFamily: 'system-ui, -apple-system, sans-serif', overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #111111', position: 'sticky', top: 0, background: '#000000', zIndex: 10 }}>
        <h1 style={{ color: '#4ade80', fontSize: 24, fontWeight: 800, margin: '0 0 14px', textShadow: '0 0 20px rgba(255,215,0,0.3)' }}>
          🏆 Leaderboard
        </h1>

        {/* Tab toggle */}
        <div style={{ display: 'flex', gap: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid #222' }}>
          {(['local', 'national'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                background: tab === t ? 'linear-gradient(135deg, #4ade80, #22c55e)' : '#111111',
                color: tab === t ? '#000000' : '#888',
                fontSize: 14, fontWeight: 700, transition: 'all 0.2s',
              }}
            >
              {t === 'local' ? '🏠 Local' : '🌎 National'}
            </button>
          ))}
        </div>

        {/* Zip filter for local */}
        {tab === 'local' && (
          <div style={{ marginTop: 10 }}>
            <input
              type="text"
              placeholder="Filter by zip code..."
              value={zipFilter}
              onChange={e => setZipFilter(e.target.value.replace(/\D/g, '').slice(0, 5))}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid #222', background: '#111111', color: '#fff',
                fontSize: 13, boxSizing: 'border-box',
              }}
            />
          </div>
        )}
      </div>

      {/* Subtitle */}
      <div style={{ padding: '12px 20px 4px' }}>
        <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>
          {tab === 'local'
            ? zipFilter ? `Houses in ${zipFilter}` : 'Top Houses near Dallas'
            : 'Top Houses in the USA'}
        </p>
      </div>

      {/* List */}
      <div style={{ padding: '0 20px 40px' }}>
        {houses.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <p style={{ color: '#888', fontSize: 14 }}>No houses found{zipFilter ? ` for zip ${zipFilter}` : ''}</p>
          </div>
        )}
        {houses.map((house, idx) => {
          const rank = idx + 1;
          const expanded = expandedId === house.id;
          return (
            <div
              key={house.id}
              onClick={() => setExpandedId(expanded ? null : house.id)}
              style={{
                background: rankBg(rank), border: rankBorder(rank),
                borderRadius: 12, padding: 14, marginTop: 10, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ minWidth: 44, textAlign: 'center', ...rankStyle(rank) }}>
                  {medalEmoji(rank)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {house.address}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, alignItems: 'center' }}>
                    <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 700 }}>
                      ★ {(house.avg_rating ?? 0).toFixed(1)}
                    </span>
                    <span style={{ color: '#aaa', fontSize: 12 }}>
                      {house.votes} votes
                    </span>
                  </div>
                </div>
                <div style={{ color: '#4ade80', fontSize: 20, fontWeight: 800 }}>
                  {house.votes}
                  <div style={{ color: '#888', fontSize: 9, textAlign: 'center' }}>votes</div>
                </div>
              </div>
              {expanded && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #222' }}>
                  {house.photos.length > 0 && (
                    <img src={house.photos[0]} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
                  )}
                  {house.description && (
                    <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.4, margin: '0 0 8px' }}>{house.description}</p>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(house.features as Feature[]).map(f => (
                      <span key={f} style={{ padding: '3px 10px', borderRadius: 12, background: '#000000', border: '1px solid #222', color: '#4ade80', fontSize: 11, fontWeight: 600 }}>
                        {FEATURE_EMOJI[f] || '✨'} {f}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                    {house.local_rank && <span style={{ color: '#888', fontSize: 12 }}>#{house.local_rank} locally</span>}
                    {house.national_rank && <span style={{ color: '#888', fontSize: 12 }}>#{house.national_rank} nationally</span>}
                    {house.zip_code && <span style={{ color: '#888', fontSize: 12 }}>📍 {house.zip_code}</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        input:focus { outline: none; border-color: #4ade80 !important; box-shadow: 0 0 0 2px rgba(255,215,0,0.2); }
        input::placeholder { color: #555; }
      `}</style>
    </div>
  );
}
