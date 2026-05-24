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
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Audit Logs</h1>
        <p className="text-slate-500 font-medium">Immutable record of all system-wide actions</p>
      </header>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter logs..." 
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            />
          </div>
          <button className="text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-900 transition-colors">
            Export CSV
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {logs.map((log, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  log.type === 'error' ? 'bg-red-50 text-red-600' :
                  log.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                  log.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {log.type === 'error' ? <AlertTriangle size={18} /> :
                   log.type === 'warning' ? <Shield size={18} /> :
                   log.type === 'success' ? <CheckCircle2 size={18} /> :
                   <FileText size={18} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{log.event}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="font-semibold">{log.user}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>Target: {log.target}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-slate-400 flex items-center gap-1.5 justify-end">
                  <Clock size={12} />
                  {log.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
