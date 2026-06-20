"use client";

import React, { useState, useEffect } from 'react';
import { campuses } from '@/lib/api';
import toast from 'react-hot-toast';
import DynamicLocationPickerMap from '@/components/Map/LocationPickerMapWrapper';

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

type RequestStatus = 'pending' | 'approved' | 'rejected';

interface CampusRequest {
  _id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  location: { latitude: number; longitude: number };
  allowedRadiusMeters: number;
  status: RequestStatus;
  rejectionReason?: string;
  createdAt: string;
}

const defaultForm = {
  name: '',
  code: '',
  city: '',
  address: '',
  latitude: 0,
  longitude: 0,
  allowedRadiusMeters: 1000,
  locationLabel: '',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid #e4e4e7', borderRadius: '8px',
  fontSize: '0.875rem', color: '#09090b', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit', background: '#fff',
};
const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block',
};

export default function OrgOwnerCampusRequestsPage() {
  const [requests, setRequests] = useState<CampusRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await campuses.getOwnerRequests();
      setRequests(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  /** Called by the map whenever user picks a point */
  const handleLocationPick = (lat: number, lng: number, displayName?: string) => {
    setForm(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      locationLabel: displayName || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      // Auto-fill address if empty
      address: prev.address || (displayName ? displayName.split(',').slice(0, 3).join(',') : ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.city || !form.address) {
      toast.error('Please fill in all required fields'); return;
    }
    if (!form.latitude || !form.longitude) {
      toast.error('Please pick a location on the map'); return;
    }
    try {
      setSubmitting(true);
      await campuses.submitRequest({
        name: form.name,
        code: form.code,
        city: form.city,
        address: form.address,
        location: { latitude: form.latitude, longitude: form.longitude },
        allowedRadiusMeters: form.allowedRadiusMeters || 1000,
      });
      toast.success('Campus creation request submitted!');
      setShowModal(false);
      setForm(defaultForm);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig: Record<RequestStatus, { label: string; bg: string; color: string; dotColor: string }> = {
    pending:  { label: 'Pending Review', bg: '#fffbeb', color: '#d97706', dotColor: '#f59e0b' },
    approved: { label: 'Approved',       bg: '#f0fdf4', color: '#15803d', dotColor: '#22c55e' },
    rejected: { label: 'Rejected',       bg: '#fef2f2', color: '#dc2626', dotColor: '#ef4444' },
  };

  const pending  = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#f8fafc', minHeight: '100%' }}>
      {/* ─── Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#09090b', letterSpacing: '-0.02em' }}>Campus Creation Requests</h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#71717a' }}>Submit new campus creation requests and track their approval status from the Super Admin.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchRequests} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            <RefreshIcon /> Refresh
          </button>
          <button onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#09090b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            <PlusIcon /> New Request
          </button>
        </div>
      </div>

      {/* ─── Stats Row ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Pending',  value: pending,  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          { label: 'Approved', value: approved, color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
          { label: 'Rejected', value: rejected, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</span>
            <span style={{ fontSize: '0.875rem', color: stat.color, fontWeight: 600 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ─── Requests List ──────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f4f4f5', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <span style={{ fontWeight: 700, color: '#09090b', fontSize: '0.95rem' }}>All Requests ({requests.length})</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>Loading requests…</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📋</div>
            <p style={{ color: '#71717a', fontSize: '0.95rem' }}>No campus requests yet. Click <strong>New Request</strong> to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
            {requests.map(req => {
              const cfg = statusConfig[req.status];
              return (
                <div key={req._id} style={{ border: '1px solid #e4e4e7', borderRadius: 12, padding: '1.25rem 1.5rem', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#09090b' }}>{req.name}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '2px 8px', borderRadius: 99 }}>{req.code}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{req.city} · {req.address}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`, borderRadius: 99, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dotColor, display: 'inline-block' }} />
                      {cfg.label}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#52525b' }}>
                    <span>📍 Lat: <strong>{req.location?.latitude?.toFixed(5)}</strong></span>
                    <span>📍 Lng: <strong>{req.location?.longitude?.toFixed(5)}</strong></span>
                    <span>📏 Radius: <strong>{req.allowedRadiusMeters}m</strong></span>
                    <span>📅 <strong>{new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</strong></span>
                  </div>

                  {req.status === 'rejected' && req.rejectionReason && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.65rem 1rem', fontSize: '0.82rem', color: '#dc2626' }}>
                      <strong>Rejection Reason:</strong> {req.rejectionReason}
                    </div>
                  )}
                  {req.status === 'approved' && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.65rem 1rem', fontSize: '0.82rem', color: '#15803d' }}>
                      ✅ This campus has been created by the Super Admin and is now active.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── New Request Modal ──────────────────────────────── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 24px 80px rgba(0,0,0,0.22)', width: '100%', maxWidth: 640, maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

            {/* Modal Header */}
            <div style={{ padding: '1.4rem 1.75rem', borderBottom: '1px solid #f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#09090b' }}>New Campus Request</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#71717a' }}>Search for a location on the map, then fill in the details</p>
              </div>
              <button type="button" onClick={() => { setShowModal(false); setForm(defaultForm); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 4 }}>
                <CloseIcon />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

              {/* ── Map Picker ── */}
              <div>
                <label style={{ ...labelStyle, marginBottom: 8 }}>
                  📍 Pick Campus Location <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <DynamicLocationPickerMap
                  latitude={form.latitude || undefined}
                  longitude={form.longitude || undefined}
                  radiusMeters={form.allowedRadiusMeters}
                  onChange={handleLocationPick}
                />
                {form.latitude && form.longitude ? (
                  <div style={{ marginTop: 8, display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#52525b', flexWrap: 'wrap' }}>
                    <span style={{ background: '#eef2ff', color: '#6366f1', borderRadius: 6, padding: '3px 10px', fontWeight: 600 }}>
                      Lat: {form.latitude.toFixed(6)}
                    </span>
                    <span style={{ background: '#eef2ff', color: '#6366f1', borderRadius: 6, padding: '3px 10px', fontWeight: 600 }}>
                      Lng: {form.longitude.toFixed(6)}
                    </span>
                  </div>
                ) : (
                  <p style={{ marginTop: 6, fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>⚠ No location selected yet — search or click on the map</p>
                )}
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #f4f4f5', margin: '0 -1.75rem', padding: '0 1.75rem' }} />

              {/* ── Campus Details ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Campus Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input name="name" value={form.name} onChange={handleChange} style={inputStyle} placeholder="e.g. COMSATS Abbottabad" required />
                </div>
                <div>
                  <label style={labelStyle}>Campus Code <span style={{ color: '#ef4444' }}>*</span></label>
                  <input name="code" value={form.code} onChange={handleChange} style={inputStyle} placeholder="e.g. CUI-ABT" required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>City <span style={{ color: '#ef4444' }}>*</span></label>
                <input name="city" value={form.city} onChange={handleChange} style={inputStyle} placeholder="e.g. Abbottabad" required />
              </div>

              <div>
                <label style={labelStyle}>Full Address <span style={{ color: '#ef4444' }}>*</span></label>
                <input name="address" value={form.address} onChange={handleChange} style={inputStyle} placeholder="e.g. University Road, Abbottabad, KP" required />
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 4 }}>Auto-filled from map search — you can edit it.</p>
              </div>

              {/* ── Radius ── */}
              <div>
                <label style={labelStyle}>
                  Geofence Radius <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#71717a' }}>(meters — shown as circle on map)</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    name="allowedRadiusMeters"
                    type="range"
                    min={100}
                    max={10000}
                    step={50}
                    value={form.allowedRadiusMeters}
                    onChange={handleChange}
                    style={{ flex: 1, accentColor: '#6366f1' }}
                  />
                  <span style={{ minWidth: 52, textAlign: 'right', fontWeight: 700, color: '#6366f1', fontSize: '0.9rem' }}>
                    {form.allowedRadiusMeters}m
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 4 }}>
                  Users must be within this radius from campus center to send SOS/alerts.
                </p>
              </div>

              {/* ── Actions ── */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f4f4f5' }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(defaultForm); }}
                  style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#52525b' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 2, padding: '10px', background: submitting ? '#a3a3a3' : '#09090b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Submitting…' : 'Submit Request to Super Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
