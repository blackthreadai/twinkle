import React, { useState } from 'react';
import { mockHouses } from '../data/mockHouses';

const FEATURE_EMOJI: Record<string, string> = {
  Lights: '💡', Music: '🎵', Strobes: '⚡', Animatronics: '🤖', Blowups: '🎈',
};

// Mock profile data
const mockProfile = {
  name: 'Santa Claus',
  email: 'santa@northpole.com',
  avatar: null,
  stats: { houses: 3, reviews: 12, routes: 2 },
};

const mockMyHouses = mockHouses.slice(0, 3);
const mockMyRoutes = [
  { id: 'r1', name: 'Highland Park Tour', houses: 6, distance: '8.2 mi', duration: '1.5 hr' },
  { id: 'r2', name: 'East Dallas Loop', houses: 4, distance: '5.1 mi', duration: '45 min' },
];
const mockMyReviews = [
  { id: 'rv1', house: mockHouses[0].address, rating: 5, text: 'Absolutely incredible! Best display in Dallas.' },
  { id: 'rv2', house: mockHouses[2].address, rating: 4.5, text: 'Amazing light show, music was perfect.' },
  { id: 'rv3', house: mockHouses[5].address, rating: 5, text: 'The animated village blew my mind!' },
];

export default function ProfileScreenWeb() {
  const [isGuest, setIsGuest] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeSection, setActiveSection] = useState<'houses' | 'routes' | 'reviews'>('houses');

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000', overflowY: 'auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px 100px' }}>

        {/* Auth Section */}
        {isGuest && (
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>✨</div>
            <h1 style={{ color: '#FFD700', fontSize: 28, fontWeight: 800, margin: '0 0 8px', textShadow: '0 0 20px rgba(255,215,0,0.3)' }}>
              Sign In to Get Started
            </h1>
            <p style={{ color: '#888', fontSize: 14, margin: '0 0 28px', lineHeight: 1.5 }}>
              Create an account to add houses, rate displays, and save routes
            </p>

            <div style={{ maxWidth: 360, margin: '0 auto' }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                style={{ ...inputStyle, width: '100%', marginBottom: 10 }}
              />
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                style={{ ...inputStyle, width: '100%', marginBottom: 16 }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setIsGuest(false)} style={{
                  flex: 1, padding: '14px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000000',
                  fontSize: 16, fontWeight: 800, cursor: 'pointer', transition: 'transform 0.15s',
                }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'none'; }}
                >Sign In</button>
                <button onClick={() => setIsGuest(false)} style={{
                  flex: 1, padding: '14px 0', borderRadius: 12, border: '1px solid #FFD700',
                  background: 'transparent', color: '#FFD700',
                  fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'transform 0.15s',
                }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'none'; }}
                >Create Account</button>
              </div>
              <button onClick={() => setIsGuest(false)} style={{
                marginTop: 16, background: 'none', border: 'none', color: '#888',
                fontSize: 14, cursor: 'pointer', textDecoration: 'underline',
              }}>Continue as Guest →</button>
            </div>
          </div>
        )}

        {/* Profile Preview */}
        <div style={{ opacity: isGuest ? 0.5 : 1, transition: 'opacity 0.3s', filter: isGuest ? 'blur(1px)' : 'none' }}>
          {isGuest && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <p style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>Preview of your profile</p>
            </div>
          )}

          {/* Avatar + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 36, background: 'linear-gradient(135deg, #B22222, #8B0000)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
              border: '3px solid #FFD700', boxShadow: '0 4px 15px rgba(178,34,34,0.4)',
            }}>🎅</div>
            <div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 700 }}>{mockProfile.name}</h2>
              <p style={{ color: '#888', margin: '2px 0 0', fontSize: 13 }}>{mockProfile.email}</p>
            </div>
            {!isGuest && (
              <button onClick={() => setIsGuest(true)} style={{
                marginLeft: 'auto', padding: '8px 16px', borderRadius: 8, border: '1px solid #222',
                background: 'transparent', color: '#888', fontSize: 13, cursor: 'pointer',
              }}>Sign Out</button>
            )}
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', justifyContent: 'space-around', padding: 20,
            background: '#111111', borderRadius: 12, marginBottom: 24, border: '1px solid #333',
          }}>
            {[
              { label: 'Houses Added', value: mockProfile.stats.houses, icon: '🏠' },
              { label: 'Reviews', value: mockProfile.stats.reviews, icon: '⭐' },
              { label: 'Routes', value: mockProfile.stats.routes, icon: '🗺️' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ color: '#FFD700', fontSize: 22, fontWeight: 800 }}>{s.value}</div>
                <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Section Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#111111', borderRadius: 10, padding: 4 }}>
            {(['houses', 'routes', 'reviews'] as const).map(s => (
              <button key={s} onClick={() => setActiveSection(s)} style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                background: activeSection === s ? '#B22222' : 'transparent',
                color: activeSection === s ? '#fff' : '#888',
                fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}>My {s}</button>
            ))}
          </div>

          {/* My Houses */}
          {activeSection === 'houses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mockMyHouses.map(h => (
                <div key={h.id} style={{
                  display: 'flex', gap: 12, padding: 12, background: '#111111',
                  borderRadius: 10, border: '1px solid #333', transition: 'border-color 0.2s',
                }}>
                  <img src={h.photos[0]} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.address}</div>
                    <div style={{ color: '#FFD700', fontSize: 12, marginTop: 2 }}>{'★'.repeat(Math.round(h.avg_rating ?? 0))} {(h.avg_rating ?? 0).toFixed(1)}</div>
                    <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>{h.features.map(f => FEATURE_EMOJI[f] || f).join(' ')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My Routes */}
          {activeSection === 'routes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mockMyRoutes.map(r => (
                <div key={r.id} style={{
                  padding: 16, background: '#111111', borderRadius: 10,
                  border: '1px solid #333', transition: 'border-color 0.2s',
                }}>
                  <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <span style={{ color: '#888', fontSize: 12 }}>🏠 {r.houses} houses</span>
                    <span style={{ color: '#888', fontSize: 12 }}>📏 {r.distance}</span>
                    <span style={{ color: '#888', fontSize: 12 }}>⏱️ {r.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My Reviews */}
          {activeSection === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mockMyReviews.map(r => (
                <div key={r.id} style={{
                  padding: 16, background: '#111111', borderRadius: 10,
                  border: '1px solid #333',
                }}>
                  <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>{r.house}</div>
                  <div style={{ color: '#FFD700', fontSize: 14, marginBottom: 6 }}>{'★'.repeat(Math.round(r.rating))}{'☆'.repeat(5 - Math.round(r.rating))} {r.rating}</div>
                  <div style={{ color: '#ccc', fontSize: 13, lineHeight: 1.4 }}>{r.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        body { margin: 0; background: #000000; }
        input:focus { outline: none; border-color: #FFD700 !important; box-shadow: 0 0 0 2px rgba(255,215,0,0.2); }
        input::placeholder { color: #555; }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '12px 14px', borderRadius: 10, border: '1px solid #222',
  backgroundColor: '#111111', color: '#fff', fontSize: 15, fontFamily: 'inherit',
  boxSizing: 'border-box' as const, transition: 'border-color 0.2s, box-shadow 0.2s',
};
