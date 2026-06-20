"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapMarker } from '@/components/Map/types';
import styles from '../../dashboard.module.css';
import { sos, incidents, auth, campuses } from '@/lib/api';
import toast from 'react-hot-toast';

// Import our dynamic map component securely bypassing SSR
const MapView = dynamic(() => import('@/components/Map'), { ssr: false });

export default function LiveMapPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [campusData, setCampusData] = useState<any>(null);

  // Poll for global map updates every 5 seconds
  useEffect(() => {
    const initPage = async () => {
      try {
        const profile = await auth.getProfile();
        if (profile.campusId) {
          const campId = typeof profile.campusId === 'object' ? profile.campusId._id || profile.campusId.id : profile.campusId;
          if (campId) {
            const campRes = await campuses.getById(campId);
            if (campRes.success && campRes.data) {
              setCampusData(campRes.data);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user profile or campus data", err);
      }
      fetchGlobalMapData();
    };

    initPage();
    const interval = setInterval(() => {
      fetchGlobalMapData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchGlobalMapData = async () => {
    try {
      // Execute both backend calls in parallel
      const [sosRes, incRes] = await Promise.all([
        sos.getAll().catch(() => ({ success: false, data: [] })),
        incidents.getAll("all").catch(() => []) 
      ]);

      // Deduplication map using `userId_type` as unique key
      const duplicateFilter = new Map<string, MapMarker>();

      // 1. Process active SOS alerts into map markers
      if (sosRes && sosRes.success && Array.isArray(sosRes.data)) {
        sosRes.data.forEach((alert: any) => {
          const lat = alert.latestLocation?.latitude || alert.location?.latitude;
          const lng = alert.latestLocation?.longitude || alert.location?.longitude;
          
          if (lat && lng && alert.status !== 'resolved') {
            const uId = alert.userId?._id || alert.userId?.id || alert.userId || 'unknown_user';
            const compositeKey = String(uId) + '_sos';

            if (!duplicateFilter.has(compositeKey)) {
              duplicateFilter.set(compositeKey, {
                id: `sos-${alert._id}`,
                latitude: lat,
                longitude: lng,
                title: `${alert.userId?.username || 'Unknown User'} Emergency`,
                description: alert.note || 'Active SOS Triggered',
                type: 'sos',
                status: alert.status,
                time: new Date(alert.createdAt).toLocaleString(),
              });
            }
          }
        });
      }

      // 2. Process active generic incidents into map markers
      if (Array.isArray(incRes)) {
        incRes.forEach((inc: any) => {
          if (inc.latitude && inc.longitude && inc.status !== 'resolved') {
            const uId = inc.reporter_id?._id || inc.reporter_id?.id || inc.reporter_id || 'unknown_user';
            const incType = inc.incidentType || 'general_incident';
            const compositeKey = String(uId) + '_' + incType;

            if (!duplicateFilter.has(compositeKey)) {
              duplicateFilter.set(compositeKey, {
                id: `inc-${inc._id}`,
                latitude: inc.latitude,
                longitude: inc.longitude,
                title: inc.incidentType ? inc.incidentType.replace(/_/g, ' ').toUpperCase() : 'General Incident',
                description: inc.title || 'Reported Incident',
                type: 'incident',
                status: inc.status === 'pending' ? 'pending' : 'active',
                time: new Date(inc.createdAt).toLocaleString(),
                locationDetails: inc.locationText
              });
            }
          }
        });
      }

      setMarkers(Array.from(duplicateFilter.values()));
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically focus map on the most critical marker, or default to generic campus coords
  const sosMarkers = markers.filter(m => m.type === 'sos');
  const defaultLat = campusData?.location?.latitude ?? 31.5204;
  const defaultLng = campusData?.location?.longitude ?? 74.3587;
  const mapCenter: [number, number] = sosMarkers.length > 0 
    ? [sosMarkers[0].latitude, sosMarkers[0].longitude] 
    : markers.length > 0 
      ? [markers[0].latitude, markers[0].longitude]
      : [defaultLat, defaultLng];

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Global Radar</h1>
          <p>Real-time campus-wide geographic threat monitoring.</p>
        </div>
      </header>

      <div className={styles.scrollableArea}>
        <div style={{ padding: '0 24px 40px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Stats Banner */}
          <div style={{ 
            background: '#fff', 
            padding: '20px 28px', 
            borderRadius: '12px', 
            border: '1px solid #e4e4e7',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#09090b', fontWeight: 600 }}>Active Mapping Node</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#71717a', maxWidth: '520px' }}>
                This live radar continuously syncs with the <strong style={{ color: '#0052cc' }}>SafeCampus Backend</strong>. 
                All unresolved SOS alerts and reported incidents with GPS telemetry are automatically tracked within this viewport.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 20px', background: '#fef9c3', borderRadius: '10px', border: '1px solid #fde047' }}>
                 <div style={{ fontSize: '22px', fontWeight: 800, color: '#854d0e', lineHeight: 1 }}>{sosMarkers.length}</div>
                 <div style={{ fontSize: '10px', color: '#92400e', textTransform: 'uppercase', fontWeight: 600, marginTop: '4px', letterSpacing: '0.05em' }}>Live SOS</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 20px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                 <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e40af', lineHeight: 1 }}>{markers.filter(m => m.type === 'incident').length}</div>
                 <div style={{ fontSize: '10px', color: '#1d4ed8', textTransform: 'uppercase', fontWeight: 600, marginTop: '4px', letterSpacing: '0.05em' }}>Incidents</div>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div style={{ 
            height: '650px', 
            width: '100%', 
            borderRadius: '12px', 
            border: '1px solid #e4e4e7', 
            overflow: 'hidden', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)' 
          }}>
            {!loading ? (
               <MapView 
                  center={mapCenter} 
                  zoom={15} 
                  markers={markers} 
                  geofenceRadius={campusData?.allowedRadiusMeters ?? 1000}
                  geofenceCenter={[defaultLat, defaultLng]}
                />
            ) : (
               <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', color: '#0052cc', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ fontSize: '36px' }}>🗺️</div>
                 <div style={{ fontSize: '1rem', fontWeight: 600, color: '#09090b' }}>Calibrating Map Data...</div>
                 <div style={{ fontSize: '13px', color: '#71717a' }}>Fetching live incidents and SOS alerts</div>
               </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
