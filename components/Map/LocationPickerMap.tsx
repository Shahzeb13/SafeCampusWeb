"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Props ─────────────────────────────────────────────────────────────────────
export interface LocationPickerMapProps {
  /** Initial latitude (optional) */
  latitude?: number;
  /** Initial longitude (optional) */
  longitude?: number;
  /** Geofence radius in meters – shows a circle preview */
  radiusMeters?: number;
  /** Called when user picks a location */
  onChange: (lat: number, lng: number, displayName?: string) => void;
}

// ─── Nominatim search result ───────────────────────────────────────────────────
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// ─── Custom pin icon ──────────────────────────────────────────────────────────
const pinIcon = L.divIcon({
  html: `<div style="
    width:34px;height:34px;border-radius:50% 50% 50% 0;
    background:#6366f1;border:3px solid #fff;
    transform:rotate(-45deg);
    box-shadow:0 4px 14px rgba(99,102,241,0.5);
  "></div>`,
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

// ─── Internal component: updates map view when position changes ───────────────
function FlyTo({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(pos, 16, { duration: 1.2 });
  }, [pos, map]);
  return null;
}

// ─── Internal component: handles clicks on the map ───────────────────────────
function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function LocationPickerMap({
  latitude,
  longitude,
  radiusMeters = 1000,
  onChange,
}: LocationPickerMapProps) {
  const hasInitial = latitude !== undefined && longitude !== undefined && latitude !== 0 && longitude !== 0;
  const defaultCenter: [number, number] = hasInitial ? [latitude!, longitude!] : [33.9911, 73.1400]; // Abbottabad default

  const [position, setPosition] = useState<[number, number] | null>(hasInitial ? [latitude!, longitude!] : null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(hasInitial ? [latitude!, longitude!] : null);

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with parent props on first load
  useEffect(() => {
    if (hasInitial) {
      setPosition([latitude!, longitude!]);
      setFlyTarget([latitude!, longitude!]);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchNominatim = async (q: string) => {
    if (q.trim().length < 3) { setResults([]); setShowDropdown(false); return; }
    try {
      setSearching(true);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setShowDropdown(data.length > 0);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchNominatim(val), 400);
  };

  const handleSelectResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPosition([lat, lng]);
    setFlyTarget([lat, lng]);
    setQuery(result.display_name);
    setShowDropdown(false);
    onChange(lat, lng, result.display_name);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    // Reverse geocode to get address
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      const name = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setQuery(name);
      onChange(lat, lng, name);
    } catch {
      setQuery(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      onChange(lat, lng);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid #e4e4e7' }}>
      {/* Search Bar */}
      <div ref={dropdownRef} style={{ position: 'relative', background: '#fff', borderBottom: '1px solid #e4e4e7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px' }}>
          {/* Magnifier icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={handleSearchInput}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder="Search for a location… e.g. COMSATS Abbottabad"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem', color: '#09090b', background: 'transparent', fontFamily: 'inherit' }}
          />
          {searching && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
          {query && !searching && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); setShowDropdown(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, lineHeight: 1 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && results.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
            background: '#fff', border: '1px solid #e4e4e7', borderTop: 'none',
            borderRadius: '0 0 10px 10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            maxHeight: 240, overflowY: 'auto',
          }}>
            {results.map(r => (
              <button
                key={r.place_id}
                type="button"
                onClick={() => handleSelectResult(r)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none',
                  background: 'none', cursor: 'pointer', borderBottom: '1px solid #f4f4f5',
                  display: 'flex', alignItems: 'flex-start', gap: 8, transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.4 }}>{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ height: 300, position: 'relative' }}>
        {/* Map Type Toggle */}
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 1000,
          background: 'rgba(255,255,255,0.9)', borderRadius: 8, padding: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', gap: 4
        }}>
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            style={{
              padding: '4px 8px', fontSize: '0.7rem', fontWeight: 600, border: 'none',
              borderRadius: 6, cursor: 'pointer',
              background: mapType === 'roadmap' ? '#6366f1' : 'transparent',
              color: mapType === 'roadmap' ? '#fff' : '#4b5563',
              transition: 'all 0.2s'
            }}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setMapType('hybrid')}
            style={{
              padding: '4px 8px', fontSize: '0.7rem', fontWeight: 600, border: 'none',
              borderRadius: 6, cursor: 'pointer',
              background: mapType === 'hybrid' ? '#6366f1' : 'transparent',
              color: mapType === 'hybrid' ? '#fff' : '#4b5563',
              transition: 'all 0.2s'
            }}
          >
            Satellite
          </button>
        </div>

        <MapContainer
          center={position ?? defaultCenter}
          zoom={position ? 16 : 12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          {mapType === 'roadmap' ? (
            <TileLayer
              attribution='&copy; Google Maps'
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            />
          ) : (
            <TileLayer
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          <ClickHandler onPick={handleMapClick} />
          {flyTarget && <FlyTo pos={flyTarget} />}
          {position && (
            <>
              <Marker position={position} icon={pinIcon} />
              <Circle
                center={position}
                radius={radiusMeters}
                pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.08, weight: 2, dashArray: '5,8' }}
              />
            </>
          )}
        </MapContainer>

        {/* Hint overlay */}
        {!position && (
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(9,9,11,0.7)', color: '#fff', borderRadius: 8, padding: '6px 14px',
            fontSize: '0.78rem', fontWeight: 600, zIndex: 500, pointerEvents: 'none', whiteSpace: 'nowrap',
          }}>
            🖱 Click on the map or search above to pick a location
          </div>
        )}

        {/* Coordinates readout */}
        {position && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12, zIndex: 500,
            background: 'rgba(9,9,11,0.75)', color: '#fff', borderRadius: 8, padding: '6px 12px',
            fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ color: '#a5b4fc' }}>📍</span>
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
        )}
      </div>

      {/* Spinner keyframes injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
