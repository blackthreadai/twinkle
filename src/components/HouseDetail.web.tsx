import React, { useState, useEffect } from 'react';
import type { Feature, House } from '../types';

const FEATURE_EMOJI: Record<string, string> = {
  Lights: '🎄', Music: '🎶', Strobes: '⚡', Animatronics: '🦌', Blowups: '⛄',
};

const MOCK_REVIEWS = [
  { id: '1', user: 'Sarah M.', score: 5, body: 'Absolutely stunning! The kids were screaming with joy.', date: 'Dec 8', flags: 0 },
  { id: '2', user: 'Mike T.', score: 4.5, body: 'Incredible light show synced to music. Visit after 7pm!', date: 'Dec 10', flags: 0 },
  { id: '3', user: 'Jessica R.', score: 5, body: 'We drive 30 minutes just to see this every year.', date: 'Dec 12', flags: 0 },
  { id: '4', user: 'David L.', score: 4, body: 'Really well done. Parking can be tricky though.', date: 'Dec 14', flags: 2 },
  { id: '5', user: 'Amanda K.', score: 4.5, body: "Pure magic. My 3-year-old didn't want to leave.", date: 'Dec 15', flags: 0 },
];

const FLAG_REASONS = ['Inappropriate content', 'Fake review', 'Spam', 'Wrong house', 'Offensive language', 'Other'];
const AUTO_HIDE_THRESHOLD = 15;

function getFlagKey(type: string, id: string): string {
  return `twinkle_flag_${type}_${id}`;
}

function hasFlagged(type: string, id: string): boolean {
  try { return localStorage.getItem(getFlagKey(type, id)) === '1'; } catch { return false; }
}

function recordFlag(type: string, id: string): void {
  try { localStorage.setItem(getFlagKey(type, id), '1'); } catch {}
}

