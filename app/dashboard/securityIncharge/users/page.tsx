"use client";

import React, { useState, useEffect } from 'react';
import styles from '../../dashboard.module.css';
import { users } from '@/lib/api';
import toast from 'react-hot-toast';

export default function UsersDashboard() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await users.create(formData);
      if (res.success) {
        toast.success(res.message || 'User created successfully');
        setFormData({ username: '', email: '', password: '', role: 'student' });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>User Management</h1>
          <p>Monitor and manage campus accounts</p>
        </div>
        <div className={styles.headerActions}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', background: '#f4f4f5', padding: '6px 14px', borderRadius: '20px', border: '1px solid #e4e4e7' }}>
            STUDENT &amp; STAFF
          </div>
        </div>
      </header>

      <div className={styles.scrollableArea}>

        {/* Create User Section */}
        <div className={styles.tableContainer} style={{ marginBottom: '2rem' }}>
           <div className={styles.tableHeader}>
              <h2>Create New User</h2>
           </div>
           
           <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.25rem', padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Username</label>
                <input 
                  required 
                  type="text" 
                  className={styles.input} 
                  placeholder="e.g. john_doe"
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Email</label>
                <input 
                  required 
                  type="email" 
                  className={styles.input}
                  placeholder="e.g. john@campus.edu"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Password</label>
                <input 
                  required 
                  type="password" 
                  className={styles.input}
                  placeholder="Minimum 8 characters"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Role</label>
                <select className={styles.input} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                   <option value="student">Student</option>
                   <option value="staff">Staff</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                 <button type="submit" disabled={loading} className={styles.primaryButton} style={{ padding: '0.75rem 1.5rem', width: 'auto' }}>
                    {loading ? 'Creating...' : 'Create User'}
                 </button>
              </div>
           </form>
        </div>

        {/* Users List */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>Users List</h2>
            <input 
              type="text" 
              placeholder="Search User" 
              className={styles.searchInput}
            />
          </div>
          
          <div style={{ padding: '12px 20px 4px 20px' }}>
            <div style={{ backgroundColor: '#fffbeb', color: '#92400e', padding: '10px 16px', borderRadius: '8px', marginBottom: '1rem', fontSize: '13px', border: '1px solid #fde68a', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>⚠️</span>
              <span><strong>Backend Integration Note:</strong> An endpoint to list users (<code>GET /api/admin/users</code>) is not yet available. Showing structural mock data below.</span>
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>UserName</th>
                <th>Email</th>
                <th>Role</th>
                <th>Active</th>
                <th>Status</th>
                <th>Reputation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td style={{ color: '#0052cc', fontWeight: 600 }}>mockuser_{i}</td>
                  <td>sample{i}@email.com</td>
                  <td>Student</td>
                  <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>On</span></td>
                  <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>● Online</span></td>
                  <td><span className={`${styles.badge} ${styles.badgeInfo}`}>0</span></td>
                  <td><button className={styles.rowAction}>⋮</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
