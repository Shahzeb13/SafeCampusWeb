import { cookies } from 'next/headers';
import React from 'react';
import Link from 'next/link';
import DynamicMap from '@/components/Map'; 
import { redirect } from 'next/navigation';

// ─── Icons ───────────────────────────────────────────────────────────────────
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
const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
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
  }}>
    <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{label}</p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {dot && <span style={{ width: 10, height: 10, borderRadius: '50%', background: dot, flexShrink: 0 }} />}
      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</span>
    </div>
  </div>
);

export default async function OrgOwnerDashboard() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let shouldRedirect = false;

  try {
    const [orgRes, campsRes, profileRes] = await Promise.all([
      fetch("http://localhost:4000/api/admin/org-owner/getOwnerOrganization", {
        headers: { Cookie: cookieHeader },
        cache: 'no-store'
      }),
      fetch("http://localhost:4000/api/campuses", {
        headers: { Cookie: cookieHeader },
        cache: 'no-store'
      }),
      fetch("http://localhost:4000/api/auth/profile", {
        headers: { Cookie: cookieHeader },
        cache: 'no-store'
      })
    ]);

    // Handle HTTP status errors manually (similar to Axios behavior)
    if (!profileRes.ok) {
      if (profileRes.status === 401) {
        shouldRedirect = true;
      }
      throw new Error(`Profile endpoint returned status ${profileRes.status} (${profileRes.statusText})`);
    }

    if (!orgRes.ok) {
      throw new Error(`Organization endpoint returned status ${orgRes.status} (${orgRes.statusText})`);
    }

    const userProfile = await profileRes.json();

    if (userProfile && userProfile.role !== "organization_owner") {
      shouldRedirect = true;
    }

    const orgData = await orgRes.json();
    const org = orgData.data;

    let campuses = [];
    if (campsRes.ok) {
      const campsData = await campsRes.json();
      campuses = campsData.data || [];
    } else {
      console.warn(`Campuses endpoint returned status ${campsRes.status}`);
    }

    if (!org) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#71717a', background: '#fff', borderRadius: '16px', border: '1px solid #f4f4f5' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#09090b', marginBottom: '0.5rem' }}>No Organization Linked</h3>
          <p>Your account is not currently linked to any organization.</p>
        </div>
      );
    }

    const activeCampuses = campuses.filter((c: any) => c.status !== 'inactive').length;

    return (
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ padding: '32px 36px 0', background: '#fafafa' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>At a Glance</h1>
          <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, marginBottom: 28 }}>
            Organization overview.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Campuses" value={campuses.length} />
            <StatCard label="Active Campuses" value={activeCampuses} dot="#16a34a" />
            <StatCard label="Total Users" value={"-"} />
            <StatCard label="Guards Active" value={"-"} />
          </div>
        </div>

        {/* Main body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px', background: '#fafafa' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

            {/* LEFT — Campus Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#09090b', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BuildingIcon /> Your Campuses
                </h2>
                <Link href="/dashboard/orgOwner/campuses" style={{ fontSize: '0.875rem', color: '#0052cc', fontWeight: 600, textDecoration: 'none' }}>View All</Link>
              </div>

              {campuses.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '14px', color: '#71717a' }}>
                  <p>No campuses found.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {campuses.map((campus: any) => {
                    const markers = (campus.location && campus.location.latitude && campus.location.longitude) ? [{
                      id: campus._id,
                      latitude: campus.location.latitude,
                      longitude: campus.location.longitude,
                      title: campus.name,
                      type: 'hospital', // Using hospital pin style as a general building style
                      status: 'active'
                    }] : [];

                    return (
                      <div key={campus._id} style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                        {/* Map Section */}
                        <div style={{ height: '180px', position: 'relative', background: '#f4f4f5' }}>
                          {(campus.location && campus.location.latitude && campus.location.longitude) ? (
                            <DynamicMap
                              center={[campus.location.latitude, campus.location.longitude]}
                              zoom={14}
                              markers={markers}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontSize: '0.875rem' }}>
                              No location data
                            </div>
                          )}
                        </div>
                        {/* Info Section */}
                        <div style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#09090b' }}>{campus.name}</h3>
                              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <MapPinIcon /> {campus.city}, {campus.state}
                              </p>
                            </div>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f4f4f5', color: '#52525b', padding: '3px 8px', borderRadius: 5, fontWeight: 600 }}>
                              {campus.code}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#52525b', lineHeight: 1.5 }}>
                            {campus.address}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT — Org Details + Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Org Details */}
              <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e4e4e7' }}>
                  <h2 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#09090b', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <GridIcon /> Organization Profile
                  </h2>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  {org.logoUrl ? (
                    <img src={org.logoUrl} alt="Logo" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #f4f4f5', marginBottom: '12px' }} />
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'linear-gradient(135deg, #0052cc 0%, #003d99 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '12px' }}>
                      {org.name?.charAt(0)}
                    </div>
                  )}
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>{org.name}</h3>
                  <span style={{
                    marginTop: '8px',
                    background: org.status === 'active' ? '#dcfce7' : '#fef08a',
                    color: org.status === 'active' ? '#166534' : '#854d0e',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {org.status || 'Active'}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid #f4f4f5', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#71717a' }}>Email:</span>
                    <span style={{ color: '#09090b', fontWeight: 600 }}>{org.contactEmail}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#71717a' }}>Phone:</span>
                    <span style={{ color: '#09090b', fontWeight: 600 }}>{org.contactPhone || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#71717a' }}>City:</span>
                    <span style={{ color: '#09090b', fontWeight: 600 }}>{org.city || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e4e4e7' }}>
                  <h2 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#09090b' }}>Quick Actions</h2>
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/dashboard/orgOwner/users" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: '#09090b', color: '#fff', borderRadius: 8, padding: '10px 14px',
                    fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
                  }}>
                    <UsersIcon /> Manage Campus Admins
                  </Link>
                  <Link href="/dashboard/orgOwner/settings" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: 8, padding: '9px 12px',
                    fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
                  }}>
                    <ActivityIcon /> Settings
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  } catch (err: any) {
    // Determine the type of fetch error
    let errorTitle = "Error Loading Dashboard Data";
    let errorMessage = err.message || "An unknown error occurred.";
    let errorHint = "Ensure your backend server is running and the user is properly authenticated.";

    if (err.message && (err.message.includes("fetch failed") || err.message.includes("ECONNREFUSED") || err.message.includes("connect"))) {
      errorTitle = "Backend Server Unreachable";
      errorMessage = "The frontend could not connect to the backend server at http://localhost:4000.";
      errorHint = "Please check if your Node/Express backend server is started and running on port 4000.";
    } else if (err.message && err.message.toLowerCase().includes("json")) {
      errorTitle = "Invalid Response Format";
      errorMessage = "The server replied, but the response could not be parsed as JSON.";
      errorHint = "This often happens if the backend crashed and returned an HTML error page instead of JSON API response.";
    }

    return (
      <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', color: '#991b1b' }}>
        <h3 style={{ marginTop: 0, fontWeight: 800 }}>{errorTitle}</h3>
        <p style={{ margin: 0, fontWeight: 600 }}>{errorMessage}</p>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', opacity: 0.8 }}>{errorHint}</p>
      </div>
    );
  }


}

