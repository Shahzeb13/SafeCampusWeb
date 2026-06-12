'use client';

import React from 'react';
import { Shield, Globe, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      <div style={{ padding: '32px 36px 20px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>System Settings</h1>
          <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, marginBottom: 0 }}>Configure global platform behavior and security</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 800 }}>
          
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', itemsCenter: 'center', gap: 8, paddingBottom: 12, borderBottom: '1px solid #e4e4e7' }}>
              <Shield size={20} color="#9ca3af" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#09090b', margin: 0 }}>Global Security</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#09090b' }}>Two-Factor Authentication</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#71717a' }}>Enforce 2FA for all administrative accounts</p>
                </div>
                <div style={{ width: 44, height: 24, background: '#09090b', borderRadius: 999, position: 'relative', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', right: 4, top: 4, width: 16, height: 16, background: '#fff', borderRadius: '50%' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', opacity: 0.6 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#09090b' }}>IP Whitelisting</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#71717a' }}>Restrict access to specific IP ranges</p>
                </div>
                <div style={{ width: 44, height: 24, background: '#e4e4e7', borderRadius: 999, position: 'relative', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', left: 4, top: 4, width: 16, height: 16, background: '#fff', borderRadius: '50%' }} />
                </div>
              </div>
            </div>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', itemsCenter: 'center', gap: 8, paddingBottom: 12, borderBottom: '1px solid #e4e4e7' }}>
              <Globe size={20} color="#9ca3af" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#09090b', margin: 0 }}>Platform Registration</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ padding: '20px 24px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#09090b' }}>Allow New Organizations</p>
                <p style={{ margin: '4px 0 16px', fontSize: '0.75rem', color: '#71717a' }}>Enable the public signup flow for new entities</p>
                <select style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: '0.875rem', color: '#09090b', outline: 'none' }}>
                  <option>Always Allowed</option>
                  <option>Invitation Only</option>
                  <option>Disabled</option>
                </select>
              </div>
              <div style={{ padding: '20px 24px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#09090b' }}>Default Trial Period</p>
                <p style={{ margin: '4px 0 16px', fontSize: '0.75rem', color: '#71717a' }}>Set the default duration for new organization trials</p>
                <input type="number" defaultValue={14} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: '0.875rem', color: '#09090b', outline: 'none' }} />
              </div>
            </div>
          </section>

          <div style={{ paddingTop: 32, borderTop: '1px solid #e4e4e7', display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#09090b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
              <Save size={16} />
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
