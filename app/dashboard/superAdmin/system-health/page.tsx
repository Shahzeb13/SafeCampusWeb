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
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Health</h1>
        <p className="text-slate-500 font-medium">Real-time infrastructure and service monitoring</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.name} className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm hover:border-slate-200 transition-all">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                <service.icon size={20} />
              </div>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded">
                {service.status}
              </span>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">{service.name}</h3>
              <p className="text-xs text-slate-500 font-medium">Uptime: {service.uptime}</p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="h-1 flex-1 bg-slate-50 rounded-full overflow-hidden flex gap-0.5">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="h-full flex-1 bg-emerald-400" />
                ))}
              </div>
              <span className="ml-4 text-[10px] font-bold text-slate-400 font-mono">{service.latency}</span>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-slate-900 rounded-3xl p-8 text-white space-y-6">
        <h2 className="text-xl font-bold">Global Incident History</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-start border-l-2 border-slate-800 pl-6 pb-6 relative">
            <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-600" />
            <div>
              <p className="text-sm font-bold">Scheduled Maintenance Complete</p>
              <p className="text-xs text-slate-400">May 12, 2026 - 04:00 UTC</p>
            </div>
          </div>
          <div className="flex gap-4 items-start border-l-2 border-slate-800 pl-6 relative">
            <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-600" />
            <div>
              <p className="text-sm font-bold">System Fully Operational</p>
              <p className="text-xs text-slate-400">May 10, 2026 - 12:00 UTC</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
