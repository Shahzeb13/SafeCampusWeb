"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapMarker } from '@/components/Map/types';
import styles from '../../dashboard.module.css';
import { sos, incidents } from '@/lib/api';
import toast from 'react-hot-toast';

// Import our dynamic map component securely bypassing SSR
const MapView = dynamic(() => import('@/components/Map'), { ssr: false });

export default function LiveMapPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);

  // Poll for global map updates every 5 seconds
  useEffect(() => {
    fetchGlobalMapData();
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
  const mapCenter: [number, number] = sosMarkers.length > 0 
    ? [sosMarkers[0].latitude, sosMarkers[0].longitude] 
    : markers.length > 0 
      ? [markers[0].latitude, markers[0].longitude]
      : [31.5204, 74.3587];

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Global Radar</h1>
          <p>Real-time campus-wide geographic threat monitoring.</p>
        </div>
      </header>

      <div className={styles.scrollableArea}>
        <div className={styles.tableContainer} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: 'rgba(30, 27, 36, 0.8)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#e2e8f0', fontWeight: 600 }}>Active Mapping Node</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                This live radar continuously syncs with the <strong style={{ color: '#a78bfa' }}>SafeCampus Backend</strong>. 
                All unresolved user SOS alerts and globally reported incidents displaying strict GPS telemetry will automatically lock-on and track within this viewport without reloading.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{sosMarkers.length}</div>
                 <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Live SOS</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{markers.filter(m => m.type === 'incident').length}</div>
                 <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Incidents</div>
              </div>
            </div>
          </div>

          <div style={{ height: '650px', width: '100%', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.3)', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            {!loading ? (
               <MapView 
                  center={mapCenter} 
                  zoom={15} 
                  markers={markers} 
                />
            ) : (
               <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0c', color: '#a78bfa', flexDirection: 'column' }}>
                 <div style={{ fontSize: '40px', animation: 'spin 2s linear infinite', marginBottom: '16px' }}>⚙️</div>
                 <h2>Calibrating Satellites...</h2>
               </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
