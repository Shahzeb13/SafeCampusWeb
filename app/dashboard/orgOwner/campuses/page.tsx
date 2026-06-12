import { cookies } from 'next/headers';
import React from 'react';
import Link from 'next/link';
import DynamicMap from '@/components/Map';

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
const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

export default async function CampusesPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const res = await fetch("http://localhost:4000/api/campuses", {
      headers: { Cookie: cookieHeader },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch campuses: ${res.statusText}`);
    }

    const data = await res.json();
    const campuses = data.data || [];

    // Aggregate all markers for the global map
    const globalMarkers = campuses
      .filter((c: any) => c.location && c.location.latitude && c.location.longitude)
      .map((c: any) => ({
        id: c._id,
        latitude: c.location.latitude,
        longitude: c.location.longitude,
        title: c.name,
        type: 'hospital', 
        status: c.status || 'active'
      }));

    // If we have markers, center the global map on the first one, or use a default
    const globalCenter: [number, number] = globalMarkers.length > 0 
      ? [globalMarkers[0].latitude, globalMarkers[0].longitude] 
      : [33.6844, 73.0479]; // Default Islamabad

    return (
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
        {/* Header */}
        <div style={{ padding: '32px 36px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>Campuses</h1>
            <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, margin: 0 }}>
              Manage and monitor all your organization's campuses.
            </p>
          </div>
          <Link href="/dashboard/orgOwner/campuses/add" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#09090b', color: '#fff', borderRadius: 8, padding: '10px 16px',
            fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <PlusIcon /> Add New Campus
          </Link>
        </div>

        {/* Scrollable Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px' }}>
          
          {/* Global Map View */}
          <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BuildingIcon />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#09090b' }}>Global Footprint</h2>
            </div>
            <div style={{ height: '350px', position: 'relative', background: '#f4f4f5' }}>
              {globalMarkers.length > 0 ? (
                <DynamicMap 
                  center={globalCenter} 
                  zoom={12} 
                  markers={globalMarkers}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontSize: '0.875rem' }}>
                  No campus locations found to display on map.
                </div>
              )}
            </div>
          </div>

          {/* Campus Grid View */}
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 16px 0', color: '#09090b', letterSpacing: '-0.02em' }}>
            All Campuses ({campuses.length})
          </h2>
          
          {campuses.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '16px', color: '#71717a' }}>
              <BuildingIcon />
              <p style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}>No campuses found.</p>
              <p style={{ fontSize: '0.875rem' }}>Click "Add New Campus" to register your first location.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {campuses.map((campus: any) => {
                const markers = (campus.location && campus.location.latitude && campus.location.longitude) ? [{
                  id: campus._id,
                  latitude: campus.location.latitude,
                  longitude: campus.location.longitude,
                  title: campus.name,
                  type: 'hospital', 
                  status: campus.status || 'active'
                }] : [];

                return (
                  <div key={campus._id} style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                    {/* Mini Map Section */}
                    <div style={{ height: '180px', position: 'relative', background: '#f4f4f5', borderBottom: '1px solid #f4f4f5' }}>
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
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.01em' }}>{campus.name}</h3>
                          <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPinIcon /> {campus.city}, {campus.state || 'N/A'}
                          </p>
                        </div>
                        <span style={{ 
                          fontFamily: 'monospace', fontSize: '0.75rem', background: '#f4f4f5', color: '#52525b', 
                          padding: '4px 8px', borderRadius: 6, fontWeight: 700, border: '1px solid #e4e4e7' 
                        }}>
                          {campus.code}
                        </span>
                      </div>
                      
                      <p style={{ margin: '0 0 16px 0', fontSize: '0.875rem', color: '#52525b', lineHeight: 1.5, flex: 1 }}>
                        {campus.address}
                      </p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f4f4f5', paddingTop: '16px' }}>
                         <span style={{ 
                          background: campus.status === 'inactive' ? '#fef08a' : '#dcfce7', 
                          color: campus.status === 'inactive' ? '#854d0e' : '#166534',
                          padding: '4px 10px', 
                          borderRadius: '999px', 
                          fontSize: '0.7rem', 
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {campus.status || 'Active'}
                        </span>
                        
                        <div style={{ display: 'flex', gap: 8 }}>
                           <button style={{ background: '#fff', border: '1px solid #e4e4e7', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', color: '#09090b' }}>
                             Edit
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    );
  } catch (err: any) {
    return (
      <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', color: '#991b1b', margin: '2rem' }}>
        <h3 style={{ marginTop: 0, fontWeight: 800 }}>Error Loading Campuses</h3>
        <p style={{ margin: 0 }}>{err.message}</p>
      </div>
    );
  }
}
