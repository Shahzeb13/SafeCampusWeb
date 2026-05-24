'use client';

import React from 'react';
import { Users, UserPlus, Shield, Mail, MoreVertical } from 'lucide-react';

export default function UsersPage() {
  const users = [
    { name: 'Admin User', email: 'admin@safecampus.com', role: 'Super Admin', status: 'Online' },
    { name: 'John Smith', email: 'john@tech.edu', role: 'Org Owner', status: 'Offline' },
    { name: 'Sarah Wilson', email: 'sarah@global.com', role: 'Campus Admin', status: 'Online' },
    { name: 'Mike Johnson', email: 'mike@stmary.org', role: 'Security Personnel', status: 'Online' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Users</h1>
          <p className="text-slate-500 font-medium">Global user management and role assignment</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-sm">
          <UserPlus size={18} />
          Invite User
        </button>
      </header>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr key={user.email} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield size={14} className="text-slate-400" />
                    {user.role}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${
                    user.status === 'Online' ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
