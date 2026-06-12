'use client';

import React from 'react';
import { FileText, Search, Clock, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AuditLogsPage() {
  const logs = [
    { event: 'Organization Created', user: 'admin@safecampus.com', target: 'Tech University', time: '2 mins ago', type: 'info' },
    { event: 'User Permission Change', user: 'admin@safecampus.com', target: 'John Smith', time: '15 mins ago', type: 'warning' },
    { event: 'New Campus Registered', user: 'sarah@global.com', target: 'East Side School', time: '1 hour ago', type: 'success' },
    { event: 'Failed Login Attempt', user: 'unknown', target: 'System Auth', time: '2 hours ago', type: 'error' },
    { event: 'Global Settings Updated', user: 'admin@safecampus.com', target: 'Security Config', time: '5 hours ago', type: 'info' },
  ];

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      <div style={{ padding: '32px 36px 20px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>Audit Logs</h1>
          <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, marginBottom: 0 }}>Immutable record of all system-wide actions</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px' }}>
        <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e4e4e7', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 350 }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={16} />
              <input 
                type="text" 
                placeholder="Filter logs..." 
                style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: '0.875rem', color: '#09090b', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#0052cc'}
                onBlur={e => e.target.style.borderColor = '#e4e4e7'}
              />
            </div>
            <button style={{ background: 'none', border: 'none', fontSize: '0.72rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}>
              Export CSV
            </button>
          </div>

          <div>
            {logs.map((log, i) => (
              <div key={i} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < logs.length - 1 ? '1px solid #f4f4f5' : 'none', transition: 'background 0.2s' }}
                   onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#fafafa'}
                   onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ 
                    padding: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: log.type === 'error' ? '#fef2f2' : log.type === 'warning' ? '#fffbeb' : log.type === 'success' ? '#f0fdf4' : '#eff6ff',
                    color: log.type === 'error' ? '#ef4444' : log.type === 'warning' ? '#d97706' : log.type === 'success' ? '#10b981' : '#3b82f6'
                  }}>
                    {log.type === 'error' ? <AlertTriangle size={18} /> :
                     log.type === 'warning' ? <Shield size={18} /> :
                     log.type === 'success' ? <CheckCircle2 size={18} /> :
                     <FileText size={18} />}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#09090b' }}>{log.event}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>{log.user}</span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#d4d4d8' }} />
                      <span>Target: {log.target}</span>
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <Clock size={12} />
                    {log.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
