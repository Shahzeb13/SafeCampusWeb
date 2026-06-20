"use client";

import React, { useState, useEffect } from 'react';
import { campuses } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Icons ─────────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

type Status = 'pending' | 'approved' | 'rejected';

interface CampusRequest {
  _id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  location: { latitude: number; longitude: number };
  allowedRadiusMeters: number;
  status: Status;
  rejectionReason?: string;
  organizationId: { _id: string; name: string } | null;
  requestedBy: { _id: string; username: string; email: string } | null;
  createdAt: string;
}

const statusConfig: Record<Status, { label: string; bg: string; color: string; dotColor: string }> = {
  pending:  { label: 'Pending',  bg: '#fffbeb', color: '#d97706', dotColor: '#f59e0b' },
  approved: { label: 'Approved', bg: '#f0fdf4', color: '#15803d', dotColor: '#22c55e' },
  rejected: { label: 'Rejected', bg: '#fef2f2', color: '#dc2626', dotColor: '#ef4444' },
};

export default function SuperAdminCampusRequestsPage() {
  const [requests, setRequests] = useState<CampusRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | Status>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await campuses.getSuperRequests();
      setRequests(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this request? A new campus will be created and linked to the organization.')) return;
    try {
      setProcessingId(id);
      await campuses.respondToRequest(id, 'approve');
      toast.success('Campus approved and created successfully!');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve request');
    } finally { setProcessingId(null); }
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    try {
      setProcessingId(rejectModal.id);
      await campuses.respondToRequest(rejectModal.id, 'reject', rejectionReason);
      toast.success('Request rejected. Reason sent to org owner.');
      setRejectModal({ open: false, id: '', name: '' });
      setRejectionReason('');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject request');
    } finally { setProcessingId(null); }
  };

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);
  const pending  = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#f8fafc', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#09090b', letterSpacing: '-0.02em' }}>Campus Creation Requests</h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#71717a' }}>Review and respond to campus creation requests from Organization Owners.</p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#fff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          <RefreshIcon /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total',    value: requests.length, color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', key: 'all' },
          { label: 'Pending',  value: pending,          color: '#d97706', bg: '#fffbeb', border: '#fde68a', key: 'pending' },
          { label: 'Approved', value: approved,         color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', key: 'approved' },
          { label: 'Rejected', value: rejected,         color: '#dc2626', bg: '#fef2f2', border: '#fecaca', key: 'rejected' },
        ].map(stat => (
          <div
            key={stat.key}
            onClick={() => setFilterStatus(stat.key as any)}
            style={{ background: stat.bg, border: `2px solid ${filterStatus === stat.key ? stat.color : stat.border}`, borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
          >
            <span style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</span>
            <span style={{ fontSize: '0.875rem', color: stat.color, fontWeight: 600 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '5px 16px', borderRadius: '99px', border: '1px solid', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              background: filterStatus === s ? '#09090b' : '#fff',
              color: filterStatus === s ? '#fff' : '#52525b',
              borderColor: filterStatus === s ? '#09090b' : '#e4e4e7',
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f4f4f5' }}>
          <span style={{ fontWeight: 700, color: '#09090b', fontSize: '0.95rem' }}>
            Requests {filterStatus !== 'all' ? `— ${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}` : ''} ({filtered.length})
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>Loading requests...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
            <p style={{ color: '#71717a', fontSize: '0.95rem' }}>No {filterStatus !== 'all' ? filterStatus : ''} requests found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
            {filtered.map(req => {
              const cfg = statusConfig[req.status];
              const isProcessing = processingId === req._id;
              return (
                <div key={req._id} style={{ border: '1px solid #e4e4e7', borderRadius: '12px', padding: '1.25rem 1.5rem', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#09090b' }}>{req.name}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '2px 8px', borderRadius: '99px' }}>{req.code}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{req.city} · {req.address}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`, borderRadius: '99px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dotColor, display: 'inline-block' }} />
                      {cfg.label}
                    </div>
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                    {req.organizationId && (
                      <span style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px', padding: '5px 12px' }}>
                        🏢 <strong>{req.organizationId.name}</strong>
                      </span>
                    )}
                    {req.requestedBy && (
                      <span style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px', padding: '5px 12px' }}>
                        👤 {req.requestedBy.username} ({req.requestedBy.email})
                      </span>
                    )}
                    <span style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px', padding: '5px 12px' }}>
                      📅 {new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Location */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#52525b' }}>
                    <span>📍 Lat: <strong>{req.location?.latitude?.toFixed(5)}</strong></span>
                    <span>📍 Lng: <strong>{req.location?.longitude?.toFixed(5)}</strong></span>
                    <span>📏 Radius: <strong>{req.allowedRadiusMeters}m</strong></span>
                  </div>

                  {req.status === 'rejected' && req.rejectionReason && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.65rem 1rem', fontSize: '0.82rem', color: '#dc2626' }}>
                      <strong>Rejection Reason Sent:</strong> {req.rejectionReason}
                    </div>
                  )}
                  {req.status === 'approved' && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.65rem 1rem', fontSize: '0.82rem', color: '#15803d' }}>
                      ✅ Campus created and linked to organization.
                    </div>
                  )}

                  {/* Actions for pending */}
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleApprove(req._id)}
                        disabled={isProcessing}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', background: isProcessing ? '#d1fae5' : '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                      >
                        <CheckIcon /> {isProcessing ? 'Processing...' : 'Approve & Create Campus'}
                      </button>
                      <button
                        onClick={() => setRejectModal({ open: true, id: req._id, name: req.name })}
                        disabled={isProcessing}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                      >
                        <XIcon /> Reject Request
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: 460, padding: '1.75rem' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: '#09090b' }}>Reject Campus Request</h2>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: '#71717a' }}>
              Rejecting request for <strong style={{ color: '#09090b' }}>{rejectModal.name}</strong>. Provide a reason — this will be visible to the Organization Owner.
            </p>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Campus code conflicts with an existing campus, please use a different code..."
              style={{ width: '100%', minHeight: 100, padding: '0.75rem 1rem', border: '1px solid #e4e4e7', borderRadius: '8px', fontSize: '0.85rem', resize: 'vertical', outline: 'none', color: '#09090b', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={() => { setRejectModal({ open: false, id: '', name: '' }); setRejectionReason(''); }}
                style={{ flex: 1, padding: '9px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', color: '#52525b' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim() || !!processingId}
                style={{ flex: 2, padding: '9px', background: processingId ? '#fecaca' : '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: processingId ? 'not-allowed' : 'pointer' }}
              >
                {processingId ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
