"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ─── Icons ───────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const BanIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// ─── Status Badge Helper ───────────────────────────────────────────────────
const statusBadgeStyle = (status: string) => ({
  padding: '4px 10px',
  background: status === 'active' ? '#dcfce7' : status === 'pending' ? '#fef9c3' : '#fef2f2',
  color: status === 'active' ? '#166534' : status === 'pending' ? '#854d0e' : '#991b1b',
  borderRadius: '99px',
  fontSize: '0.72rem',
  fontWeight: 700 as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
});

export default function ManageSecurity() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suspending, setSuspending] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'security_personnel' });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/api/admin/campus-admin/security-personnel", { withCredentials: true });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load security personnel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSuspend = async (id: string) => {
    if (!confirm("Are you sure you want to suspend this security personnel? They will lose system access.")) return;
    setSuspending(id);
    try {
      await axios.delete(`http://localhost:4000/api/admin/campus-admin/security-personnel/${id}`, { withCredentials: true });
      fetchUsers();
    } catch (err) {
      alert("Failed to suspend security personnel. Please try again.");
    } finally {
      setSuspending(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await axios.post("http://localhost:4000/api/admin/campus-admin/createSecurityPersonel", formData, { withCredentials: true });
      if (res.data.success) {
        setIsModalOpen(false);
        setFormData({ username: '', email: '', password: '', role: 'security_personnel' });
        fetchUsers();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to create security personnel");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (user: any) => {
    setEditData({ ...user, password: '' });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const payload = { ...editData };
      if (!payload.password) delete payload.password;

      const res = await axios.put(`http://localhost:4000/api/admin/campus-admin/security-personnel/${editData._id}`, payload, { withCredentials: true });
      if (res.data.success) {
        setIsEditModalOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to update security personnel");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Client-side filtering ─────────────────────────────────────────────────
  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      user.username?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.phoneNumber?.toLowerCase().includes(q) ||
      user.role?.toLowerCase().replace('_', ' ').includes(q);

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e4e4e7',
    borderRadius: '8px',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    marginBottom: 6,
    color: '#3f3f46',
  };

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fafafa', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ padding: '32px 36px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>
            Security Personnel
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, margin: '4px 0 0' }}>
            Manage all campus security guards and incharges.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#09090b', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '9px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <PlusIcon /> Add Security
        </button>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px' }}>

        {/* ── Filter & Search Bar ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', pointerEvents: 'none' }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, phone, role…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #e4e4e7', borderRadius: '9px', fontSize: '0.875rem', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          {/* Role filter */}
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #e4e4e7', borderRadius: '9px', background: '#fff', fontSize: '0.875rem', cursor: 'pointer', minWidth: 160 }}
          >
            <option value="all">All Roles</option>
            <option value="security_personnel">Security Personnel</option>
            <option value="security_incharge">Security Incharge</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #e4e4e7', borderRadius: '9px', background: '#fff', fontSize: '0.875rem', cursor: 'pointer', minWidth: 150 }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Count badge */}
          <span style={{ fontSize: '0.8rem', color: '#71717a', whiteSpace: 'nowrap', padding: '10px 4px' }}>
            {filteredUsers.length} of {users.length} shown
          </span>
        </div>

        {/* ── Table / States ── */}
        {error ? (
          <div style={{ padding: '20px 24px', background: '#fef2f2', color: '#991b1b', borderRadius: '12px', border: '1px solid #fecaca', fontSize: '0.875rem' }}>
            ⚠️ {error}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
                  <th style={{ padding: '14px 24px', fontSize: '0.72rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Officer</th>
                  <th style={{ padding: '14px 24px', fontSize: '0.72rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                  <th style={{ padding: '14px 24px', fontSize: '0.72rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '14px 24px', fontSize: '0.72rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#a1a1aa', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, border: '3px solid #e4e4e7', borderTopColor: '#09090b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                        Loading security personnel…
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '48px', textAlign: 'center' }}>
                      <div style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>
                        {users.length === 0 ? '🛡️ No security personnel found. Add your first officer!' : '🔍 No results match your search or filters.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user._id} style={{ borderBottom: '1px solid #f4f4f5', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #475569)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                            {user.username?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#09090b', fontSize: '0.875rem' }}>{user.username}</div>
                            <div style={{ color: '#71717a', fontSize: '0.75rem', marginTop: 1 }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{ padding: '4px 10px', background: user.role === 'security_incharge' ? '#ede9fe' : '#f0f9ff', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, color: user.role === 'security_incharge' ? '#5b21b6' : '#0369a1', textTransform: 'capitalize', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                          {user.role?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={statusBadgeStyle(user.status)}>{user.status}</span>
                      </td>
                      <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          {/* Edit */}
                          <button
                            onClick={() => handleEditClick(user)}
                            title="Edit officer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'transparent', border: '1px solid #e4e4e7', borderRadius: '7px', cursor: 'pointer', color: '#3b82f6', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#eff6ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#3b82f6'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e4e4e7'; }}
                          >
                            <EditIcon /> Edit
                          </button>
                          {/* Suspend */}
                          <button
                            onClick={() => handleSuspend(user._id)}
                            disabled={suspending === user._id || user.status === 'suspended'}
                            title={user.status === 'suspended' ? 'Already suspended' : 'Suspend officer'}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: user.status === 'suspended' ? '#f4f4f5' : 'transparent', border: '1px solid', borderColor: user.status === 'suspended' ? '#e4e4e7' : '#fca5a5', borderRadius: '7px', cursor: user.status === 'suspended' ? 'not-allowed' : 'pointer', color: user.status === 'suspended' ? '#a1a1aa' : '#ef4444', fontSize: '0.78rem', fontWeight: 600, opacity: suspending === user._id ? 0.6 : 1, transition: 'all 0.15s' }}
                            onMouseEnter={e => { if (user.status !== 'suspended') { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444'; } }}
                            onMouseLeave={e => { if (user.status !== 'suspended') { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#fca5a5'; } }}
                          >
                            <BanIcon />
                            {suspending === user._id ? 'Suspending…' : user.status === 'suspended' ? 'Suspended' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', width: '420px', borderRadius: '18px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800, color: '#09090b' }}>Add Security Personnel</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.8rem', color: '#71717a' }}>Fill in the details to add a new security officer.</p>

            {formError && <div style={{ marginBottom: 16, padding: 12, background: '#fef2f2', color: '#991b1b', borderRadius: 8, fontSize: '0.875rem', border: '1px solid #fecaca' }}>{formError}</div>}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Username</label>
                <input required type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} style={inputStyle} placeholder="e.g. guard_ali" />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} placeholder="officer@campus.edu" />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={inputStyle} placeholder="Minimum 8 characters" />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}>
                  <option value="security_personnel">Security Personnel</option>
                  <option value="security_incharge">Security Incharge</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #e4e4e7', borderRadius: '8px', color: '#52525b', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 22px', background: '#09090b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.875rem', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Creating…' : 'Add Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {isEditModalOpen && editData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', width: '500px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '18px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800, color: '#09090b' }}>Edit Security Personnel</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.8rem', color: '#71717a' }}>Update {editData.username}'s information below.</p>

            {formError && <div style={{ marginBottom: 16, padding: 12, background: '#fef2f2', color: '#991b1b', borderRadius: 8, fontSize: '0.875rem', border: '1px solid #fecaca' }}>{formError}</div>}

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Username</label>
                  <input required type="text" value={editData.username || ''} onChange={e => setEditData({ ...editData, username: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input required type="email" value={editData.email || ''} onChange={e => setEditData({ ...editData, email: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>New Password <span style={{ fontWeight: 400, color: '#a1a1aa' }}>(leave blank to keep current)</span></label>
                <input type="password" value={editData.password || ''} onChange={e => setEditData({ ...editData, password: e.target.value })} style={inputStyle} placeholder="••••••••" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={editData.status || 'active'} onChange={e => setEditData({ ...editData, status: e.target.value })} style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Role</label>
                  <select value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })} style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}>
                    <option value="security_personnel">Security Personnel</option>
                    <option value="security_incharge">Security Incharge</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" value={editData.phoneNumber || ''} onChange={e => setEditData({ ...editData, phoneNumber: e.target.value })} style={inputStyle} placeholder="+92 300 0000000" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #e4e4e7', borderRadius: '8px', color: '#52525b', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 22px', background: '#09090b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.875rem', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}