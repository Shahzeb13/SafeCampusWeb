'use client';

import React from 'react';
import { Settings, Shield, Bell, Globe, Lock, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Settings</h1>
        <p className="text-slate-500 font-medium">Configure global platform behavior and security</p>
      </header>

      <div className="space-y-8">
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield size={20} className="text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">Global Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div>
                <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Enforce 2FA for all administrative accounts</p>
              </div>
              <div className="w-12 h-6 bg-slate-900 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm opacity-60">
              <div>
                <p className="font-bold text-slate-900">IP Whitelisting</p>
                <p className="text-xs text-slate-500">Restrict access to specific IP ranges</p>
              </div>
              <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Globe size={20} className="text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">Platform Registration</h2>
          </div>
          <div className="space-y-4 text-sm">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                 <p className="font-bold text-slate-900">Allow New Organizations</p>
                 <p className="text-xs text-slate-500">Enable the public signup flow for new entities</p>
                 <select className="w-full mt-2 bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold">
                   <option>Always Allowed</option>
                   <option>Invitation Only</option>
                   <option>Disabled</option>
                 </select>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                 <p className="font-bold text-slate-900">Default Trial Period</p>
                 <p className="text-xs text-slate-500">Set the default duration for new organization trials</p>
                 <input type="number" defaultValue={14} className="w-full mt-2 bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold" />
               </div>
             </div>
          </div>
        </section>

        <div className="pt-8 border-t border-slate-100 flex justify-end">
           <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
