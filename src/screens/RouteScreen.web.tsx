import React, { useState, useEffect, useMemo } from 'react';
import { mockHouses } from '../data/mockHouses';
import type { Feature, House } from '../types';

const ALL_FEATURES: Feature[] = ['Lights', 'Music', 'Strobes', 'Animatronics', 'Blowups'];
const FEATURE_EMOJI: Record<Feature, string> = {
  Lights: '💡', Music: '🎵', Strobes: '⚡', Animatronics: '🤖', Blowups: '🎈',
};
const DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
  { label: '2 hr', value: 120 },
  { label: '3 hr', value: 180 },
];

function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function generateRoute(duration: number, minRating: number, featurePref: Feature[]): House[] {
  let filtered = mockHouses.filter(h => (h.avg_rating ?? 0) >= minRating);
  if (featurePref.length > 0) {
    filtered = filtered.filter(h => featurePref.some(f => h.features.includes(f)));
  }
  // Sort geographically (simple nearest-neighbor from first)
  const maxHouses = Math.min(Math.floor(duration / 15) + 1, filtered.length, 10);
  const route: House[] = [];
  const remaining = [...filtered];
  // Start with highest rated
  remaining.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
  if (remaining.length === 0) return [];
  route.push(remaining.shift()!);
  while (route.length < maxHouses && remaining.length > 0) {
    const last = route[route.length - 1];
    remaining.sort((a, b) =>
      haversine([last.lat, last.lng], [a.lat, a.lng]) - haversine([last.lat, last.lng], [b.lat, b.lng])
    );
    route.push(remaining.shift()!);
  }
  return route;
}

