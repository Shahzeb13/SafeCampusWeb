'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, MoreVertical, X } from 'lucide-react';
import { users, organizations, campuses } from '@/lib/api';

type ActionType = 'createOrgOwner';

export default function UsersPage() {
  const [data, setData] = useState({ users: [], organizations: [], campuses: [], loading: true });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>('createOrgOwner');
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', organizationId: '', userId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setData(prev => ({ ...prev, loading: true }));
    try {
      const [uRes, oRes, cRes] = await Promise.all([
        users.getAll().catch(() => ({ data: [] })),
        organizations.getAll().catch(() => ({ data: [] })),
        campuses.getAll().catch(() => ({ data: [] }))
      ]);
      setData({
        users: uRes.data || [],
        organizations: oRes.data || [],
        campuses: cRes.data || [],
        loading: false
      });
    } catch (err) {
      console.error(err);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Snding dating to backedn to craete orgOwner")
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Only createOrgOwner flow – creates user and links to organization
      console.log("formData", formData);
      await users.createOrgOwner(formData);
      setIsModalOpen(false);
      setFormData({ username: '', email: '', password: '', organizationId: '', userId: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'An error occurred while performing this action.');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      <div style={{ padding: '32px 36px 20px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>Users</h1>
          <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, marginBottom: 0 }}>Global user management and role assignment</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', background: '#09090b', border: 'none',
            borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
            color: '#fff', transition: 'all 0.2s',
          }}
        >
          <UserPlus size={16} />
          Assign Org Owner
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px' }}>
        <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '0.68rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.loading ? (
                <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>Loading users...</td></tr>
              ) : data.users.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>No users found.</td></tr>
              ) : (
                data.users.map((user: any, i: number) => (
                  <tr key={user._id} style={{ borderBottom: i < data.users.length - 1 ? '1px solid #f4f4f5' : 'none', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase' }}>
                          {user.username?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#09090b' }}>{user.username}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#71717a', marginTop: 2 }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: '#27272a' }}>
                        <Shield size={14} color="#9ca3af" />
                        {user.role}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '0.875rem', color: '#09090b' }}>{data.organizations.find((o: any) => o._id === user.organizationId)?.name || '—'}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: (user.status === 'active' || user.status === 'Online') ? '#16a34a' : '#9ca3af' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: (user.status === 'active' || user.status === 'Online') ? '#16a34a' : '#9ca3af', display: 'inline-block' }} />
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                       <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f', padding: 4, marginRight: 8 }}
                          onClick={async () => {
                            if (confirm('Delete this organization owner?')) {
                              await users.deleteOrgOwner({ userId: user._id, organizationId: user.organizationId });
                              fetchData();
                            }
                          }}
                        >
                          Delete
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                          <MoreVertical size={18} />
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid #e4e4e7' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.02em' }}>Manage Users</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '80vh', overflowY: 'auto' }}>
              {error && <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', fontSize: '0.875rem', borderRadius: 8, border: '1px solid #fca5a5' }}>{error}</div>}
              
              <div>
                <label style={labelStyle}>Action Type</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={actionType} 
                    onChange={(e) => { setActionType(e.target.value as ActionType); setError(''); }}
                    style={{ ...inputStyle, appearance: 'none' }}
                  >
                    <option value="createOrgOwner">Create Organization Owner</option>
                  </select>
                </div>
              </div>

              <> 
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Username</label>
                      <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Password</label>
                    <input type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Organization</label>
                    <select required value={formData.organizationId} onChange={(e) => setFormData({...formData, organizationId: e.target.value})} style={{ ...inputStyle, appearance: 'none' }}>
                      <option value="">-- Choose Organization --</option>
                      {data.organizations.map((o: any) => (
                        <option key={o._id} value={o._id}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                </>

              <div style={{ paddingTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '9px 18px', background: 'transparent', border: 'none', color: '#71717a', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '9px 18px', background: '#09090b', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
