import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocation } from '../hooks/useLocation';
import { useHouses, type HouseFilters } from '../hooks/useHouses';
import { FilterSheet, type FilterValues } from '../components/FilterSheet';
import type { Feature, House } from '../types';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
const DALLAS = { lat: 32.7767, lng: -96.7970 };

function ratingToColor(rating: number): string {
  if (rating >= 4) return '#FFD700';
  if (rating >= 3) return '#FFA500';
  if (rating >= 2) return '#CD853F';
  return '#8B7355';
}

export default function MapScreenWeb() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const popupRef = useRef<any>(null);
  const { location, loading: locationLoading } = useLocation();
  const [filtersVisible, setFiltersVisible] = useState(false);
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

  const center = location
    ? { lat: location.coords.latitude, lng: location.coords.longitude }
    : DALLAS;

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let mapboxgl: any;
    try {
      mapboxgl = require('mapbox-gl');
    } catch {
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [center.lng, center.lat],
      zoom: 11,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    map.addControl(
      new mapboxgl.GeolocateControl({ trackUserLocation: true }),
      'bottom-right',
    );

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center when location arrives
  useEffect(() => {
    if (mapRef.current && location) {
      mapRef.current.flyTo({
        center: [location.coords.longitude, location.coords.latitude],
        zoom: 11,
        duration: 1500,
      });
    }
  }, [location]);

  // Update markers when houses change
  useEffect(() => {
    if (!mapRef.current) return;

    let mapboxgl: any;
    try {
      mapboxgl = require('mapbox-gl');
    } catch {
      return;
    }

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    houses.forEach((house) => {
      const rating = house.avg_rating ?? 0;
      const color = ratingToColor(rating);
      const scale = rating >= 4.5 ? 1.3 : rating >= 4 ? 1.15 : rating >= 3 ? 1 : 0.85;

      const el = document.createElement('div');
      el.style.cssText = `
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: scale(${scale});
        transition: transform 0.2s ease, filter 0.2s ease;
        filter: drop-shadow(0 0 ${rating >= 4 ? '8px' : '4px'} ${color});
      `;
      el.innerHTML = `
        <span style="font-size:28px;color:${color};line-height:1">✦</span>
        ${rating > 0 ? `<span style="font-size:10px;font-weight:700;color:#1a1a2e;background:${color};border-radius:6px;padding:1px 4px;margin-top:-2px">${rating.toFixed(1)}</span>` : ''}
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = `scale(${scale * 1.25})`;
        el.style.filter = `drop-shadow(0 0 12px ${color})`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = `scale(${scale})`;
        el.style.filter = `drop-shadow(0 0 ${rating >= 4 ? '8px' : '4px'} ${color})`;
      });

      el.addEventListener('click', () => {
        if (popupRef.current) popupRef.current.remove();

        const features = (house.features as Feature[])
          .map((f) => `<span style="background:#2a2a4e;color:#FFD700;font-size:11px;padding:2px 8px;border-radius:8px">${f}</span>`)
          .join('');

        const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

        const html = `
          <div style="min-width:240px">
            ${house.photos.length > 0 ? `<img src="${house.photos[0]}" style="width:100%;height:140px;object-fit:cover;border-radius:10px 10px 0 0" />` : ''}
            <div style="padding:12px 14px">
              <div style="color:#fff;font-size:15px;font-weight:600;margin-bottom:4px">${house.address}</div>
              <div style="color:#FFD700;font-size:14px;margin-bottom:6px">
                ${stars}
                <span style="color:#ccc;font-size:12px;margin-left:6px">${rating.toFixed(1)} (${house.rating_count ?? 0})</span>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:4px">${features}</div>
              ${house.description ? `<p style="color:#aaa;font-size:12px;margin:8px 0 0;line-height:1.4">${house.description}</p>` : ''}
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '320px' })
          .setLngLat([house.lng, house.lat])
          .setHTML(html)
          .addTo(mapRef.current);

        popupRef.current = popup;
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([house.lng, house.lat])
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [houses]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e', position: 'relative' }}>
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
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
            zIndex: 5,
            backgroundColor: '#1a1a2e',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
            <p style={{ color: '#FFD700', fontSize: 16 }}>Finding your location...</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Filter Sheet */}
      <FilterSheet
        visible={filtersVisible}
        initialValues={filterValues}
        onApply={(values) => setFilterValues(values)}
        onClose={() => setFiltersVisible(false)}
      />

      <style>{`
        body { margin: 0; padding: 0; overflow: hidden; background: #1a1a2e; }
        .mapboxgl-popup-content {
          background: #1a1a2e !important;
          border: 1px solid #FFD700 !important;
          border-radius: 12px !important;
          padding: 0 !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
          overflow: hidden;
        }
        .mapboxgl-popup-close-button {
          color: #888 !important;
          font-size: 20px !important;
          right: 6px !important;
          top: 4px !important;
          z-index: 1;
        }
        .mapboxgl-popup-close-button:hover {
          color: #FFD700 !important;
          background: none !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: #FFD700 !important;
        }
      `}</style>
    </div>
  );
}