function Stars({ score, size = 14 }: { score: number; size?: number }) {
  const full = Math.floor(score);
  const half = score - full >= 0.25;
  const empty = 5 - full - (half ? 1 : 0);
  return <span style={{ color: '#4ade80', fontSize: size }}>{'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(empty)}</span>;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function hasVotedToday(): boolean {
  try {
    const data = JSON.parse(localStorage.getItem('twinkle_votes') || '{}');
    return !!data[getTodayKey()];
  } catch { return false; }
}

function recordVote(houseId: string): void {
  try {
    const data = JSON.parse(localStorage.getItem('twinkle_votes') || '{}');
    data[getTodayKey()] = houseId;
    localStorage.setItem('twinkle_votes', JSON.stringify(data));
  } catch { /* ignore */ }
}

export function HouseDetailPanel({ house, onClose }: { house: House; onClose: () => void }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [userRating, setUserRating] = useState<number>(4);
  const [reviewText, setReviewText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [visible, setVisible] = useState(false);
  const [voteCount, setVoteCount] = useState(house.votes);
  const [votedToday, setVotedToday] = useState(hasVotedToday());
  const [showConfetti, setShowConfetti] = useState(false);
  const [houseFlagCount, setHouseFlagCount] = useState(0);
  const [houseFlagged, setHouseFlagged] = useState(hasFlagged('house', house.id));
  const [showFlagModal, setShowFlagModal] = useState<{ type: 'house' | 'review'; id: string } | null>(null);
  const [reviewFlags, setReviewFlags] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    MOCK_REVIEWS.forEach(r => { m[r.id] = r.flags; });
    return m;
  });
  const [flaggedReviews, setFlaggedReviews] = useState<Set<string>>(() => {
    const s = new Set<string>();
    MOCK_REVIEWS.forEach(r => { if (hasFlagged('review', r.id)) s.add(r.id); });
    return s;
  });
  const [flagSuccess, setFlagSuccess] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    return () => setVisible(false);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const submitReview = () => {
    if (!reviewText.trim()) return;
    setShowSuccess(true);
    setReviewText('');
    setUserRating(4);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleVote = () => {
    if (votedToday) return;
    recordVote(house.id);
    setVoteCount(prev => prev + 1);
    setVotedToday(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
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
        background: '#000000', zIndex: 2001, overflowY: 'auto',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        boxShadow: '-4px 0 30px rgba(0,0,0,0.5)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #111111', position: 'sticky', top: 0, background: '#000000', zIndex: 1 }}>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#4ade80', fontSize: 20, cursor: 'pointer', padding: 0 }}>←</button>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "'Mountains of Christmas', cursive", display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              background: 'linear-gradient(90deg, #FFD700, #FFA500, #ff4d6d, #4ade80, #22d3ee, #FFFFFF, #22d3ee, #4ade80, #ff4d6d, #FFA500, #FFD700)',
              backgroundSize: '400% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text' as any,
              animation: 'twinkle-shimmer 12s linear infinite',
            }}>Twinkle</span>
          </h2>
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
                      border: i === activePhoto ? '2px solid #4ade80' : '2px solid transparent',
                      opacity: i === activePhoto ? 1 : 0.5, transition: 'all 0.2s',
                    }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <h3 style={{ color: '#FFD700', fontSize: 22, fontWeight: 700, margin: '20px 0 6px', fontFamily: "'Mountains of Christmas', cursive" }}>{house.address}{house.zip_code ? `, ${house.zip_code}` : ''}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ color: '#888', fontSize: 14, fontWeight: 600 }}>Rating</span>
            <span style={{ color: '#4ade80', fontSize: 16, fontWeight: 700 }}>{rating.toFixed(1)}</span>
            <span style={{ color: '#888', fontSize: 13 }}>({ratingCount})</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {features.map((f: Feature) => (
              <span key={f} style={{ padding: '4px 12px', borderRadius: 16, background: '#111111', border: '1px solid #222', color: '#4ade80', fontSize: 12, fontWeight: 600 }}>
                {FEATURE_EMOJI[f] || '✨'} {f}
              </span>
            ))}
          </div>
          {house.description && <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.5, margin: '0 0 20px' }}>{house.description}</p>}

          {/* Votes & Ranking — single line */}
          <div style={{ background: '#111111', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid #222', position: 'relative', overflow: 'hidden' }}>
            {showConfetti && (
              <div className="twinkle-confetti-container">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="twinkle-confetti-piece" style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    backgroundColor: ['#4ade80', '#22c55e', '#FF6347', '#4ade80', '#60a5fa'][i % 5],
                  }} />
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {house.local_rank && <span style={{ color: '#ccc', fontSize: 16 }}><strong style={{ color: '#4ade80' }}>#{house.local_rank}</strong> locally</span>}
              <span style={{ color: '#555' }}>·</span>
              {house.national_rank && <span style={{ color: '#ccc', fontSize: 16 }}><strong style={{ color: '#22c55e' }}>#{house.national_rank}</strong> nationally</span>}
              <span style={{ color: '#555' }}>·</span>
              <span style={{ color: '#4ade80', fontSize: 16, fontWeight: 700 }}>{voteCount} votes</span>
              <div style={{ marginLeft: 'auto' }}>
                <button
                  onClick={handleVote}
                  disabled={votedToday}
                  title={votedToday ? 'Already voted today' : 'Upvote this house!'}
                  style={{
                    width: 40, height: 40, borderRadius: '50%', border: 'none',
                    background: votedToday ? '#444' : 'linear-gradient(90deg, #FFD700, #FFA500, #ff4d6d, #4ade80, #22d3ee, #FFFFFF, #22d3ee, #4ade80, #ff4d6d, #FFA500, #FFD700)',
                    backgroundSize: votedToday ? 'auto' : '400% 100%',
                    animation: votedToday ? 'none' : 'btn-shimmer 12s linear infinite',
                    fontSize: 18, cursor: votedToday ? 'not-allowed' : 'pointer',
                    boxShadow: votedToday ? 'none' : '0 0 12px rgba(255,215,0,0.3)',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: votedToday ? 0.5 : 1,
                  }}
                >
                  <span style={{ color: votedToday ? '#888' : '#fff', fontSize: 18, lineHeight: 1 }}>↑</span>
                </button>
              </div>
            </div>
            {votedToday && <p style={{ color: '#666', fontSize: 11, margin: '8px 0 0', fontStyle: 'italic' }}>You've already voted today</p>}
          </div>

          {/* Directions + Flag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${house.lat},${house.lng}`} target="_blank" rel="noopener noreferrer"
              style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(90deg, #FFD700, #FFA500, #ff4d6d, #4ade80, #22d3ee, #FFFFFF, #22d3ee, #4ade80, #ff4d6d, #FFA500, #FFD700)', backgroundSize: '400% 100%', animation: 'btn-shimmer 12s linear infinite', color: '#000000', fontSize: 16, textDecoration: 'none', fontWeight: 700, fontFamily: "'Mountains of Christmas', cursive" }}>
              Get Directions
            </a>
            <button
              onClick={() => !houseFlagged && setShowFlagModal({ type: 'house', id: house.id })}
              disabled={houseFlagged}
              style={{
                padding: '10px 16px', borderRadius: 10, border: '1px solid #222',
                background: houseFlagged ? '#333' : '#111111', color: houseFlagged ? '#666' : '#ff6b6b',
                fontSize: 13, fontWeight: 600, cursor: houseFlagged ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {houseFlagged ? 'Flagged' : 'Flag Listing'}
            </button>
          </div>

          {/* Rate */}
          <div style={{ background: '#111111', borderRadius: 14, padding: 20, marginBottom: 24, border: '1px solid #333' }}>
            <h4 style={{ color: '#FFD700', fontSize: 18, fontWeight: 700, margin: '0 0 12px', fontFamily: "'Mountains of Christmas', cursive" }}>Rate This House</h4>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range" min="1" max="5" step="0.5"
                  value={userRating}
                  onChange={e => setUserRating(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#FFD700', height: 6, cursor: 'pointer' }}
                />
                <span style={{ color: '#FFD700', fontSize: 22, fontWeight: 800, minWidth: 40, textAlign: 'center' }}>
                  {userRating.toFixed(1)}
                </span>
              </div>
            </div>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." rows={2}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #222', backgroundColor: '#000000', color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
            <button onClick={submitReview} disabled={!reviewText.trim()} style={{
              marginTop: 8, padding: '8px 20px', borderRadius: 8, border: 'none',
              background: reviewText.trim() ? 'linear-gradient(135deg, #4ade80, #22c55e)' : '#444',
              color: reviewText.trim() ? '#000000' : '#888',
              fontSize: 13, fontWeight: 700, cursor: reviewText.trim() ? 'pointer' : 'not-allowed',
            }}>Submit Review</button>
            {showSuccess && <p style={{ color: '#4ade80', fontSize: 12, margin: '6px 0 0' }}>✓ Review submitted!</p>}
          </div>

          {/* Reviews */}
          <h4 style={{ color: '#4ade80', fontSize: 18, fontWeight: 700, margin: '0 0 12px', fontFamily: "'Mountains of Christmas', cursive" }}>💬 Reviews ({MOCK_REVIEWS.length})</h4>
          {MOCK_REVIEWS.filter(r => (reviewFlags[r.id] ?? 0) < AUTO_HIDE_THRESHOLD).map(r => {
            const flagCount = reviewFlags[r.id] ?? 0;
            const isFlagged = flaggedReviews.has(r.id);
            return (
              <div key={r.id} style={{ background: '#111111', borderRadius: 10, padding: 14, marginBottom: 10, border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 14, background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 12, fontWeight: 700 }}>{r.user[0]}</div>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{r.user}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#888', fontSize: 11 }}>{r.date}</span>
                    <button
                      onClick={() => !isFlagged && setShowFlagModal({ type: 'review', id: r.id })}
                      disabled={isFlagged}
                      style={{
                        background: 'none', border: 'none', color: isFlagged ? '#555' : '#666',
                        fontSize: 11, cursor: isFlagged ? 'not-allowed' : 'pointer', padding: '2px 4px',
                        transition: 'color 0.2s',
                      }}
                      title={isFlagged ? 'Already flagged' : 'Flag this review'}
                    >
                      {isFlagged ? '⚑' : '⚐'}
                    </button>
                  </div>
                </div>
                <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 700 }}>{r.score.toFixed(1)}</span>
                <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.4, margin: '6px 0 0' }}>{r.body}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flag Modal */}
      {showFlagModal && (
        <>
          <div onClick={() => setShowFlagModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#000000', border: '1px solid #222', borderRadius: 16, padding: 24,
            zIndex: 3001, width: '90%', maxWidth: 360, boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            fontFamily: 'system-ui',
          }}>
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>
              Flag {showFlagModal.type === 'house' ? 'Listing' : 'Review'}
            </h3>
            <p style={{ color: '#888', fontSize: 12, margin: '0 0 16px' }}>
              Select a reason. After {AUTO_HIDE_THRESHOLD} flags, this will be sent for admin review.
            </p>
            {FLAG_REASONS.map(reason => (
              <button
                key={reason}
                onClick={() => {
                  const { type, id } = showFlagModal;
                  recordFlag(type, id);
                  if (type === 'house') {
                    setHouseFlagCount(prev => prev + 1);
                    setHouseFlagged(true);
                  } else {
                    setReviewFlags(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
                    setFlaggedReviews(prev => new Set(prev).add(id));
                  }
                  setShowFlagModal(null);
                  setFlagSuccess(true);
                  setTimeout(() => setFlagSuccess(false), 2500);
                }}
                style={{
                  display: 'block', width: '100%', padding: '10px 14px', marginBottom: 6,
                  borderRadius: 8, border: '1px solid #333', background: '#111111', color: '#ccc',
                  fontSize: 13, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = '#ff6b6b'; (e.target as HTMLElement).style.color = '#ff6b6b'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = '#333'; (e.target as HTMLElement).style.color = '#ccc'; }}
              >
                {reason}
              </button>
            ))}
            <button onClick={() => setShowFlagModal(null)} style={{
              marginTop: 8, width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #222',
              background: 'transparent', color: '#888', fontSize: 13, cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </>
      )}

      {/* Flag Success Toast */}
      {flagSuccess && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#111111', border: '1px solid #ff6b6b', borderRadius: 10,
          padding: '12px 20px', zIndex: 3002, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          <p style={{ color: '#ff6b6b', margin: 0, fontSize: 13, fontWeight: 600 }}>Flag submitted — thank you for keeping Twinkle safe</p>
        </div>
      )}

      <link href="https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes twinkle-shimmer {
          0% { background-position: 0% 0%; }
          50% { background-position: 400% 0%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          25% { opacity: 0.4; transform: scale(0.7) rotate(-15deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(10deg); }
          75% { opacity: 0.6; transform: scale(0.85) rotate(-5deg); }
        }
        @keyframes btn-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 400% 50%; }
          100% { background-position: 0% 50%; }
        }
        textarea:focus { outline: none; border-color: #4ade80 !important; box-shadow: 0 0 0 2px rgba(255,215,0,0.2); }
        textarea::placeholder { color: #555; }
        .twinkle-confetti-container {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 10;
        }
        .twinkle-confetti-piece {
          position: absolute; top: -10px; width: 8px; height: 8px; border-radius: 50%;
          animation: twinkle-confetti-fall 1.5s ease-out forwards;
        }
        @keyframes twinkle-confetti-fall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(200px) rotate(720deg) scale(0); opacity: 0; }
        }
      `}</style>
    </>
  );
}
