import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Feature } from '../types';

type LightCount = '1-5000' | '5001-10000' | '10000+';
type MusicType = 'LIVE' | 'RADIO';

const BASE_FEATURES: { key: Feature; emoji: string }[] = [
  { key: 'Lights', emoji: '🎄' },
  { key: 'Music', emoji: '🎶' },
  { key: 'Strobes', emoji: '⚡' },
  { key: 'Animatronics', emoji: '🦌' },
  { key: 'Blowups', emoji: '⛄' },
];

const LIGHT_COUNTS: { label: string; value: LightCount }[] = [
  { label: '1 – 5,000', value: '1-5000' },
  { label: '5,001 – 10,000', value: '5001-10000' },
  { label: '10,000+', value: '10000+' },
];

const DALLAS: [number, number] = [32.7767, -96.7970];

// Simple geocoding via Nominatim (free, no API key)
async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { 'User-Agent': 'Twinkle-App' } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch {}
  return null;
}

function MiniMap({ position }: { position: [number, number] }) {
  const [mapMod, setMapMod] = useState<any>(null);
  const [leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    Promise.all([import('react-leaflet'), import('leaflet')]).then(([rl, L]) => {
      setMapMod(rl);
      setLeaflet(L);
    });
    if (!document.getElementById('leaflet-css-add')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-add';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  if (!mapMod || !leaflet) {
    return (
      <div style={{ height: 220, background: '#111111', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
        Loading map...
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, useMap } = mapMod;

  const icon = leaflet.divIcon({
    className: 'twinkle-marker',
    html: '<span style="font-size:28px">📍</span>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

  function FlyTo({ pos }: { pos: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      map.flyTo(pos, 15, { duration: 1 });
    }, [pos[0], pos[1]]);
    return null;
  }

  return (
    <MapContainer center={position} zoom={15} style={{ height: 220, borderRadius: 12, overflow: 'hidden' }} zoomControl={false}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <Marker position={position} icon={icon} />
      <FlyTo pos={position} />
    </MapContainer>
  );
}

export default function AddHouseScreenWeb() {
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<Feature[]>([]);
  const [lightCount, setLightCount] = useState<LightCount | null>(null);
  const [musicType, setMusicType] = useState<MusicType | null>(null);
  const [radioStation, setRadioStation] = useState('');
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [markerPos, setMarkerPos] = useState<[number, number]>(DALLAS);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-geocode when address changes (debounced)
  useEffect(() => {
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    if (address.trim().length < 5) {
      setGeocodeStatus(null);
      return;
    }
    setGeocodeStatus('Searching...');
    geocodeTimer.current = setTimeout(async () => {
      setGeocoding(true);
      const result = await geocodeAddress(address);
      if (result) {
        setMarkerPos(result);
        setGeocodeStatus('📍 Location found!');
      } else {
        setGeocodeStatus('⚠ Could not find address');
      }
      setGeocoding(false);
    }, 1000);
    return () => { if (geocodeTimer.current) clearTimeout(geocodeTimer.current); };
  }, [address]);

  const toggleFeature = (f: Feature) => {
    setFeatures(prev => {
      const next = prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f];
      // Clear sub-options when deselecting
      if (!next.includes('Lights')) setLightCount(null);
      if (!next.includes('Music')) { setMusicType(null); setRadioStation(''); }
      return next;
    });
  };

  const addPhotos = useCallback((files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - photos.length;
    const newPhotos = Array.from(files).slice(0, remaining).map(file => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  }, [photos.length]);

  const removePhoto = (idx: number) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = () => {
    const errs: string[] = [];
    if (!address.trim()) errs.push('Address is required');
    if (features.length === 0) errs.push('Select at least one feature');
    if (features.includes('Lights') && !lightCount) errs.push('Select a light count');
    if (features.includes('Music') && !musicType) errs.push('Select music type (Live or Radio)');
    if (features.includes('Music') && musicType === 'RADIO' && !radioStation.trim()) errs.push('Enter the radio station');
    setErrors(errs);
    if (errs.length > 0) return;

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setAddress('');
    setDescription('');
    setFeatures([]);
    setLightCount(null);
    setMusicType(null);
    setRadioStation('');
    setPhotos([]);
    setMarkerPos(DALLAS);
    setGeocodeStatus(null);
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#000000', overflowY: 'auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 100px' }}>
        <h1 style={{
          fontSize: 42, fontWeight: 700, margin: '0 0 4px',
          fontFamily: "'Mountains of Christmas', cursive",
          background: 'linear-gradient(90deg, #FFD700, #FFA500, #ff4d6d, #4ade80, #22d3ee, #FFFFFF, #22d3ee, #4ade80, #ff4d6d, #FFA500, #FFD700)',
          backgroundSize: '400% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text' as any,
          animation: 'twinkle-shimmer 12s linear infinite',
        }}>
          Add a House
        </h1>
        <p style={{ color: '#888', fontSize: 14, margin: '0 0 28px' }}>Share an amazing Christmas lights display with the community</p>

        {/* Address */}
        <label style={labelStyle}>Address *</label>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="1234 Candy Cane Ln, Dallas, TX"
          style={inputStyle}
        />
        {geocodeStatus && (
          <p style={{ color: geocodeStatus.includes('found') ? '#4ade80' : geocodeStatus.includes('⚠') ? '#ff6b6b' : '#888', fontSize: 12, margin: '4px 0 0' }}>
            {geocoding ? '🔍 ' : ''}{geocodeStatus}
          </p>
        )}

        {/* Map (auto-pinned) */}
        <div style={{ marginTop: 12 }}>
          <MiniMap position={markerPos} />
        </div>

        {/* Description */}
        <label style={{ ...labelStyle, marginTop: 20 }}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Tell us about this display..."
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
        />

        {/* Features */}
        <label style={{ ...labelStyle, marginTop: 24 }}>Features *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {BASE_FEATURES.map(({ key, emoji }) => (
            <button
              key={key}
              onClick={() => toggleFeature(key)}
              style={{
                padding: '10px 18px',
                borderRadius: 24,
                border: `2px solid ${features.includes(key) ? '#4ade80' : '#444'}`,
                backgroundColor: features.includes(key) ? 'rgba(178,34,34,0.6)' : '#111111',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 18 }}>{emoji}</span> {key}
            </button>
          ))}
        </div>

        {/* Lights sub-options */}
        {features.includes('Lights') && (
          <div style={{ marginTop: 16, padding: 16, background: '#111111', borderRadius: 12, border: '1px solid #222' }}>
            <label style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18 }}>🎄</span> How many lights? *
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LIGHT_COUNTS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setLightCount(value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: `2px solid ${lightCount === value ? '#4ade80' : '#555'}`,
                    backgroundColor: lightCount === value ? 'rgba(255,215,0,0.15)' : 'transparent',
                    color: lightCount === value ? '#4ade80' : '#ccc',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {value === '10000+' ? '🌟 ' : '✨ '}{label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Music sub-options */}
        {features.includes('Music') && (
          <div style={{ marginTop: 12, padding: 16, background: '#111111', borderRadius: 12, border: '1px solid #222' }}>
            <label style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18 }}>🎶</span> Music type *
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setMusicType('LIVE'); setRadioStation(''); }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 20,
                  border: `2px solid ${musicType === 'LIVE' ? '#4ade80' : '#555'}`,
                  backgroundColor: musicType === 'LIVE' ? 'rgba(255,215,0,0.15)' : 'transparent',
                  color: musicType === 'LIVE' ? '#4ade80' : '#ccc',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                🔊 LIVE
              </button>
              <button
                onClick={() => setMusicType('RADIO')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 20,
                  border: `2px solid ${musicType === 'RADIO' ? '#4ade80' : '#555'}`,
                  backgroundColor: musicType === 'RADIO' ? 'rgba(255,215,0,0.15)' : 'transparent',
                  color: musicType === 'RADIO' ? '#4ade80' : '#ccc',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                📻 RADIO
              </button>
            </div>
            {musicType === 'RADIO' && (
              <div style={{ marginTop: 12 }}>
                <label style={{ ...labelStyle, fontSize: 12 }}>Radio Station / Frequency *</label>
                <input
                  type="text"
                  value={radioStation}
                  onChange={e => setRadioStation(e.target.value)}
                  placeholder="e.g. 100.3 FM or iHeartRadio link"
                  style={{ ...inputStyle, fontSize: 14 }}
                />
              </div>
            )}
          </div>
        )}

        {/* Photos */}
        <label style={{ ...labelStyle, marginTop: 24 }}>
          Photos <span style={{ color: '#888', fontWeight: 400 }}>({photos.length}/5)</span>
        </label>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); addPhotos(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#4ade80' : '#444'}`,
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s, background 0.2s',
            background: dragOver ? 'rgba(255,215,0,0.05)' : 'transparent',
            marginTop: 4,
          }}
        >
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => addPhotos(e.target.files)} />
          <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
          <p style={{ color: '#aaa', margin: 0, fontSize: 14 }}>Drag & drop photos or click to browse</p>
        </div>

        {photos.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {photos.map((p, i) => (
              <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                <img src={p.url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #222' }} />
                <button
                  onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                  style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, background: '#B22222', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(178,34,34,0.2)', borderRadius: 8, border: '1px solid #B22222' }}>
            {errors.map((e, i) => <p key={i} style={{ color: '#ff6b6b', margin: i > 0 ? '4px 0 0' : 0, fontSize: 13 }}>⚠ {e}</p>)}
          </div>
        )}

        {/* Submit */}
        <button
          className="gradient-border-btn"
          onClick={handleSubmit}
          style={{
            marginTop: 24,
            width: '100%',
            padding: '16px 0',
            borderRadius: 12,
            background: 'none',
            fontSize: 20,
            fontWeight: 700,
            fontFamily: "'Mountains of Christmas', cursive",
            cursor: 'pointer',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'none'; }}
        >
          <span style={{
            background: 'linear-gradient(90deg, #FFD700, #FFA500, #ff4d6d, #4ade80, #22d3ee, #FFFFFF, #22d3ee, #4ade80, #ff4d6d, #FFA500, #FFD700)',
            backgroundSize: '400% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text' as any,
            animation: 'twinkle-shimmer 12s linear infinite',
          }}>Add House</span>
        </button>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: '#111111', border: '1px solid #4ade80', borderRadius: 12,
          padding: '16px 24px', zIndex: 9999, boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          animation: 'fadeInUp 0.3s ease',
        }}>
          <p style={{ color: '#4ade80', margin: 0, fontSize: 16, fontWeight: 700 }}>🎉 House added successfully!</p>
          <p style={{ color: '#aaa', margin: '4px 0 0', fontSize: 13 }}>It will appear on the map shortly.</p>
        </div>
      )}

      <style>{`
        body { margin: 0; background: #000000; }
        .twinkle-marker { background: none !important; border: none !important; }
        input:focus, textarea:focus { outline: none; border-color: #4ade80 !important; box-shadow: 0 0 0 2px rgba(255,215,0,0.2); }
        input::placeholder, textarea::placeholder { color: #555; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
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
          border-radius: 14px;
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

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#ccc', fontSize: 14, fontWeight: 600, marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1px solid #222', backgroundColor: '#111111', color: '#fff',
  fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};
