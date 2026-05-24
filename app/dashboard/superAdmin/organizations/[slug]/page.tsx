'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { organizations } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Icons ─────────────────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// ─── Page ──────────────────────────────────────────────────────────────────
export default function OrganizationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  console.log(params);
  const slug = params.slug;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [orgId, setOrgId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '', slug: '', type: 'university', description: '', logoUrl: '',
    website: '', contactEmail: '', contactPhone: '', address: '',
    city: '', country: 'Pakistan', status: 'trial'
  });

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await organizations.getBySlug(slug);
        const org = res.data;
        if (!org) {
          toast.error('Organization not found');
          router.push('/dashboard/superAdmin/organizations');
          return;
        }
        
        setOrgId(org._id);
        
        setFormData({
          name: org.name || '',
          slug: org.slug || '',
          type: org.type || 'university',
          description: org.description || '',
          logoUrl: org.logoUrl || '',
          website: org.website || '',
          contactEmail: org.contactEmail || '',
          contactPhone: org.contactPhone || '',
          address: org.address || '',
          city: org.city || '',
          country: org.country || 'Pakistan',
          status: org.status || 'trial'
        });
        
      } catch (error) {
        console.error(error);
        toast.error('Failed to load organization details');
        router.push('/dashboard/superAdmin/organizations');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchOrg();
    }
  }, [params.slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await organizations.update(orgId, formData);
      toast.success('Organization updated successfully');
      
      // If the slug changed, we need to route to the new slug url
      if (formData.slug !== params.slug) {
        router.push(`/dashboard/superAdmin/organizations/${formData.slug}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update organization');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to completely delete this organization? This action cannot be undone.")) {
      setDeleting(true);
      try {
        await organizations.delete(orgId);
        toast.success("Organization deleted successfully");
        router.push('/dashboard/superAdmin/organizations');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete organization');
        setDeleting(false);
      }
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

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <p style={{ color: '#71717a', fontWeight: 600 }}>Loading organization details...</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      {/* Header */}
      <div style={{ padding: '32px 36px 20px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button onClick={() => router.push('/dashboard/superAdmin/organizations')} style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
            color: '#71717a', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 16
          }}>
            <ArrowLeftIcon /> Back to Organizations
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>{formData.name}</h1>
          <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, marginBottom: 0 }}>
            Manage details and settings for this organization.
          </p>
        </div>
        
        <button onClick={handleDelete} disabled={deleting} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 18px', background: '#fff', border: '1.5px solid #ef4444',
          borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
          color: '#ef4444', transition: 'all 0.2s',
        }}>
          <TrashIcon /> {deleting ? 'Deleting...' : 'Delete Organization'}
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px' }}>
        <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', maxWidth: 800 }}>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 } as React.CSSProperties} placeholder="Brief description of the organization" value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                onFocus={e => { e.target.style.borderColor = '#0052cc'; e.target.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, borderTop: '1px solid #e4e4e7', paddingTop: 24 }}>
              <button type="submit" disabled={submitting} style={{
                padding: '12px 32px', background: '#0052cc',
                color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700,
                fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
                opacity: submitting ? 0.7 : 1, transition: 'all 0.2s',
              }}>
                {submitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  );
}
