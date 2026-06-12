'use client';

import React from 'react';
import { Activity, Server, Database, Globe, Zap, Cpu } from 'lucide-react';

export default function SystemHealthPage() {
  const services = [
    { name: 'Core API Service', status: 'Operational', uptime: '99.99%', latency: '24ms', icon: Zap },
    { name: 'Real-time WebSocket', status: 'Operational', uptime: '99.95%', latency: '12ms', icon: Activity },
    { name: 'PostgreSQL Cluster', status: 'Operational', uptime: '100%', latency: '8ms', icon: Database },
    { name: 'Redis Cache', status: 'Operational', uptime: '100%', latency: '2ms', icon: Cpu },
    { name: 'CDN Gateway', status: 'Operational', uptime: '99.99%', latency: '42ms', icon: Globe },
    { name: 'Background Workers', status: 'Operational', uptime: '99.98%', latency: '-', icon: Server },
  ];

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      <div style={{ padding: '32px 36px 20px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.03em' }}>System Health</h1>
          <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: 4, marginBottom: 0 }}>Real-time infrastructure and service monitoring</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 36px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {services.map((service) => (
            <div key={service.name} style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ padding: 8, background: '#f4f4f5', borderRadius: 8, color: '#52525b' }}>
                  <service.icon size={20} />
                </div>
                <span style={{ padding: '4px 8px', background: '#f0fdf4', color: '#16a34a', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', borderRadius: 4, letterSpacing: '0.05em' }}>
                  {service.status}
                </span>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#09090b' }}>{service.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#71717a', fontWeight: 500 }}>Uptime: {service.uptime}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #f4f4f5' }}>
                <div style={{ height: 4, flex: 1, background: '#f4f4f5', borderRadius: 4, overflow: 'hidden', display: 'flex', gap: 2 }}>
                  {[...Array(20)].map((_, i) => (
                    <div key={i} style={{ height: '100%', flex: 1, background: '#34d399' }} />
                  ))}
                </div>
                <span style={{ marginLeft: 16, fontSize: '0.7rem', fontWeight: 700, color: '#a1a1aa', fontFamily: 'monospace' }}>{service.latency}</span>
              </div>
            </div>
          ))}
        </div>

        <section style={{ background: '#09090b', borderRadius: 16, padding: '32px', color: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 24px', letterSpacing: '-0.02em' }}>Global Incident History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: '2px solid #27272a', paddingLeft: 20, position: 'relative' }}>
              <div style={{ position: 'absolute', left: -5, top: 0, width: 8, height: 8, borderRadius: '50%', background: '#52525b' }} />
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>Scheduled Maintenance Complete</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#a1a1aa' }}>May 12, 2026 - 04:00 UTC</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: '2px solid transparent', paddingLeft: 20, position: 'relative' }}>
              <div style={{ position: 'absolute', left: -5, top: 0, width: 8, height: 8, borderRadius: '50%', background: '#52525b' }} />
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>System Fully Operational</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#a1a1aa' }}>May 10, 2026 - 12:00 UTC</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
