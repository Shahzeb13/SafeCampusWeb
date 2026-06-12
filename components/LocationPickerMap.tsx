import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix missing marker icons in Next.js/Leaflet integration
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to handle flying to a new location when search is performed
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
}

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({ lat, lng, onLocationSelect }: LocationPickerMapProps) {
  // Default to Islamabad coordinates if none provided
  const defaultCenter: [number, number] = [33.6844, 73.0479];
  const [mapCenter, setMapCenter] = useState<[number, number]>(lat && lng ? [lat, lng] : defaultCenter);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      // Use OpenStreetMap's free Nominatim API
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);
        
        setMapCenter([newLat, newLng]);
        // Also auto-select the location
        onLocationSelect(newLat, newLng);
      } else {
        alert("Location not found. Try a broader search term.");
      }
    } catch (err) {
      console.error("Search failed", err);
      alert("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Search Bar Overlay */}
      <div style={{
        position: 'absolute', top: 10, left: 10, right: 10, zIndex: 1000,
        display: 'flex', gap: '8px'
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Search for a place (e.g. Comsats Lahore)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: '8px',
              border: '1px solid #e4e4e7', outline: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              fontFamily: 'inherit', fontSize: '14px'
            }}
          />
          <button 
            type="submit" 
            disabled={searching}
            style={{
              padding: '0 16px', background: '#0052cc', color: 'white',
              border: 'none', borderRadius: '8px', fontWeight: 'bold',
              cursor: searching ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              opacity: searching ? 0.7 : 1
            }}
          >
            {searching ? '...' : 'Search'}
          </button>
        </form>
      </div>

      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} />
        <MapEvents onLocationSelect={onLocationSelect} />
        {lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng) && (
          <Marker position={[lat, lng]} />
        )}
      </MapContainer>
    </div>
  );
}
