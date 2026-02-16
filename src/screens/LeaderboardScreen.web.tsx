import React, { useState } from 'react';
import { nationalMockHouses } from '../data/mockHouses';
import { HouseDetailPanel } from '../components/HouseDetail.web';
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
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);

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
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 0 100px' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #111111', position: 'sticky', top: 0, background: '#000000', zIndex: 10 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700, margin: '0 0 14px',
          fontFamily: "'Mountains of Christmas', cursive",
          background: 'linear-gradient(90deg, #FFD700, #FFA500, #ff4d6d, #4ade80, #22d3ee, #FFFFFF, #22d3ee, #4ade80, #ff4d6d, #FFA500, #FFD700)',
          backgroundSize: '400% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text' as any,
          animation: 'twinkle-shimmer 12s linear infinite',
        }}>
          Leaderboard
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
                fontSize: 16, fontWeight: 700, transition: 'all 0.2s',
                fontFamily: "'Mountains of Christmas', cursive",
              }}
            >
              {t === 'local' ? 'Local' : 'National'}
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
              style={{
                background: rankBg(rank), border: rankBorder(rank),
                borderRadius: 12, padding: 14, marginTop: 10,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ minWidth: 44, textAlign: 'center', ...rankStyle(rank) }}>
                  {medalEmoji(rank)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#FFD700', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Mountains of Christmas', cursive" }}>
                    {house.address}{house.zip_code ? `, ${house.zip_code}` : ''}
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
                <div style={{ color: '#4ade80', fontSize: 20, fontWeight: 800, textAlign: 'center' }}>
                  {house.votes}
                  <div style={{ color: '#888', fontSize: 9 }}>votes</div>
                </div>
                <button
                  className="gradient-border-btn"
                  onClick={(e) => { e.stopPropagation(); setSelectedHouse(house); }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, background: 'none',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Mountains of Christmas', cursive",
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    background: 'linear-gradient(90deg, #FFD700, #FFA500, #ff4d6d, #4ade80, #22d3ee, #FFFFFF, #22d3ee, #4ade80, #ff4d6d, #FFA500, #FFD700)',
                    backgroundSize: '400% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text' as any,
                    animation: 'twinkle-shimmer 12s linear infinite',
                  }}>View</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      </div>

      {selectedHouse && (
        <HouseDetailPanel house={selectedHouse} onClose={() => setSelectedHouse(null)} />
      )}

      <style>{`
        input:focus { outline: none; border-color: #4ade80 !important; box-shadow: 0 0 0 2px rgba(255,215,0,0.2); }
        input::placeholder { color: #555; }
        @keyframes twinkle-shimmer {
          0% { background-position: 0% 0%; }
          50% { background-position: 400% 0%; }
          100% { background-position: 0% 0%; }
        }
        .gradient-border-btn {
          position: relative;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .gradient-border-btn::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 10px;
          padding: 2px;
          background: linear-gradient(90deg, #FFD700, #FFA500, #ff4d6d, #4ade80, #22d3ee, #FFFFFF, #22d3ee, #4ade80, #ff4d6d, #FFA500, #FFD700);
          background-size: 400% 100%;
          animation: twinkle-shimmer 12s linear infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}</style>
    </div>
  );
}
