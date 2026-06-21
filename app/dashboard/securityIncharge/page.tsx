'use client';

import React, { useEffect, useState } from 'react';
import { securityIncharge } from '@/lib/api';
import Link from 'next/link';

// ─── Icons ───────────────────────────────────────────────────────────────────
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const SOSIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="11" r="3" />
  </svg>
);
const AlertTriangleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const CameraIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const MapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatusDot = ({ status }: { status: 'Active' | 'Degraded' | 'Offline' }) => {
  const color = status === 'Active' ? '#16a34a' : status === 'Degraded' ? '#d97706' : '#dc2626';
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />;
};

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

export default function SecurityInchargeDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await securityIncharge.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load security incharge dashboard data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const securityStatuses = [
    { name: 'SOS Listener Socket', status: 'Active', details: 'Connected & listening' },
    { name: 'CCTV Feeds', status: 'Active', details: 'All 8 cameras streaming' },
    { name: 'Face Scanning Service', status: 'Active', details: 'Biometric DB connected' },
    { name: 'Guard Mobile Dispatcher', status: 'Active', details: 'FCM delivery active' },
    { name: 'SMS Broadcast Gateway', status: 'Active', details: 'Twilio node operational' },
  ];

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '32px 36px 0', background: '#fafafa' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>At a Glance</h1>
        <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, marginBottom: 28 }}>
          Real-time security and incident response overview.
        </p>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="Active SOS Alerts" value={loading ? "..." : (data?.stats?.activeSOS ?? 0)} dot={data?.stats?.activeSOS > 0 ? "#ef4444" : undefined} />
          <StatCard label="Pending Incidents" value={loading ? "..." : (data?.stats?.pendingIncidents ?? 0)} dot={data?.stats?.pendingIncidents > 0 ? "#f59e0b" : undefined} />
          <StatCard label="Resolved Incidents" value={loading ? "..." : (data?.stats?.resolvedIncidents ?? 0)} />
          <StatCard label="Total Incidents" value={loading ? "..." : (data?.stats?.totalIncidents ?? 0)} />
          <StatCard label="Total Security Guards" value={loading ? "..." : (data?.stats?.totalGuards ?? 0)} />
        </div>
      </div>

      {/* Main body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px', background: '#fafafa' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          
          {/* LEFT Column - SOS alerts and Recent Incidents */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Active SOS Panel */}
            {data?.recentSOS?.filter((s: any) => s.status !== 'resolved' && s.status !== 'rejected').length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #ef4444', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(239,68,68,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #fee2e2', background: '#fef2f2' }}>
                  <h2 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                    Active Emergency SOS Triggers
                  </h2>
                  <Link href="/dashboard/securityIncharge/sos" style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 700, textDecoration: 'none' }}>Open SOS Console</Link>
                </div>
                <div style={{ padding: '16px 24px' }}>
                  {data.recentSOS.filter((s: any) => s.status !== 'resolved' && s.status !== 'rejected').map((sos: any) => (
                    <div key={sos._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f4f4f5' }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#09090b' }}>{sos.userId?.username || 'Unknown User'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#71717a', marginTop: 2 }}>
                          Triggered: {new Date(sos.createdAt).toLocaleTimeString()} | Note: {sos.note || 'No description'}
                        </div>
                      </div>
                      <div>
                        <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, color: '#b91c1c', background: '#fee2e2', padding: '4px 10px', borderRadius: 6, textTransform: 'uppercase' }}>
                          {sos.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Incidents Summary Table */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e4e4e7' }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#09090b' }}>Recent Incidents</h2>
                <Link href="/dashboard/securityIncharge/incidents" style={{ fontSize: '0.78rem', color: '#0052cc', fontWeight: 600, textDecoration: 'none' }}>View All Incidents</Link>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
                    {['Type', 'Location', 'Reporter', 'Status', 'Time'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>Loading data...</td></tr>
                  ) : !data?.recentIncidents || data.recentIncidents.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>No recent incidents reported.</td></tr>
                  ) : (
                    data.recentIncidents.map((inc: any, i: number) => (
                      <tr key={inc._id} style={{ borderBottom: i < data.recentIncidents.length - 1 ? '1px solid #f4f4f5' : 'none' }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}
                      >
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: 600, color: '#09090b', textTransform: 'capitalize' }}>
                          {inc.incidentType?.replace(/_/g, ' ')}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: '#27272a' }}>{inc.locationText}</td>
                        <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: '#27272a' }}>{inc.reporter_id?.username || 'Student'}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
                            padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase',
                            background: inc.status === 'resolved' ? 'rgba(34, 197, 94, 0.08)' : inc.status === 'pending' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                            color: inc.status === 'resolved' ? '#16a34a' : inc.status === 'pending' ? '#d97706' : '#4f46e5',
                            border: inc.status === 'resolved' ? '1px solid rgba(34, 197, 94, 0.15)' : inc.status === 'pending' ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid rgba(99, 102, 241, 0.15)'
                          }}>
                            {inc.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.78rem', color: '#71717a' }}>
                          {new Date(inc.createdAt).toLocaleDateString()} at {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT Column - System Health & Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* System Security health */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e4e4e7' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#09090b', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <ShieldIcon /> Security Status
                </h2>
                <button onClick={handleRefresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6, transition: 'all 0.2s', transform: refreshing ? 'rotate(360deg)' : 'none' }}>
                  <RefreshIcon />
                </button>
              </div>
              <div>
                {securityStatuses.map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: i < securityStatuses.length - 1 ? '1px solid #f4f4f5' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <StatusDot status={item.status as any} />
                      <span style={{ fontSize: '0.82rem', color: '#27272a', fontWeight: 500 }}>{item.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>{item.status}</div>
                      <div style={{ fontSize: '0.68rem', color: '#a1a1aa' }}>{item.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e4e4e7' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#09090b' }}>Quick Actions</h2>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/dashboard/securityIncharge/sos" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#dc2626', color: '#fff', borderRadius: 8, padding: '10px 14px',
                  fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s'
                }}>
                  <SOSIcon /> SOS Command Center
                </Link>
                <Link href="/dashboard/securityIncharge/incidents" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: 8, padding: '10px 14px',
                  fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
                }}>
                  <AlertTriangleIcon /> Global Incidents
                </Link>
                <Link href="/dashboard/securityIncharge/map-demo" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: 8, padding: '10px 14px',
                  fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
                }}>
                  <MapIcon /> Live Tracking Map
                </Link>
                <Link href="/dashboard/securityIncharge/cctv" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: 8, padding: '10px 14px',
                  fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
                }}>
                  <CameraIcon /> Live CCTV Feeds
                </Link>
                <Link href="/dashboard/securityIncharge/assignments/responses" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: 8, padding: '10px 14px',
                  fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
                }}>
                  <UsersIcon /> Guard Responses
                </Link>
                <Link href="/dashboard/securityIncharge/security-guards" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: 8, padding: '10px 14px',
                  fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
                }}>
                  <UsersIcon /> Manage Security Guards
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}