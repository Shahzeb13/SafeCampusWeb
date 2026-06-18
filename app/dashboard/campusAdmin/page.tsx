"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DynamicMap from '@/components/Map';

// ─── Icons ───────────────────────────────────────────────────────────────────
const BuildingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const ActivityIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const CameraIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const AlertTriangleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const GridIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ label, value, dot }: { label: string; value: string | number; dot?: string }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e4e4e7',
    borderRadius: '12px',
    padding: '22px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease',
  }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
  >
    <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{label}</p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {dot && <span style={{ width: 10, height: 10, borderRadius: '50%', background: dot, flexShrink: 0 }} />}
      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</span>
    </div>
  </div>
);

type HealthStatus = 'Operational' | 'Degraded' | 'Offline';
const StatusDot = ({ status }: { status: HealthStatus }) => {
  const color = status === 'Operational' ? '#16a34a' : status === 'Degraded' ? '#d97706' : '#dc2626';
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />;
};

export default function CampusAdminDashboard() {
  const [campusData, setCampusData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number | string>('—');
  const [guardsCount, setGuardsCount] = useState<number | string>('—');

  useEffect(() => {
    async function getCampusAdminStats() {
      try {
        setLoading(true);
        setError(null);

        const [campusRes, usersRes, guardsRes] = await Promise.allSettled([
          axios.post(
            "http://localhost:4000/api/admin/campus-admin/getCampusAdminOrg",
            {},
            { withCredentials: true }
          ),
          axios.get(
            "http://localhost:4000/api/admin/campus-admin/students-staff",
            { withCredentials: true }
          ),
          axios.get(
            "http://localhost:4000/api/admin/campus-admin/security-personnel",
            { withCredentials: true }
          ),
        ]);

        if (campusRes.status === 'fulfilled' && campusRes.value.data.success) {
          setCampusData(campusRes.value.data.campus);
        } else if (campusRes.status === 'rejected') {
          const err = (campusRes as PromiseRejectedResult).reason;
          if (err.response?.status === 403) {
            setError("Access denied. You do not have the required permissions.");
          } else if (err.response?.status === 404) {
            setError("No campus found for your account.");
          } else {
            setError(err.message || "An unexpected error occurred while connecting to the server.");
          }
        }

        if (usersRes.status === 'fulfilled' && usersRes.value.data.success) {
          setUserCount(usersRes.value.data.data?.length ?? 0);
        }

        if (guardsRes.status === 'fulfilled' && guardsRes.value.data.success) {
          const active = (guardsRes.value.data.data as any[]).filter(g => g.status === 'active').length;
          setGuardsCount(active);
        }
      } finally {
        setLoading(false);
      }
    }

    getCampusAdminStats();
  }, []);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
           <div style={{ width: 40, height: 40, border: '4px solid #e4e4e7', borderTopColor: '#0052cc', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
           <p style={{ color: '#71717a', fontSize: '0.875rem', fontWeight: 600 }}>Loading Campus Data...</p>
           <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, padding: '40px', background: '#fafafa', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 32, color: '#991b1b', maxWidth: 500, width: '100%', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 800 }}>Dashboard Error</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#b91c1c' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!campusData) return null;

  // Setup markers for map
  const markers = (campusData.location && campusData.location.latitude && campusData.location.longitude) ? [{
    id: campusData._id,
    latitude: campusData.location.latitude,
    longitude: campusData.location.longitude,
    title: campusData.name,
    type: 'hospital', 
    status: 'active'
  }] : [];

  const healthItems = [
    { name: 'CCTV Network', status: 'Operational' as HealthStatus, lastChecked: 'Just now' },
    { name: 'Access Control', status: 'Operational' as HealthStatus, lastChecked: '2 mins ago' },
    { name: 'Emergency Alerts', status: 'Operational' as HealthStatus, lastChecked: 'Just now' },
    { name: 'Guard Tracking', status: 'Offline' as HealthStatus, lastChecked: '1 hour ago' },
  ];

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fafafa', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top bar */}
      <div style={{ padding: '32px 36px 0', background: '#fafafa' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>{campusData.name}</h1>
        <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPinIcon /> {campusData.city}, {campusData.state}
        </p>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="Campus Status" value={campusData.status === 'active' ? 'Active' : 'Inactive'} dot={campusData.status === 'active' ? '#16a34a' : '#9ca3af'} />
          <StatCard label="Active Security Personel" value={guardsCount} />
          <StatCard label="Students & Staff" value={userCount} />
          <StatCard label="Active Incidents" value="0" />
        </div>
      </div>

      {/* Main body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px', background: '#fafafa' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Campus Map & Details */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e4e4e7' }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#09090b', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BuildingIcon /> Campus Map & Location
                </h2>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f4f4f5', color: '#52525b', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>
                  Code: {campusData.code}
                </span>
              </div>
              
              {/* Map Container */}
              <div style={{ height: '350px', background: '#f4f4f5', position: 'relative' }}>
                {markers.length > 0 ? (
                  <DynamicMap
                    center={[campusData.location.latitude, campusData.location.longitude]}
                    zoom={15}
                    markers={markers}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontSize: '0.875rem' }}>
                    No precise location coordinates available
                  </div>
                )}
              </div>

              <div style={{ padding: '20px 24px', background: '#fff', borderTop: '1px solid #e4e4e7' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#52525b', lineHeight: 1.6 }}>
                  <strong>Address:</strong> {campusData.address}
                </p>
              </div>
            </div>

            {/* Recent Activity / Incidents mock */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e4e4e7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <GridIcon />
                  <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#09090b' }}>Recent Incidents</h2>
                </div>
              </div>
              <div style={{ padding: '32px', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>
                No recent incidents reported on this campus.
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Quick Actions */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e4e4e7' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#09090b' }}>Quick Actions</h2>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#09090b', color: '#fff', borderRadius: 8, padding: '10px 14px',
                  fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.2s'
                }}>
                  <AlertTriangleIcon /> Trigger Campus Alert
                </button>
                
                <a href="/dashboard/campusAdmin/securityPersonal" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: 8, padding: '10px 14px',
                  fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
                }}>
                  <UsersIcon /> Manage Security
                </a>
              </div>
            </div>

            {/* Campus System Health */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e4e4e7' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#09090b', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <ActivityIcon /> Subsystem Health
                </h2>
              </div>
              <div>
                {healthItems.map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: i < healthItems.length - 1 ? '1px solid #f4f4f5' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <StatusDot status={item.status} />
                      <span style={{ fontSize: '0.82rem', color: '#27272a', fontWeight: 500 }}>{item.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: item.status === 'Operational' ? '#16a34a' : item.status === 'Degraded' ? '#d97706' : '#dc2626' }}>{item.status}</div>
                      <div style={{ fontSize: '0.68rem', color: '#a1a1aa' }}>{item.lastChecked}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

