'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DynamicMap from '@/components/Map';
import { campuses } from '@/lib/api';
import toast from 'react-hot-toast';

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
const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
  </svg>
);

export default function CampusesPage() {
  const [campusesList, setCampusesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingCampus, setEditingCampus] = useState<any>(null);
  const [deletingCampus, setDeletingCampus] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await campuses.getAll();
      setCampusesList(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  const handleDelete = async () => {
    if (!deletingCampus) return;
    setSubmitting(true);
    try {
      await campuses.delete(deletingCampus._id);
      toast.success("Campus deleted successfully!");
      setDeletingCampus(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete campus");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: editingCampus.name,
        code: editingCampus.code,
        city: editingCampus.city,
        address: editingCampus.address,
        location: editingCampus.location
      };
      await campuses.update(editingCampus._id, payload);
      toast.success("Campus updated successfully!");
      setEditingCampus(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update campus");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e4e4e7',
    borderRadius: 8, fontSize: '0.875rem', color: '#09090b',
    background: '#fff', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
  };

  const focusIn = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#0052cc';
    e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)';
  };
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#e4e4e7';
    e.target.style.boxShadow = 'none';
  };

  if (error && !loading && campusesList.length === 0) {
    return (
      <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', color: '#991b1b', margin: '2rem' }}>
        <h3 style={{ marginTop: 0, fontWeight: 800 }}>Error Loading Campuses</h3>
        <p style={{ margin: 0 }}>{error}</p>
      </div>
    );
  }

  // Aggregate all markers for the global map
  const globalMarkers = campusesList
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
          All Campuses ({campusesList.length})
        </h2>
        
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#71717a' }}>Loading campuses...</div>
        ) : campusesList.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '16px', color: '#71717a' }}>
            <BuildingIcon />
            <p style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}>No campuses found.</p>
            <p style={{ fontSize: '0.875rem' }}>Click "Add New Campus" to register your first location.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {campusesList.map((campus: any) => {
              const markers = (campus.location && campus.location.latitude && campus.location.longitude) ? [{
                id: campus._id,
                latitude: campus.location.latitude,
                longitude: campus.location.longitude,
                title: campus.name,
                type: 'hospital', 
                status: campus.status || 'active'
              }] : [];

              return (
                <div key={campus._id} style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: '16px', overflow: 'visible', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                  {/* Mini Map Section */}
                  <div style={{ height: '180px', position: 'relative', background: '#f4f4f5', borderBottom: '1px solid #f4f4f5', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' }}>
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
                        <button onClick={() => setEditingCampus(campus)} style={{ padding: '6px 14px', background: '#f4f4f5', border: '1px solid #e4e4e7', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#09090b' }}>Edit</button>
                        {/* <button onClick={() => setDeletingCampus(campus)} style={{ padding: '6px 14px', background: '#fff0f0', border: '1px solid #fecaca', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#dc2626' }}>Delete</button> */}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Edit Modal */}
      {editingCampus && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px', width: '100%', maxWidth: 500, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 24px' }}>Edit Campus</h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Campus Name</label>
                <input style={inputStyle} value={editingCampus.name} required
                  onChange={e => setEditingCampus({ ...editingCampus, name: e.target.value })}
                  onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Campus Code</label>
                  <input style={inputStyle} value={editingCampus.code} required
                    onChange={e => setEditingCampus({ ...editingCampus, code: e.target.value })}
                    onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} value={editingCampus.city} required
                    onChange={e => setEditingCampus({ ...editingCampus, city: e.target.value })}
                    onFocus={focusIn} onBlur={focusOut} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Physical Address</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 70 } as React.CSSProperties}
                  value={editingCampus.address} required
                  onChange={e => setEditingCampus({ ...editingCampus, address: e.target.value })}
                  onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div>
                <label style={labelStyle}>Coordinates (Lat, Long)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input style={{ ...inputStyle, fontFamily: 'monospace' }} 
                    value={editingCampus.location?.latitude || ''} required
                    onChange={e => setEditingCampus({ ...editingCampus, location: { ...editingCampus.location, latitude: parseFloat(e.target.value) } })}
                    onFocus={focusIn} onBlur={focusOut} />
                  <input style={{ ...inputStyle, fontFamily: 'monospace' }} 
                    value={editingCampus.location?.longitude || ''} required
                    onChange={e => setEditingCampus({ ...editingCampus, location: { ...editingCampus.location, longitude: parseFloat(e.target.value) } })}
                    onFocus={focusIn} onBlur={focusOut} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setEditingCampus(null)} style={{ flex: 1, padding: '12px', background: '#e4e4e7', color: '#09090b', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '12px', background: '#0052cc', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCampus && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px', width: '100%', maxWidth: 400, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 12px', color: '#09090b' }}>Delete Campus?</h2>
            <p style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{deletingCampus.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeletingCampus(null)} style={{ flex: 1, padding: '10px', background: '#e4e4e7', color: '#09090b', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} disabled={submitting} style={{ flex: 1, padding: '10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
