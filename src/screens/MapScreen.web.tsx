import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../hooks/useLocation';
import { useHouses, type HouseFilters } from '../hooks/useHouses';
import { FilterSheet, type FilterValues } from '../components/FilterSheet';
import { HouseDetailPanel } from '../components/HouseDetail.web';
import type { Feature, House } from '../types';

const DALLAS: [number, number] = [32.7767, -96.7970];

function ratingToColor(rating: number): string {
  if (rating >= 4) return '#FFD700';
  if (rating >= 3) return '#FFA500';
  if (rating >= 2) return '#CD853F';
  return '#8B7355';
}

function createStarIcon(house: House): L.DivIcon {
  const rating = house.avg_rating ?? 0;
  const color = ratingToColor(rating);
  const scale = rating >= 4.5 ? 1.3 : rating >= 4 ? 1.15 : rating >= 3 ? 1 : 0.85;
  const glow = rating >= 4 ? 8 : 4;

  return L.divIcon({
    className: 'twinkle-marker',
    html: `
      <div class="twinkle-star" style="transform:scale(${scale});filter:drop-shadow(0 0 ${glow}px ${color})" data-color="${color}" data-scale="${scale}" data-glow="${glow}">
        <span style="font-size:28px;color:${color};line-height:1">✦</span>
        ${rating > 0 ? `<span style="font-size:10px;font-weight:700;color:#1a1a2e;background:${color};border-radius:6px;padding:1px 4px;margin-top:-2px">${rating.toFixed(1)}</span>` : ''}
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 25],
    popupAnchor: [0, -25],
  });
}

function popupHtml(house: House): string {
  const rating = house.avg_rating ?? 0;
  const features = (house.features as Feature[])
    .map((f) => `<span style="background:#2a2a4e;color:#FFD700;font-size:11px;padding:2px 8px;border-radius:8px;display:inline-block">${f}</span>`)
    .join(' ');

  return `
    <div style="min-width:240px">
      ${house.photos.length > 0 ? `<img src="${house.photos[0]}" style="width:100%;height:140px;object-fit:cover;border-radius:10px 10px 0 0" />` : ''}
      <div style="padding:12px 14px">
        <div style="color:#fff;font-size:15px;font-weight:600;margin-bottom:4px">${house.address}</div>
        <div style="font-size:14px;margin-bottom:6px">
          <span style="color:#888;font-weight:600">Rating</span> <span style="color:#FFD700;font-weight:700">${rating.toFixed(1)}</span> <span style="color:#888;font-size:12px">(${house.rating_count ?? 0})</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${features}</div>
        ${house.description ? `<p style="color:#aaa;font-size:12px;margin:8px 0 0;line-height:1.4">${house.description}</p>` : ''}
        <div style="display:flex;align-items:center;gap:8px;margin-top:8px;color:#aaa;font-size:12px">
          ${house.local_rank ? `<span>🏆 #${house.local_rank} locally</span>` : ''}
          <span>·</span>
          <span>${house.votes} votes</span>
        </div>
        <button data-house-id="${house.id}" style="display:block;width:100%;margin-top:10px;padding:8px 0;text-align:center;background:linear-gradient(135deg,#FFD700,#FFA500);color:#1a1a2e;border-radius:8px;border:none;font-size:13px;font-weight:700;cursor:pointer">View Details →</button>
      </div>
    </div>
  `;
}

function FlyToLocation({ center }: { center: [number, number] }) {
  const map = useMap();
  const flown = useRef(false);
  useEffect(() => {
    if (!flown.current) {
      map.flyTo(center, 11, { duration: 1.5 });
      flown.current = true;
    }
  }, [center, map]);
  return null;
}

export default function MapScreenWeb() {
  const { location, loading: locationLoading } = useLocation();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({
    radius: 10,
    minRating: 0,
    features: [],
  });

  const houseFilters: HouseFilters = {
    minRating: filterValues.minRating,
    features: filterValues.features.length > 0 ? filterValues.features : undefined,
  };

  const { houses } = useHouses(houseFilters);

  // Handle "View Details" clicks from popup buttons
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('[data-house-id]') as HTMLElement | null;
      if (btn) {
        const id = btn.getAttribute('data-house-id');
        const house = houses.find(h => h.id === id);
        if (house) setSelectedHouse(house);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [houses]);

  const center: [number, number] = location
    ? [location.coords.latitude, location.coords.longitude]
    : DALLAS;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e', position: 'relative' }}>
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'linear-gradient(to bottom, rgba(26,26,46,0.95), rgba(26,26,46,0))',
          pointerEvents: 'none',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 800,
            color: '#FFD700',
            textShadow: '0 0 20px rgba(255,215,0,0.4)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            pointerEvents: 'auto',
          }}
        >
          Twinkle ✨
        </h1>
        <button
          onClick={() => setFiltersVisible(true)}
          style={{
            padding: '8px 18px',
            borderRadius: 24,
            border: '1px solid #444',
            backgroundColor: '#1a1a2e',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            pointerEvents: 'auto',
          }}
        >
          ⚙ Filters
          {(filterValues.minRating > 0 || filterValues.features.length > 0) && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#B22222',
                display: 'inline-block',
              }}
            />
          )}
        </button>
      </div>

      {/* Loading */}
      {locationLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            backgroundColor: '#1a1a2e',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
            <p style={{ color: '#FFD700', fontSize: 16 }}>Finding your location...</p>
          </div>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={center}
        zoom={11}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <FlyToLocation center={center} />
        {houses.map((house) => (
          <Marker
            key={house.id}
            position={[house.lat, house.lng]}
            icon={createStarIcon(house)}
          >
            <Popup maxWidth={320} className="twinkle-popup">
              <div dangerouslySetInnerHTML={{ __html: popupHtml(house) }} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Featured Sidebar */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 280,
        background: 'linear-gradient(to bottom, rgba(26,26,46,0.97), rgba(26,26,46,0.95))',
        zIndex: 999, overflowY: 'auto', borderLeft: '1px solid #2a2a4e',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ padding: '16px 14px 8px', borderBottom: '1px solid #2a2a4e' }}>
          <h2 style={{ color: '#FFD700', fontSize: 15, fontWeight: 800, margin: 0, letterSpacing: 1, textTransform: 'uppercase' }}>
            Featured
          </h2>
        </div>
        <div style={{ padding: '8px 10px' }}>
          {houses.filter(h => h.is_featured).map(h => {
            const r = h.avg_rating ?? 0;
            return (
              <div
                key={h.id}
                onClick={() => setSelectedHouse(h)}
                style={{
                  background: '#2a2a4e', borderRadius: 10, marginBottom: 8,
                  overflow: 'hidden', cursor: 'pointer', border: '1px solid #333',
                  transition: 'border-color 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#FFD700'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#333'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                <img src={h.photos[0]} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1.3, marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.address}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12 }}>
                      <span style={{ color: '#888' }}>Rating </span>
                      <span style={{ color: '#FFD700', fontWeight: 700 }}>{r.toFixed(1)}</span>
                      {h.local_rank && <span style={{ color: '#666', marginLeft: 6 }}>#{h.local_rank} local</span>}
                    </span>
                  </div>
                  <div style={{
                    marginTop: 6, padding: '4px 0', textAlign: 'center',
                    background: 'rgba(255,215,0,0.1)', borderRadius: 6,
                    color: '#FFD700', fontSize: 11, fontWeight: 700,
                  }}>
                    View Listing
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* House Detail Panel */}
      {selectedHouse && (
        <HouseDetailPanel house={selectedHouse} onClose={() => setSelectedHouse(null)} />
      )}

      {/* Filter Sheet */}
      <FilterSheet
        visible={filtersVisible}
        initialValues={filterValues}
        onApply={(values) => setFilterValues(values)}
        onClose={() => setFiltersVisible(false)}
      />

      <style>{`
        body { margin: 0; padding: 0; overflow: hidden; background: #1a1a2e; }
        .twinkle-marker { background: none !important; border: none !important; }
        .twinkle-star {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s ease, filter 0.2s ease;
        }
        .twinkle-star:hover {
          transform: scale(1.4) !important;
          filter: drop-shadow(0 0 12px #FFD700) !important;
        }
        .leaflet-popup-content-wrapper {
          background: #1a1a2e !important;
          border: 1px solid #FFD700 !important;
          border-radius: 12px !important;
          padding: 0 !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-popup-tip {
          background: #1a1a2e !important;
          border: 1px solid #FFD700 !important;
          border-top: none !important;
          border-left: none !important;
        }
        .leaflet-popup-close-button {
          color: #888 !important;
          font-size: 20px !important;
        }
        .leaflet-popup-close-button:hover {
          color: #FFD700 !important;
        }
        .leaflet-control-attribution {
          background: rgba(26,26,46,0.7) !important;
          color: #666 !important;
        }
        .leaflet-control-attribution a {
          color: #888 !important;
        }
      `}</style>
    </div>
  );
}
