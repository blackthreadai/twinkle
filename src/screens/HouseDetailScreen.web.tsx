import React, { useEffect, useState } from 'react';
import { mockHouses } from '../data/mockHouses';
import type { Feature, House } from '../types';

const FEATURE_EMOJI: Record<string, string> = {
  Lights: '🎄', Music: '🎶', Strobes: '⚡', Animatronics: '🦌', Blowups: '⛄',
};

// Mock reviews
const MOCK_REVIEWS = [
  { id: '1', user: 'Sarah M.', score: 5, body: 'Absolutely stunning! The kids were screaming with joy. Best display in the whole neighborhood.', date: 'Dec 8, 2024' },
  { id: '2', user: 'Mike T.', score: 4.5, body: 'Incredible light show synced to music. Highly recommend visiting after 7pm for the full effect.', date: 'Dec 10, 2024' },
  { id: '3', user: 'Jessica R.', score: 5, body: 'We drive 30 minutes just to see this house every year. Never disappoints!', date: 'Dec 12, 2024' },
  { id: '4', user: 'David L.', score: 4, body: 'Really well done. The animatronics are a nice touch. Parking can be tricky though.', date: 'Dec 14, 2024' },
  { id: '5', user: 'Amanda K.', score: 4.5, body: 'Pure magic. My 3-year-old didn\'t want to leave. The radio station sync is genius.', date: 'Dec 15, 2024' },
];

function getHouseId(): string | null {
  if (typeof window === 'undefined') return null;
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1] || null;
}

function StarRating({ score, size = 16 }: { score: number; size?: number }) {
  const full = Math.floor(score);
  const half = score - full >= 0.25;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ color: '#FFD700', fontSize: size, letterSpacing: 1 }}>
      {'★'.repeat(full)}{half ? '⯨' : ''}{'☆'.repeat(empty)}
    </span>
  );
}

