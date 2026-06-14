'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { users, campuses } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Icons ───────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const BuildingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default function ManageUsersPage() {
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [campusesList, setCampusesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals & Forms states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [selectedAdminForAssign, setSelectedAdminForAssign] = useState<any>(null);
  
  // Create / Edit form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [targetCampusId, setTargetCampusId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [adminsRes, campusesRes] = await Promise.all([
        users.getCampusAdmins(),
        campuses.getAll()
      ]);
      setAdminsList(adminsRes.data || []);
      setCampusesList(campusesRes.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await users.createCampusAdmin({ username, email, password });
      toast.success('Campus Admin created successfully!');
      setUsername('');
      setEmail('');
      setPassword('');
      setShowAddForm(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create Campus Admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setSubmitting(true);
    try {
      const payload: any = { username, email };
      if (password) payload.password = password;
      
      await users.editCampusAdmin(selectedAdmin._id, payload);
      toast.success('Campus Admin updated successfully!');
      setUsername('');
      setEmail('');
      setPassword('');
      setSelectedAdmin(null);
      setShowEditForm(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update Campus Admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    setSubmitting(true);
    try {
      await users.deleteCampusAdmin(selectedAdmin._id);
      toast.success('Campus Admin deleted successfully!');
      setSelectedAdmin(null);
      setShowDeleteModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete Campus Admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminForAssign || !targetCampusId) return;
    setSubmitting(true);
    try {
      await users.assignCampusAdmin({
        userId: selectedAdminForAssign._id,
        campusId: targetCampusId
      });
      toast.success('Campus Admin successfully assigned to campus!');
      setShowAssignModal(false);
      setSelectedAdminForAssign(null);
      setTargetCampusId('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign Campus Admin');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e4e4e7',
    borderRadius: 8, fontSize: '0.875rem', color: '#09090b',
    background: '#fff', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
  };

  const focusIn = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#0052cc';
    e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)';
  };
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#e4e4e7';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      {/* Header */}
      <div style={{ padding: '32px 36px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>Campus Admins</h1>
          <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, margin: 0 }}>
            Manage administrative personnel and assign them to campuses.
          </p>
        </div>
        <button 
          onClick={() => {
            setUsername('');
            setEmail('');
            setPassword('');
            setShowAddForm(true);
          }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#09090b', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <PlusIcon /> Create Campus Admin
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#71717a' }}>Loading users and campuses...</div>
        ) : adminsList.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '16px', color: '#71717a' }}>
            <UserIcon />
            <p style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}>No campus admins found.</p>
            <p style={{ fontSize: '0.875rem' }}>Click "Create Campus Admin" to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {adminsList.map((admin: any) => (
              <div 
                key={admin._id}
                style={{
                  background: '#fff',
                  border: '1px solid #e4e4e7',
                  borderRadius: 14,
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#f4f4f5', color: '#09090b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 700, border: '1px solid #e4e4e7'
                  }}>
                    {admin.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#09090b' }}>
                      {admin.username}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MailIcon /> {admin.email}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 500 }}>Assigned Campus</span>
                    {admin.campusId ? (
                      <span style={{
                        fontSize: '0.82rem', color: '#09090b', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 5, background: '#f4f4f5',
                        padding: '4px 10px', borderRadius: 6, border: '1px solid #e4e4e7'
                      }}>
                        <BuildingIcon /> {admin.campusId.name} ({admin.campusId.code})
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '0.75rem', color: '#d97706', fontWeight: 600,
                        background: '#fffbeb', padding: '4px 10px', borderRadius: 6,
                        border: '1px solid #fef3c7'
                      }}>
                        Unassigned
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        setSelectedAdminForAssign(admin);
                        setTargetCampusId(admin.campusId?._id || '');
                        setShowAssignModal(true);
                      }}
                      style={{
                        padding: '8px 14px', background: '#0052cc', color: '#fff',
                        border: 'none', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
                        cursor: 'pointer', transition: 'background 0.2s'
                      }}
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setUsername(admin.username);
                        setEmail(admin.email);
                        setPassword('');
                        setShowEditForm(true);
                      }}
                      style={{
                        padding: '8px 14px', background: '#f4f4f5', color: '#09090b',
                        border: '1px solid #e4e4e7', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setShowDeleteModal(true);
                      }}
                      style={{
                        padding: '8px 14px', background: '#fff1f2', color: '#e11d48',
                        border: '1px solid #ffe4e6', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 450, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <ShieldIcon />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#09090b' }}>Create Campus Admin</h2>
            </div>
            <p style={{ color: '#71717a', fontSize: '0.875rem', marginTop: 0, marginBottom: 24 }}>
              Register a new administrator for your organization. You can assign them to a campus once created.
            </p>

            <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Username</label>
                <input 
                  type="text" 
                  style={inputStyle} 
                  value={username} 
                  required
                  onChange={e => setUsername(e.target.value)}
                  onFocus={focusIn} 
                  onBlur={focusOut} 
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address</label>
                <input 
                  type="email" 
                  style={inputStyle} 
                  value={email} 
                  required
                  onChange={e => setEmail(e.target.value)}
                  onFocus={focusIn} 
                  onBlur={focusOut} 
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input 
                  type="password" 
                  style={inputStyle} 
                  value={password} 
                  required
                  onChange={e => setPassword(e.target.value)}
                  onFocus={focusIn} 
                  onBlur={focusOut} 
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  style={{ flex: 1, padding: '12px', background: '#e4e4e7', color: '#09090b', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  style={{ flex: 1, padding: '12px', background: '#0052cc', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditForm && selectedAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 450, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <ShieldIcon />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#09090b' }}>Edit Campus Admin</h2>
            </div>
            <p style={{ color: '#71717a', fontSize: '0.875rem', marginTop: 0, marginBottom: 24 }}>
              Update the profile information for <strong>{selectedAdmin.username}</strong>. Leave password blank if you do not wish to change it.
            </p>

            <form onSubmit={handleEditAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Username</label>
                <input 
                  type="text" 
                  style={inputStyle} 
                  value={username} 
                  required
                  onChange={e => setUsername(e.target.value)}
                  onFocus={focusIn} 
                  onBlur={focusOut} 
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address</label>
                <input 
                  type="email" 
                  style={inputStyle} 
                  value={email} 
                  required
                  onChange={e => setEmail(e.target.value)}
                  onFocus={focusIn} 
                  onBlur={focusOut} 
                />
              </div>

              <div>
                <label style={labelStyle}>Password (Optional)</label>
                <input 
                  type="password" 
                  style={inputStyle} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  onFocus={focusIn} 
                  onBlur={focusOut} 
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedAdmin(null);
                  }} 
                  style={{ flex: 1, padding: '12px', background: '#e4e4e7', color: '#09090b', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  style={{ flex: 1, padding: '12px', background: '#0052cc', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 400, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 12px', color: '#09090b' }}>Delete Campus Admin?</h2>
            <p style={{ color: '#71717a', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{selectedAdmin.username}</strong>? This will remove all their system privileges and unlink them from any assigned campus.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAdmin(null);
                }} 
                style={{ flex: 1, padding: '12px', background: '#e4e4e7', color: '#09090b', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAdmin} 
                disabled={submitting} 
                style={{ flex: 1, padding: '12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Campus Modal */}
      {showAssignModal && selectedAdminForAssign && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 450, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 12px', color: '#09090b' }}>Assign to Campus</h2>
            <p style={{ color: '#71717a', fontSize: '0.875rem', marginBottom: 24 }}>
              Select a campus to assign to <strong>{selectedAdminForAssign.username}</strong>. Note that a campus can only have one admin assigned.
            </p>

            <form onSubmit={handleAssignAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Select Campus</label>
                <select
                  style={inputStyle}
                  value={targetCampusId}
                  required
                  onChange={e => setTargetCampusId(e.target.value)}
                  onFocus={focusIn}
                  onBlur={focusOut}
                >
                  <option value="">-- Choose Campus --</option>
                  {campusesList.map((campus: any) => (
                    <option key={campus._id} value={campus._id}>
                      {campus.name} ({campus.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedAdminForAssign(null);
                  }} 
                  style={{ flex: 1, padding: '12px', background: '#e4e4e7', color: '#09090b', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  style={{ flex: 1, padding: '12px', background: '#0052cc', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
