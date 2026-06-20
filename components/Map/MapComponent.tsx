"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat'; // Add this for heatmap support
import { MapComponentProps, MapMarker } from './types';


// Utility component to handle heatmap rendering
function HeatmapLayer({ markers, visible }: { markers: MapMarker[], visible: boolean }) {
  const map = useMap();
  const heatLayerRef = React.useRef<any>(null);

  useEffect(() => {
    if (visible && markers.length > 0) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
      
      const heatPoints = markers.map(m => [m.latitude, m.longitude, 1]); // intensity 1 for now
      // @ts-ignore - leaflet.heat is not in standard L types usually
      heatLayerRef.current = L.heatLayer(heatPoints as any, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.4: 'blue',
          0.6: 'cyan',
          0.7: 'lime',
          0.8: 'yellow',
          1.0: 'red'
        }
      }).addTo(map);
    } else {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [visible, markers, map]);

  return null;
}

// Utility component to handle dynamic center updating.
// Only sets the initial view ONCE on mount — never resets zoom on polling updates.
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  const hasInitialized = React.useRef(false);

  // One-time: fix tile rendering after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  // Only fly to the center the very first time (so user zoom is never reset by polling)
  useEffect(() => {
    if (!hasInitialized.current) {
      map.invalidateSize();
      map.setView(center, zoom);
      hasInitialized.current = true;
    }
  }, [center, zoom, map]);
  
  return null;
}


// Custom Icons for different marker types
const createCustomIcon = (marker: MapMarker) => {
  let bgColor = '#3b82f6'; // default user blue
  let iconContent = '👤';

  if (marker.type === 'sos') {
    bgColor = '#f59e0b'; // Amber for SOS
    iconContent = '🚨';
  } else if (marker.type === 'hospital') {
    bgColor = '#10b981'; // Green for hospital
    iconContent = '🏥';
  } else if (marker.type === 'police') {
    bgColor = '#8b5cf6'; // Indigo/Violet for police
    iconContent = '🚓';
  } else if (marker.type === 'incident') {
    bgColor = '#3b82f6'; // Blue for incident
    iconContent = '⚠️';
  }

  // Pulse effect class for active SOS
  const isPulsing = marker.type === 'sos' && marker.status === 'active';
  const animationStyle = isPulsing 
    ? 'animation: pulse 2s infinite; box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);' 
    : '';

  const html = `
    <div style="
      background-color: ${bgColor};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      ${animationStyle}
    ">
      ${iconContent}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

export default function MapComponent({ 
  center = [31.5204, 74.3587], 
  zoom = 15, 
  markers = [],
  className,
  geofenceRadius,
  geofenceCenter
}: MapComponentProps) {
  const [isHeatMode, setIsHeatMode] = React.useState(false);
  const [mapType, setMapType] = React.useState<'roadmap' | 'hybrid'>('roadmap');

  
  // Adding global CSS for the pulse animation and heatmap controls
  useEffect(() => {
    if (!document.getElementById('leaflet-custom-styles')) {
      const style = document.createElement('style');
      style.id = 'leaflet-custom-styles';
      style.innerHTML = `
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(245, 158, 11, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
        .leaflet-container { z-index: 1; }
        .map-control-panel {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          padding: 8px;
          border-radius: 12px;
          border: 1px solid rgba(139, 92, 246, 0.3);
          display: flex;
          gap: 8px;
        }
        .map-toggle-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .map-toggle-btn.active {
          background: #6366f1;
          border-color: #818cf8;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', minHeight: '400px', borderRadius: '12px', overflow: 'hidden' }} className={className}>
      
      {/* Map Action HUD */}
      <div className="map-control-panel">
         <button 
           className={`map-toggle-btn ${!isHeatMode ? 'active' : ''}`} 
           onClick={() => setIsHeatMode(false)}
         >
           📍 Precision
         </button>
         <button 
           className={`map-toggle-btn ${isHeatMode ? 'active' : ''}`} 
           onClick={() => setIsHeatMode(true)}
         >
           🔥 Heatmap
         </button>
         <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
         <button 
           className={`map-toggle-btn ${mapType === 'roadmap' ? 'active' : ''}`} 
           onClick={() => setMapType('roadmap')}
         >
           🗺️ Map
         </button>
         <button 
           className={`map-toggle-btn ${mapType === 'hybrid' ? 'active' : ''}`} 
           onClick={() => setMapType('hybrid')}
         >
           🛰️ Satellite
         </button>
      </div>

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
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
        
        <MapUpdater center={center} zoom={zoom} />
        
        <HeatmapLayer markers={markers} visible={isHeatMode} />

        {geofenceCenter && geofenceRadius && (
          <Circle
            center={geofenceCenter}
            radius={geofenceRadius}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 8'
            }}
          />
        )}


        {!isHeatMode && markers.map((marker) => (
          <Marker 
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={createCustomIcon(marker)}
          >
            <Popup>
              {/* No change needed in Popup content */}
              <div style={{ padding: '4px', minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 'bold' }}>{marker.title}</h3>
                {marker.description && <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#555' }}>{marker.description}</p>}
                
                {marker.time && (
                  <div style={{ fontSize: '12px', color: '#666', borderTop: '1px solid #eee', paddingTop: '6px', marginTop: '6px' }}>
                    <strong>🕒 Time:</strong> {marker.time}
                  </div>
                )}
                {marker.locationDetails && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    <strong>📍 Location:</strong> {marker.locationDetails}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  <strong>🌐 Coordinates:</strong> {marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <span style={{ 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    fontSize: '11px', 
                    backgroundColor: '#e5e7eb', 
                    textTransform: 'uppercase', 
                    fontWeight: 'bold' 
                  }}>
                    {marker.type}
                  </span>
                  {marker.status && (
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '11px', 
                      backgroundColor: marker.status === 'active' ? '#fee2e2' : '#dcfce7', 
                      color: marker.status === 'active' ? '#991b1b' : '#166534',
                      textTransform: 'uppercase', 
                      fontWeight: 'bold' 
                    }}>
                      {marker.status}
                    </span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