export default function HouseDetailScreenWeb() {
  const [house, setHouse] = useState<House | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);
  const [mapMod, setMapMod] = useState<any>(null);
  const [leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    const id = getHouseId();
    if (id) {
      const found = mockHouses.find(h => h.id === id);
      if (found) setHouse(found);
    }
    // Load leaflet
    Promise.all([import('react-leaflet'), import('leaflet')]).then(([rl, L]) => {
      setMapMod(rl);
      setLeaflet(L);
    });
    if (!document.getElementById('leaflet-css-detail')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-detail';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  if (!house) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
          <p style={{ color: '#888', fontSize: 16 }}>House not found</p>
          <a href="/" style={{ color: '#FFD700', textDecoration: 'none', fontSize: 14 }}>← Back to map</a>
        </div>
      </div>
    );
  }

  const rating = house.avg_rating ?? 0;
  const ratingCount = house.rating_count ?? 0;
  const features = house.features as Feature[];

  const submitReview = () => {
    if (!userRating || !reviewText.trim()) return;
    setShowReviewSuccess(true);
    setReviewText('');
    setUserRating(null);
    setTimeout(() => setShowReviewSuccess(false), 3000);
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#000000', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #111111' }}>
        <a href="/" style={{ color: '#FFD700', textDecoration: 'none', fontSize: 20, lineHeight: 1 }}>←</a>
        <h1 style={{ color: '#FFD700', fontSize: 20, fontWeight: 700, margin: 0, textShadow: '0 0 15px rgba(255,215,0,0.3)' }}>Twinkle ✨</h1>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 100px' }}>
        {/* Photo Gallery */}
        {house.photos.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
              <img
                src={house.photos[activePhoto]}
                alt={house.address}
                style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '4px 10px', color: '#fff', fontSize: 12 }}>
                {activePhoto + 1} / {house.photos.length}
              </div>
            </div>
            {house.photos.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {house.photos.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt=""
                    onClick={() => setActivePhoto(i)}
                    style={{
                      width: 64, height: 48, objectFit: 'cover', borderRadius: 8, cursor: 'pointer',
                      border: i === activePhoto ? '2px solid #FFD700' : '2px solid transparent',
                      opacity: i === activePhoto ? 1 : 0.6,
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* House Info */}
        <div style={{ marginTop: 24 }}>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>{house.address}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <StarRating score={rating} size={20} />
            <span style={{ color: '#FFD700', fontSize: 18, fontWeight: 700 }}>{rating.toFixed(1)}</span>
            <span style={{ color: '#888', fontSize: 14 }}>({ratingCount} ratings)</span>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {features.map(f => (
              <span key={f} style={{
                padding: '6px 14px', borderRadius: 20, background: '#111111', border: '1px solid #222',
                color: '#FFD700', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {FEATURE_EMOJI[f] || '✨'} {f}
              </span>
            ))}
          </div>

          {/* Description */}
          {house.description && (
            <p style={{ color: '#ccc', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>{house.description}</p>
          )}
        </div>

        {/* Mini Map */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>📍 Location</h3>
          {mapMod && leaflet ? (() => {
            const { MapContainer, TileLayer, Marker } = mapMod;
            const icon = leaflet.divIcon({
              className: 'twinkle-marker',
              html: '<span style="font-size:28px">🎄</span>',
              iconSize: [28, 28],
              iconAnchor: [14, 28],
            });
            return (
              <MapContainer center={[house.lat, house.lng]} zoom={15} style={{ height: 200, borderRadius: 12, overflow: 'hidden' }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <Marker position={[house.lat, house.lng]} icon={icon} />
              </MapContainer>
            );
          })() : (
            <div style={{ height: 200, background: '#111111', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Loading map...</div>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${house.lat},${house.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', marginTop: 10, padding: '8px 16px', borderRadius: 8,
              background: '#111111', border: '1px solid #222', color: '#fff', fontSize: 13,
              textDecoration: 'none', fontWeight: 600,
            }}
          >
            🗺️ Get Directions
          </a>
        </div>

        {/* Rate This House */}
        <div style={{ background: '#111111', borderRadius: 16, padding: 24, marginBottom: 32, border: '1px solid #333' }}>
          <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>⭐ Rate This House</h3>
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(s => (
              <button
                key={s}
                onClick={() => setUserRating(s)}
                style={{
                  width: s % 1 === 0 ? 36 : 24,
                  height: 36,
                  borderRadius: 8,
                  border: `2px solid ${userRating === s ? '#FFD700' : '#444'}`,
                  background: userRating === s ? 'rgba(255,215,0,0.2)' : 'transparent',
                  color: userRating !== null && s <= userRating ? '#FFD700' : '#666',
                  fontSize: s % 1 === 0 ? 14 : 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10,
              border: '1px solid #222', backgroundColor: '#000000', color: '#fff',
              fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box',
              resize: 'vertical', minHeight: 70,
            }}
          />
          <button
            onClick={submitReview}
            disabled={!userRating || !reviewText.trim()}
            style={{
              marginTop: 12, padding: '10px 24px', borderRadius: 10, border: 'none',
              background: userRating && reviewText.trim() ? 'linear-gradient(135deg, #FFD700, #FFA500)' : '#444',
              color: userRating && reviewText.trim() ? '#000000' : '#888',
              fontSize: 14, fontWeight: 700, cursor: userRating && reviewText.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            Submit Review
          </button>
          {showReviewSuccess && (
            <p style={{ color: '#4ade80', fontSize: 13, margin: '8px 0 0' }}>✓ Review submitted! Thanks for sharing.</p>
          )}
        </div>

        {/* Reviews */}
        <div>
          <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>💬 Reviews ({MOCK_REVIEWS.length})</h3>
          {MOCK_REVIEWS.map(r => (
            <div key={r.id} style={{ background: '#111111', borderRadius: 12, padding: 16, marginBottom: 12, border: '1px solid #333' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 14, fontWeight: 700 }}>
                    {r.user[0]}
                  </div>
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{r.user}</span>
                </div>
                <span style={{ color: '#888', fontSize: 12 }}>{r.date}</span>
              </div>
              <StarRating score={r.score} size={14} />
              <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.5, margin: '8px 0 0' }}>{r.body}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        body { margin: 0; background: #000000; }
        .twinkle-marker { background: none !important; border: none !important; }
        textarea:focus { outline: none; border-color: #FFD700 !important; box-shadow: 0 0 0 2px rgba(255,215,0,0.2); }
        textarea::placeholder { color: #555; }
      `}</style>
    </div>
  );
}
