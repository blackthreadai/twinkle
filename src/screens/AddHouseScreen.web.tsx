import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Feature } from '../types';

const ALL_FEATURES: Feature[] = ['Lights', 'Music', 'Strobes', 'Animatronics', 'Blowups'];
const FEATURE_EMOJI: Record<Feature, string> = {
  Lights: '💡', Music: '🎵', Strobes: '⚡', Animatronics: '🤖', Blowups: '🎈',
};

const DALLAS: [number, number] = [32.7767, -96.7970];

function MiniMap({ position, onPositionChange }: { position: [number, number]; onPositionChange: (pos: [number, number]) => void }) {
  const [mapMod, setMapMod] = useState<any>(null);
  const [leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([rl, L]) => {
      setMapMod(rl);
      setLeaflet(L);
    });
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  if (!mapMod || !leaflet) {
    return <div style={{ height: 250, background: '#2a2a4e', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Loading map...</div>;
  }

  const { MapContainer, TileLayer, Marker, useMapEvents } = mapMod;

  const icon = leaflet.divIcon({
    className: 'twinkle-marker',
    html: '<span style="font-size:32px">📍</span>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  function ClickHandler() {
    useMapEvents({
      click(e: any) {
        onPositionChange([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  return (
    <MapContainer center={position} zoom={12} style={{ height: 250, borderRadius: 12, overflow: 'hidden' }} zoomControl={false}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <Marker position={position} icon={icon} draggable eventHandlers={{ dragend: (e: any) => { const ll = e.target.getLatLng(); onPositionChange([ll.lat, ll.lng]); } }} />
      <ClickHandler />
    </MapContainer>
  );
}

export default function AddHouseScreenWeb() {
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<Feature[]>([]);
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [markerPos, setMarkerPos] = useState<[number, number]>(DALLAS);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleFeature = (f: Feature) => {
    setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
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
    setErrors(errs);
    if (errs.length > 0) return;

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    // Reset
    setAddress('');
    setDescription('');
    setFeatures([]);
    setPhotos([]);
    setMarkerPos(DALLAS);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e', overflowY: 'auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 100px' }}>
        <h1 style={{ color: '#FFD700', fontSize: 28, fontWeight: 800, margin: '0 0 4px', textShadow: '0 0 20px rgba(255,215,0,0.3)' }}>
          ➕ Add a House
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

        {/* Map */}
        <label style={{ ...labelStyle, marginTop: 20 }}>Pin Location <span style={{ color: '#888', fontWeight: 400 }}>(click or drag marker)</span></label>
        <MiniMap position={markerPos} onPositionChange={setMarkerPos} />
        <p style={{ color: '#666', fontSize: 11, margin: '4px 0 0' }}>
          {markerPos[0].toFixed(4)}, {markerPos[1].toFixed(4)}
        </p>

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
        <label style={{ ...labelStyle, marginTop: 20 }}>Features *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {ALL_FEATURES.map(f => (
            <button
              key={f}
              onClick={() => toggleFeature(f)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: `1px solid ${features.includes(f) ? '#FFD700' : '#444'}`,
                backgroundColor: features.includes(f) ? '#B22222' : '#2a2a4e',
                color: '#fff',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {FEATURE_EMOJI[f]} {f}
            </button>
          ))}
        </div>

        {/* Photos */}
        <label style={{ ...labelStyle, marginTop: 20 }}>Photos <span style={{ color: '#888', fontWeight: 400 }}>({photos.length}/5)</span></label>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); addPhotos(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#FFD700' : '#444'}`,
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
                <img src={p.url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #444' }} />
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
          onClick={handleSubmit}
          style={{
            marginTop: 24,
            width: '100%',
            padding: '16px 0',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#1a1a2e',
            fontSize: 18,
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
            boxShadow: '0 4px 15px rgba(255,215,0,0.3)',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 6px 20px rgba(255,215,0,0.5)'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'none'; (e.target as HTMLElement).style.boxShadow = '0 4px 15px rgba(255,215,0,0.3)'; }}
        >
          ✨ Add House
        </button>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: '#2a2a4e', border: '1px solid #FFD700', borderRadius: 12,
          padding: '16px 24px', zIndex: 9999, boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          animation: 'fadeInUp 0.3s ease',
        }}>
          <p style={{ color: '#FFD700', margin: 0, fontSize: 16, fontWeight: 700 }}>🎉 House added successfully!</p>
          <p style={{ color: '#aaa', margin: '4px 0 0', fontSize: 13 }}>It will appear on the map shortly.</p>
        </div>
      )}

      <style>{`
        body { margin: 0; background: #1a1a2e; }
        .twinkle-marker { background: none !important; border: none !important; }
        input:focus, textarea:focus { outline: none; border-color: #FFD700 !important; box-shadow: 0 0 0 2px rgba(255,215,0,0.2); }
        input::placeholder, textarea::placeholder { color: #555; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#ccc', fontSize: 14, fontWeight: 600, marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1px solid #444', backgroundColor: '#2a2a4e', color: '#fff',
  fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};
