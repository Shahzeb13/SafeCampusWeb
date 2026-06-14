'use client';

import React, { useState, useEffect } from 'react';
import { campuses, organizations } from '@/lib/api';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f5', color: '#71717a' }}>Loading Map...</div>
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const ZoomInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
const LayersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
  </svg>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CampusesPage() {
  const [form, setForm] = useState({
    name: '',
    code: '',
    city: '',
    organizationId: '',
    address: '',
    location: { lat: 0, lng: 0 }
  });
  
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [campusesList, setCampusesList] = useState<any[]>([]);
  const [orgsList, setOrgsList] = useState<any[]>([]);

  // Modals state
  const [editingCampus, setEditingCampus] = useState<any>(null);
  const [deletingCampus, setDeletingCampus] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campRes, orgRes] = await Promise.all([
        campuses.getAll().catch(() => ({ data: [] })),
        organizations.getAll().catch(() => ({ data: [] }))
      ]);
      setCampusesList(campRes.data || []);
      setOrgsList(orgRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organizationId) {
      return toast.error("Please select an organization.");
    }
    
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        location: {
          latitude: parseFloat(latInput) || 0,
          longitude: parseFloat(lngInput) || 0,
        }
      };
      await campuses.create(payload);
      toast.success('Campus activated successfully!');
      
      // Reset form
      setForm({ name: '', code: '', city: '', organizationId: '', address: '', location: { lat: 0, lng: 0 } });
      setLatInput('');
      setLngInput('');
      
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create campus');
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      {/* Header */}
      <div style={{ padding: '32px 36px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>Campus Management</h1>
          <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, marginBottom: 0 }}>
            Configure and monitor educational infrastructure locations.
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', background: '#0052cc', border: 'none',
          borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
          color: '#fff', transition: 'all 0.2s', fontFamily: 'inherit',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#0747a6'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#0052cc'}
        >
          <PlusIcon /> New Campus
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>

          {/* LEFT — Create Form */}
          <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#09090b', margin: '0 0 24px' }}>Create Campus</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Campus Name</label>
                <input style={inputStyle} placeholder="North Central Campus" value={form.name} required
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onFocus={focusIn} onBlur={focusOut}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Campus Code</label>
                  <input style={inputStyle} placeholder="NCC-01" value={form.code} required
                    onChange={e => setForm({ ...form, code: e.target.value })}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} placeholder="Metropolis" value={form.city} required
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Organization</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...inputStyle, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                    value={form.organizationId} required
                    onChange={e => setForm({ ...form, organizationId: e.target.value })}
                    onFocus={focusIn} onBlur={focusOut}
                  >
                    <option value="" disabled>Select an Organization</option>
                    {orgsList.map(org => (
                      <option key={org._id} value={org._id}>{org.name}</option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Physical Address</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 70 } as React.CSSProperties}
                  placeholder="1242 Innovation Way, Suite 400" value={form.address} required
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  onFocus={focusIn} onBlur={focusOut}
                />
              </div>

              <div>
                <label style={labelStyle}>Coordinates (Lat, Long)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input style={{ ...inputStyle, fontFamily: 'monospace' }} placeholder="40.7128" value={latInput} required
                    onChange={e => setLatInput(e.target.value)}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                  <input style={{ ...inputStyle, fontFamily: 'monospace' }} placeholder="-74.0060" value={lngInput} required
                    onChange={e => setLngInput(e.target.value)}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                </div>
              </div>

              <button type="submit" disabled={submitting || orgsList.length === 0} style={{
                marginTop: 4, width: '100%', padding: '12px', background: '#0052cc',
                color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700,
                fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
                opacity: (submitting || orgsList.length === 0) ? 0.7 : 1, transition: 'all 0.2s',
              }}>
                {submitting ? 'Activating...' : orgsList.length === 0 ? 'Need Organization' : 'Confirm Activation'}
              </button>
            </form>
          </div>

          {/* RIGHT — Map + Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Map Card */}
            <div style={{
              borderRadius: 14, overflow: 'hidden', position: 'relative', height: 280,
              background: '#e4e4e7',
              border: '1px solid #e4e4e7', boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              zIndex: 1, // Fix leaflet z-index spilling
            }}>
              <LocationPickerMap 
                lat={parseFloat(latInput) || 0} 
                lng={parseFloat(lngInput) || 0} 
                onLocationSelect={(lat, lng) => {
                  setLatInput(lat.toFixed(6));
                  setLngInput(lng.toFixed(6));
                }} 
              />
              {/* Map overlay badge */}
              <div style={{
                position: 'absolute', bottom: 14, left: 14, zIndex: 1000,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)',
                borderRadius: 6, padding: '5px 12px',
                fontSize: '0.72rem', fontWeight: 700, color: '#fff',
                letterSpacing: '0.08em', textTransform: 'uppercase', pointerEvents: 'none'
              }}>
                CLICK MAP TO SELECT LOCATION
              </div>
            </div>

            {/* Registered Campuses Table */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'visible', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #e4e4e7' }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#09090b' }}>Registered Campuses</h2>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><SearchIcon /></span>
                  <input style={{ ...inputStyle, paddingLeft: 32, width: 180, fontSize: '0.8rem' }} placeholder="Search campuses..." />
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
                    {['Identifier', 'Campus Name', 'Organization', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>Loading campuses...</td></tr>
                  ) : campusesList.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>No campuses registered yet.</td></tr>
                  ) : (
                    campusesList.map((campus, i) => (
                      <tr key={campus._id} style={{ borderBottom: i < campusesList.length - 1 ? '1px solid #f4f4f5' : 'none' }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}
                      >
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', background: '#f0f0f5', color: '#3f3f5a', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>{campus.code}</span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#09090b' }}>{campus.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>{campus.city}</div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#27272a' }}>{campus.organizationId?.name || 'Unknown'}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: '#0052cc' }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0052cc', display: 'inline-block' }} />
                            Active
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditingCampus(campus)} style={{ padding: '6px 14px', background: '#f4f4f5', border: '1px solid #e4e4e7', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: '#09090b' }}>Edit</button>
                            <button onClick={() => setDeletingCampus(campus)} style={{ padding: '6px 14px', background: '#fff0f0', border: '1px solid #fecaca', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
