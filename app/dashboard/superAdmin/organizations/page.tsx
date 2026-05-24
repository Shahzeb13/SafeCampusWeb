'use client';

import React, { useState, useEffect } from 'react';
import { organizations } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Icons ─────────────────────────────────────────────────────────────────
const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
  </svg>
);
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const SortIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const PrevIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const NextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ShieldCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
  </svg>
);
const AlertTriangleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const ExportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const STATUS_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  ACTIVE: { bg: 'transparent', color: '#0052cc', dot: '#0052cc' },
  INACTIVE: { bg: 'transparent', color: '#9ca3af', dot: '#9ca3af' },
};

// ─── Page ──────────────────────────────────────────────────────────────────
export default function OrganizationsPage() {
  const [formData, setFormData] = useState({
    name: '', slug: '', type: 'university', description: '', logoUrl: '',
    website: '', contactEmail: '', contactPhone: '', address: '',
    city: '', country: 'Pakistan', status: 'trial'
  });
  const [submitting, setSubmitting] = useState(false);
  
  const [orgsList, setOrgsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await organizations.getAll();
      setOrgsList(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await organizations.create(formData);
      toast.success('Organization created successfully');
      setFormData({ 
        name: '', slug: '', type: 'university', description: '', logoUrl: '',
        website: '', contactEmail: '', contactPhone: '', address: '',
        city: '', country: 'Pakistan', status: 'trial'
      });
      fetchOrgs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create organization');
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

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      {/* Header */}
      <div style={{ padding: '32px 36px 20px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>Organizations</h1>
          <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, marginBottom: 0 }}>
            Manage your institutional hierarchy and security permissions.
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 18px', background: '#fff', border: '1.5px solid #e4e4e7',
          borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
          color: '#09090b', transition: 'all 0.2s',
        }}>
          <ExportIcon /> Export CSV
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>

          {/* LEFT — Create Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#09090b', margin: '0 0 24px' }}>Create Organization</h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Organization Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} placeholder="e.g. Comsats University" value={formData.name} required
                    onChange={e => {
                      const newName = e.target.value;
                      const newSlug = newName.toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
                      setFormData(prev => ({ ...prev, name: newName, slug: newSlug }));
                    }}
                    onFocus={e => { e.target.style.borderColor = '#0052cc'; e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Slug <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ display: 'flex', border: '1.5px solid #e4e4e7', borderRadius: 8, overflow: 'hidden', background: '#fff', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                    <span style={{ padding: '9px 12px', background: '#f4f4f5', borderRight: '1px solid #e4e4e7', fontSize: '0.875rem', color: '#71717a', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>safecampus.io/</span>
                    <input style={{ ...inputStyle, border: 'none', borderRadius: 0, outline: 'none', flex: 1, padding: '9px 12px' }}
                      placeholder="pnw-edu" value={formData.slug} required
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Contact Email <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="email" style={inputStyle} placeholder="admin@pnw.edu" value={formData.contactEmail} required
                      onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#0052cc'; e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Contact Phone (Optional)</label>
                    <input type="tel" style={inputStyle} placeholder="+92 300 1234567" value={formData.contactPhone}
                      onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#0052cc'; e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <div style={{ position: 'relative' }}>
                      <select style={{ ...inputStyle, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                        value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                        onFocus={e => { e.target.style.borderColor = '#0052cc'; e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
                      >
                        <option value="university">University</option>
                        <option value="college">College</option>
                        <option value="school">School</option>
                        <option value="company">Company</option>
                        <option value="other">Other</option>
                      </select>
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}><ChevronDownIcon /></span>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <div style={{ position: 'relative' }}>
                      <select style={{ ...inputStyle, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                        value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                        onFocus={e => { e.target.style.borderColor = '#0052cc'; e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="trial">Trial</option>
                      </select>
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}><ChevronDownIcon /></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>City (Optional)</label>
                    <input style={inputStyle} placeholder="Seattle" value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#0052cc'; e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Country (Optional)</label>
                    <input style={inputStyle} placeholder="Pakistan" value={formData.country}
                      onChange={e => setFormData({ ...formData, country: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#0052cc'; e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Address (Optional)</label>
                  <input style={inputStyle} placeholder="123 Education Lane" value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    onFocus={e => { e.target.style.borderColor = '#0052cc'; e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Description (Optional)</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 60 } as React.CSSProperties} placeholder="Brief description of the organization" value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    onFocus={e => { e.target.style.borderColor = '#0052cc'; e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Website (Optional)</label>
                    <input style={inputStyle} placeholder="https://pnw.edu" value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#0052cc'; e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Logo URL (Optional)</label>
                    <input style={inputStyle} placeholder="https://domain.com/logo.png" value={formData.logoUrl}
                      onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                      onFocus={e => { e.target.style.borderColor = '#0052cc'; e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting} style={{
                  marginTop: 8, width: '100%', padding: '11px', background: '#09090b',
                  color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700,
                  fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
                  opacity: submitting ? 0.7 : 1, transition: 'all 0.2s',
                }}>
                  {submitting ? 'Registering...' : 'Register Organization'}
                </button>
              </form>
            </div>

            {/* Campus Oversight Banner */}
            <div style={{
              borderRadius: 14, overflow: 'hidden', position: 'relative', minHeight: 180,
              background: 'linear-gradient(145deg, #1a1a2e 0%, #0a0a1a 100%)',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
              <div style={{ position: 'relative', padding: '24px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Campus Oversight</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
                  Security protocols are automatically inherited by sub-campuses.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Orgs Table + Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Table */}
            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid #e4e4e7', background: '#f9f9f9' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{orgsList.length} Registered</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#27272a' }}><FilterIcon /></button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#27272a' }}><SortIcon /></button>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                    {['Organization', 'ID / Slug', 'Type', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#fafafa' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>Loading organizations...</td></tr>
                  ) : orgsList.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>No organizations registered yet.</td></tr>
                  ) : (
                    orgsList.map((org, i) => {
                      const sc = STATUS_COLORS[org.status] || STATUS_COLORS.INACTIVE;
                      return (
                        <tr key={org._id} style={{ borderBottom: i < orgsList.length - 1 ? '1px solid #f4f4f5' : 'none' }}
                          onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'}
                          onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}
                        >
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#09090b' }}>{org.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>{org.contactEmail}</div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', background: '#f0f0f5', color: '#3f3f5a', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>{org.slug}</span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#27272a' }}>{org.type || 'N/A'}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: sc.color }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
                              {org.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                            <a href={`/dashboard/superAdmin/organizations/${org.slug}`} style={{ background: 'none', border: '1px solid #e4e4e7', cursor: 'pointer', color: '#09090b', padding: '6px 12px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}>
                              Manage
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {!loading && orgsList.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #f4f4f5' }}>
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Showing {orgsList.length} organizations</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: 7, cursor: 'pointer' }}><PrevIcon /></button>
                    <button style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: 7, cursor: 'pointer' }}><NextIcon /></button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Verification Rate */}
              <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <ShieldCheckIcon />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a' }}>+12%</span>
                </div>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Verification Rate</p>
                <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>98.4%</p>
              </div>

              {/* Pending Audits */}
              <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <AlertTriangleIcon />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#d97706' }}>-3%</span>
                </div>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Pending Audits</p>
                <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>14</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