function RouteMap({ houses }: { houses: House[] }) {
  const [mapMod, setMapMod] = useState<any>(null);
  const [leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    Promise.all([import('react-leaflet'), import('leaflet')]).then(([rl, L]) => {
      setMapMod(rl);
      setLeaflet(L);
    });
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  if (!mapMod || !leaflet || houses.length === 0) {
    return <div style={{ height: 350, background: '#111111', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
      {houses.length === 0 ? 'No houses match your filters' : 'Loading map...'}
    </div>;
  }

  const { MapContainer, TileLayer, Marker, Polyline, Popup } = mapMod;
  const center: [number, number] = [
    houses.reduce((s, h) => s + h.lat, 0) / houses.length,
    houses.reduce((s, h) => s + h.lng, 0) / houses.length,
  ];
  const positions: [number, number][] = houses.map(h => [h.lat, h.lng]);

  return (
    <MapContainer center={center} zoom={11} style={{ height: 350, borderRadius: 12, overflow: 'hidden' }} zoomControl={false}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <Polyline positions={positions} pathOptions={{ color: '#FFD700', weight: 3, opacity: 0.7, dashArray: '8, 8' }} />
      {houses.map((h, i) => {
        const icon = leaflet.divIcon({
          className: 'twinkle-marker',
          html: `<div style="width:28px;height:28px;border-radius:50%;background:#B22222;border:2px solid #FFD700;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.5)">${i + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        return (
          <Marker key={h.id} position={[h.lat, h.lng]} icon={icon}>
            <Popup><div style={{ color: '#333', fontWeight: 600 }}>{h.address}</div></Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default function RouteScreenWeb() {
  const [duration, setDuration] = useState(60);
  const [startAddress, setStartAddress] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [featurePref, setFeaturePref] = useState<Feature[]>([]);
  const [routeHouses, setRouteHouses] = useState<House[] | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleFeature = (f: Feature) => {
    setFeaturePref(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const handleGenerate = () => {
    const route = generateRoute(duration, minRating, featurePref);
    setRouteHouses(route);
  };

  const totalDistance = useMemo(() => {
    if (!routeHouses || routeHouses.length < 2) return 0;
    let d = 0;
    for (let i = 1; i < routeHouses.length; i++) {
      d += haversine([routeHouses[i - 1].lat, routeHouses[i - 1].lng], [routeHouses[i].lat, routeHouses[i].lng]);
    }
    return d;
  }, [routeHouses]);

  const handleShare = () => {
    navigator.clipboard.writeText(`https://twinkle.app/route/mock-${Date.now()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#000000', overflowY: 'auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px 100px' }}>
        <h1 style={{ color: '#FFD700', fontSize: 28, fontWeight: 800, margin: '0 0 4px', textShadow: '0 0 20px rgba(255,215,0,0.3)' }}>
          🚗 Plan Your Route
        </h1>
        <p style={{ color: '#888', fontSize: 14, margin: '0 0 28px' }}>Build the perfect Christmas lights tour</p>

        {/* Duration */}
        <label style={labelStyle}>Duration</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {DURATIONS.map(d => (
            <button key={d.value} onClick={() => setDuration(d.value)} style={{
              padding: '10px 20px', borderRadius: 24, border: 'none',
              background: duration === d.value ? 'linear-gradient(135deg, #FFD700, #FFA500)' : '#111111',
              color: duration === d.value ? '#000000' : '#ccc',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
            }}>{d.label}</button>
          ))}
        </div>

        {/* Starting Point */}
        <label style={labelStyle}>Starting Point</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input
            type="text" value={startAddress} onChange={e => setStartAddress(e.target.value)}
            placeholder="Enter address..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={() => setStartAddress('📍 My Location')} style={{
            padding: '12px 16px', borderRadius: 10, border: '1px solid #222',
            background: '#111111', color: '#FFD700', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'border-color 0.2s',
          }}>📍 Use My Location</button>
        </div>

        {/* Min Rating */}
        <label style={labelStyle}>Minimum Rating</label>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setMinRating(minRating === n ? 0 : n)} style={{
              background: 'none', border: 'none', fontSize: 28, cursor: 'pointer',
              color: n <= minRating ? '#FFD700' : '#444', transition: 'color 0.15s',
            }}>★</button>
          ))}
          {minRating > 0 && <button onClick={() => setMinRating(0)} style={{ background: 'none', border: 'none', color: '#888', fontSize: 12, cursor: 'pointer', marginLeft: 8 }}>Clear</button>}
        </div>

        {/* Feature Preferences */}
        <label style={labelStyle}>Feature Preferences <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span></label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {ALL_FEATURES.map(f => (
            <button key={f} onClick={() => toggleFeature(f)} style={{
              padding: '8px 14px', borderRadius: 20,
              border: `1px solid ${featurePref.includes(f) ? '#FFD700' : '#444'}`,
              backgroundColor: featurePref.includes(f) ? '#B22222' : '#111111',
              color: '#fff', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
            }}>{FEATURE_EMOJI[f]} {f}</button>
          ))}
        </div>

        {/* Generate Button */}
        <button onClick={handleGenerate} style={{
          width: '100%', padding: '16px 0', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #B22222, #8B0000)', color: '#fff',
          fontSize: 18, fontWeight: 800, cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
          boxShadow: '0 4px 15px rgba(178,34,34,0.4)',
        }}
          onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'none'; }}
        >🗺️ Generate Route</button>

        {/* Route Results */}
        {routeHouses !== null && (
          <div style={{ marginTop: 32 }}>
            <RouteMap houses={routeHouses} />

            {routeHouses.length > 0 && (
              <>
                {/* Summary Card */}
                <div style={{
                  marginTop: 16, padding: 20, background: '#111111', borderRadius: 12,
                  display: 'flex', justifyContent: 'space-around', textAlign: 'center',
                  border: '1px solid #333',
                }}>
                  <div>
                    <div style={{ color: '#FFD700', fontSize: 24, fontWeight: 800 }}>{routeHouses.length}</div>
                    <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>Houses</div>
                  </div>
                  <div>
                    <div style={{ color: '#FFD700', fontSize: 24, fontWeight: 800 }}>{duration < 60 ? `${duration}m` : `${duration / 60}h`}</div>
                    <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>Est. Time</div>
                  </div>
                  <div>
                    <div style={{ color: '#FFD700', fontSize: 24, fontWeight: 800 }}>{(totalDistance * 0.621371).toFixed(1)} mi</div>
                    <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>Distance</div>
                  </div>
                </div>

                {/* House List */}
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {routeHouses.map((h, i) => (
                    <div key={h.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: 14,
                      background: '#111111', borderRadius: 10, border: '1px solid #333',
                      transition: 'border-color 0.2s',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 16, background: '#B22222',
                        border: '2px solid #FFD700', color: '#fff', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0,
                      }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.address}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <span style={{ color: '#FFD700', fontSize: 13 }}>{'★'.repeat(Math.round(h.avg_rating ?? 0))}{'☆'.repeat(5 - Math.round(h.avg_rating ?? 0))} {(h.avg_rating ?? 0).toFixed(1)}</span>
                          <span style={{ color: '#666', fontSize: 11 }}>{h.features.map(f => FEATURE_EMOJI[f]).join(' ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Share */}
                <button onClick={handleShare} style={{
                  marginTop: 16, width: '100%', padding: '14px 0', borderRadius: 12,
                  border: '1px solid #FFD700', background: 'transparent', color: '#FFD700',
                  fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  {copied ? '✅ Link Copied!' : '🔗 Share Route'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        body { margin: 0; background: #000000; }
        .twinkle-marker { background: none !important; border: none !important; }
        input:focus { outline: none; border-color: #FFD700 !important; box-shadow: 0 0 0 2px rgba(255,215,0,0.2); }
        input::placeholder { color: #555; }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#ccc', fontSize: 14, fontWeight: 600, marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  padding: '12px 14px', borderRadius: 10, border: '1px solid #222',
  backgroundColor: '#111111', color: '#fff', fontSize: 15, fontFamily: 'inherit',
  boxSizing: 'border-box' as const, transition: 'border-color 0.2s, box-shadow 0.2s',
};
