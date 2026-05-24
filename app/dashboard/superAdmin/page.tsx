'use client';

import React, { useEffect, useState } from 'react';
import { organizations, campuses, users } from '@/lib/api';

// ─── Icons ───────────────────────────────────────────────────────────────────
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const BuildingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const ActivityIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const GridIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────
type HealthStatus = 'Operational' | 'Degraded' | 'Not configured';
interface HealthItem { name: string; status: HealthStatus; lastChecked: string; }
interface PlatformEvent { message: string; timeAgo: string; color: string; }

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatusDot = ({ status }: { status: HealthStatus }) => {
  const color = status === 'Operational' ? '#16a34a' : status === 'Degraded' ? '#d97706' : '#9ca3af';
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const [healthRefreshed, setHealthRefreshed] = useState(false);
  const [data, setData] = useState({
    organizations: [] as any[],
    campuses: [] as any[],
    users: [] as any[],
    loading: true,
  });

  const fetchData = async () => {
    setData(prev => ({ ...prev, loading: true }));
    try {
      const [orgsRes, campsRes, usersRes] = await Promise.all([
        organizations.getAll().catch(() => ({ data: [] })),
        campuses.getAll().catch(() => ({ data: [] })),
        users.getAll().catch(() => ({ data: [] }))
      ]);

      setData({
        organizations: orgsRes.data || [],
        campuses: campsRes.data || [],
        users: usersRes.data || [],
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching dashboard data", error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const healthItems: HealthItem[] = [
    { name: 'API Server', status: 'Operational', lastChecked: 'Just now' },
    { name: 'Database', status: 'Operational', lastChecked: 'Just now' },
    { name: 'Firebase Push', status: 'Degraded', lastChecked: '5 min ago' },
    { name: 'Image Processing', status: 'Not configured', lastChecked: '—' },
    { name: 'Email Notification', status: 'Operational', lastChecked: '2 mins ago' },
  ];

  const events: PlatformEvent[] = [
    { message: 'System boot up', timeAgo: '2h ago', color: '#0052cc' },
    { message: 'Admin login', timeAgo: 'Just now', color: '#09090b' },
  ];

  const handleRefresh = () => {
    setHealthRefreshed(true);
    fetchData();
    setTimeout(() => setHealthRefreshed(false), 800);
  };

  const activeOrgs = data.organizations.filter((o: any) => o.status === 'ACTIVE').length;
  const activeCampuses = data.campuses.length; // Can refine based on status if exists
  const guards = data.users.filter((u: any) => u.role === 'security_personnel').length;

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '32px 36px 0', background: '#fafafa' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>At a Glance</h1>
        <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, marginBottom: 28 }}>
          Platform-wide overview.
        </p>

        {/* Stats — Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
          <StatCard label="Total Organizations" value={data.loading ? "..." : data.organizations.length} />
          <StatCard label="Active Organizations" value={data.loading ? "..." : activeOrgs} dot="#16a34a" />
          <StatCard label="Total Campuses" value={data.loading ? "..." : data.campuses.length} />
          <StatCard label="Active Campuses" value={data.loading ? "..." : activeCampuses} dot="#16a34a" />
        </div>

        {/* Stats — Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="Total Users" value={data.loading ? "..." : data.users.length} />
          <StatCard label="Security Guards" value={data.loading ? "..." : guards} />
          <StatCard label="Incidents Today" value={data.loading ? "..." : 0} />
          <StatCard label="SOS Today" value={data.loading ? "..." : 0} />
        </div>
      </div>

      {/* Main body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px', background: '#fafafa' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

          {/* LEFT — Tenant Activity Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e4e4e7' }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#09090b' }}>Tenant Activity Summary</h2>
                <a href="/dashboard/superAdmin/organizations" style={{ fontSize: '0.78rem', color: '#0052cc', fontWeight: 600, textDecoration: 'none' }}>View All</a>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
                    {['Organization', 'Org Slug', 'Campuses', 'Users'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.loading ? (
                    <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>Loading data...</td></tr>
                  ) : data.organizations.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>No organizations registered yet.</td></tr>
                  ) : (
                    data.organizations.map((t: any, i: number) => {
                      const orgCampuses = data.campuses.filter((c: any) => c.organizationId?._id === t._id).length;
                      const orgUsers = data.users.filter((u: any) => u.organizationId === t._id).length;
                      
                      return (
                        <tr key={t._id} style={{ borderBottom: i < data.organizations.length - 1 ? '1px solid #f4f4f5' : 'none' }}
                          onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'}
                          onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}
                        >
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: 600, color: '#09090b' }}>{t.name}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f4f4f5', color: '#52525b', padding: '3px 8px', borderRadius: 5, display: 'inline-block' }}>{t.slug}</span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#27272a', textAlign: 'center' }}>{orgCampuses}</td>
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#27272a', textAlign: 'center' }}>{orgUsers.toLocaleString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Platform Events */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e4e4e7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <GridIcon />
                  <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#09090b' }}>Platform Events</h2>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin-Level</span>
              </div>
              <div>
                {events.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderBottom: i < events.length - 1 ? '1px solid #f4f4f5' : 'none' }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: ev.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '0.83rem', color: '#27272a' }}>{ev.message}</span>
                    <span style={{ fontSize: '0.75rem', color: '#a1a1aa', whiteSpace: 'nowrap' }}>{ev.timeAgo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — System Health + Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* System Health */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e4e4e7' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#09090b', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <ActivityIcon /> System Health
                </h2>
                <button onClick={handleRefresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6, transition: 'all 0.2s', transform: healthRefreshed ? 'rotate(360deg)' : 'none' }}>
                  <RefreshIcon />
                </button>
              </div>
              <div>
                {healthItems.map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: i < healthItems.length - 1 ? '1px solid #f4f4f5' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <StatusDot status={item.status} />
                      <span style={{ fontSize: '0.82rem', color: '#27272a', fontWeight: 500 }}>{item.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: item.status === 'Operational' ? '#16a34a' : item.status === 'Degraded' ? '#d97706' : '#9ca3af' }}>{item.status}</div>
                      <div style={{ fontSize: '0.68rem', color: '#a1a1aa' }}>{item.lastChecked}</div>
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
                <a href="/dashboard/superAdmin/organizations" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#09090b', color: '#fff', borderRadius: 8, padding: '10px 14px',
                  fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s'
                }}>
                  <PlusIcon /> Add Organization
                </a>
                <a href="/dashboard/superAdmin/campuses" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: 8, padding: '10px 14px',
                  fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
                }}>
                  <BuildingIcon /> Add Campus
                </a>
                <a href="/dashboard/superAdmin/users" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: 8, padding: '10px 14px',
                  fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
                }}>
                  <UsersIcon /> Invite Organization Owner
                </a>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <a href="/dashboard/superAdmin/audit-logs" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: 8, padding: '9px 12px',
                    fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
                  }}>
                    <FileIcon /> View Audit Logs
                  </a>
                  <a href="/dashboard/superAdmin/system-health" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: 8, padding: '9px 12px',
                    fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
                  }}>
                    <ActivityIcon /> Check Health
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
