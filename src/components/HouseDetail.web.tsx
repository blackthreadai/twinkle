import React, { useState, useEffect } from 'react';
import type { Feature, House } from '../types';

const FEATURE_EMOJI: Record<string, string> = {
  Lights: '🎄', Music: '🎶', Strobes: '⚡', Animatronics: '🦌', Blowups: '⛄',
};

const MOCK_REVIEWS = [
  { id: '1', user: 'Sarah M.', score: 5, body: 'Absolutely stunning! The kids were screaming with joy.', date: 'Dec 8' },
  { id: '2', user: 'Mike T.', score: 4.5, body: 'Incredible light show synced to music. Visit after 7pm!', date: 'Dec 10' },
  { id: '3', user: 'Jessica R.', score: 5, body: 'We drive 30 minutes just to see this every year.', date: 'Dec 12' },
  { id: '4', user: 'David L.', score: 4, body: 'Really well done. Parking can be tricky though.', date: 'Dec 14' },
  { id: '5', user: 'Amanda K.', score: 4.5, body: "Pure magic. My 3-year-old didn't want to leave.", date: 'Dec 15' },
];

function Stars({ score, size = 14 }: { score: number; size?: number }) {
  const full = Math.floor(score);
  const half = score - full >= 0.25;
  const empty = 5 - full - (half ? 1 : 0);
  return <span style={{ color: '#FFD700', fontSize: size }}>{'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(empty)}</span>;
}

export function HouseDetailPanel({ house, onClose }: { house: House; onClose: () => void }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    return () => setVisible(false);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const submitReview = () => {
    if (!userRating || !reviewText.trim()) return;
    setShowSuccess(true);
    setReviewText('');
    setUserRating(null);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const rating = house.avg_rating ?? 0;
  const ratingCount = house.rating_count ?? 0;
  const features = house.features as Feature[];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease',
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 480,
        background: '#1a1a2e', zIndex: 2001, overflowY: 'auto',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        boxShadow: '-4px 0 30px rgba(0,0,0,0.5)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #2a2a4e', position: 'sticky', top: 0, background: '#1a1a2e', zIndex: 1 }}>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#FFD700', fontSize: 20, cursor: 'pointer', padding: 0 }}>←</button>
          <h2 style={{ color: '#FFD700', fontSize: 18, fontWeight: 700, margin: 0 }}>Twinkle ✨</h2>
        </div>

        <div style={{ padding: '0 20px 40px' }}>
          {/* Photos */}
          {house.photos.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                <img src={house.photos[activePhoto]} alt="" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '2px 8px', color: '#fff', fontSize: 11 }}>
                  {activePhoto + 1}/{house.photos.length}
                </div>
              </div>
              {house.photos.length > 1 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {house.photos.map((p: string, i: number) => (
                    <img key={i} src={p} alt="" onClick={() => setActivePhoto(i)} style={{
                      width: 52, height: 40, objectFit: 'cover', borderRadius: 6, cursor: 'pointer',
                      border: i === activePhoto ? '2px solid #FFD700' : '2px solid transparent',
                      opacity: i === activePhoto ? 1 : 0.5, transition: 'all 0.2s',
                    }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '20px 0 6px' }}>{house.address}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ color: '#888', fontSize: 14, fontWeight: 600 }}>Rating</span>
            <span style={{ color: '#FFD700', fontSize: 16, fontWeight: 700 }}>{rating.toFixed(1)}</span>
            <span style={{ color: '#888', fontSize: 13 }}>({ratingCount})</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {features.map((f: Feature) => (
              <span key={f} style={{ padding: '4px 12px', borderRadius: 16, background: '#2a2a4e', border: '1px solid #444', color: '#FFD700', fontSize: 12, fontWeight: 600 }}>
                {FEATURE_EMOJI[f] || '✨'} {f}
              </span>
            ))}
          </div>
          {house.description && <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.5, margin: '0 0 20px' }}>{house.description}</p>}

          {/* Directions */}
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${house.lat},${house.lng}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a1a2e', fontSize: 14, textDecoration: 'none', fontWeight: 700, marginBottom: 24 }}>
            🗺️ Get Directions
          </a>

          {/* Rate */}
          <div style={{ background: '#2a2a4e', borderRadius: 14, padding: 20, marginBottom: 24, border: '1px solid #333' }}>
            <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>⭐ Rate This House</h4>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range" min="1" max="5" step="0.5"
                  value={userRating ?? 3}
                  onChange={e => setUserRating(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#FFD700', height: 6, cursor: 'pointer' }}
                />
                <span style={{ color: '#FFD700', fontSize: 22, fontWeight: 800, minWidth: 40, textAlign: 'center' }}>
                  {userRating ? userRating.toFixed(1) : '—'}
                </span>
              </div>
            </div>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." rows={2}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #444', backgroundColor: '#1a1a2e', color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
            <button onClick={submitReview} disabled={!userRating || !reviewText.trim()} style={{
              marginTop: 8, padding: '8px 20px', borderRadius: 8, border: 'none',
              background: userRating && reviewText.trim() ? 'linear-gradient(135deg, #FFD700, #FFA500)' : '#444',
              color: userRating && reviewText.trim() ? '#1a1a2e' : '#888',
              fontSize: 13, fontWeight: 700, cursor: userRating && reviewText.trim() ? 'pointer' : 'not-allowed',
            }}>Submit Review</button>
            {showSuccess && <p style={{ color: '#4ade80', fontSize: 12, margin: '6px 0 0' }}>✓ Review submitted!</p>}
          </div>

          {/* Reviews */}
          <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>💬 Reviews ({MOCK_REVIEWS.length})</h4>
          {MOCK_REVIEWS.map(r => (
            <div key={r.id} style={{ background: '#2a2a4e', borderRadius: 10, padding: 14, marginBottom: 10, border: '1px solid #333' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 14, background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 12, fontWeight: 700 }}>{r.user[0]}</div>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{r.user}</span>
                </div>
                <span style={{ color: '#888', fontSize: 11 }}>{r.date}</span>
              </div>
              <Stars score={r.score} size={12} />
              <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.4, margin: '6px 0 0' }}>{r.body}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        textarea:focus { outline: none; border-color: #FFD700 !important; box-shadow: 0 0 0 2px rgba(255,215,0,0.2); }
        textarea::placeholder { color: #555; }
      `}</style>
    </>
  );
}
