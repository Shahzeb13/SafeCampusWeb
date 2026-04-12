"use client";

import React, { useState } from 'react';
import styles from '../dashboard.module.css';
import { users } from '@/lib/api';
import toast from 'react-hot-toast';

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

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
          <h1>User Management Dashboard</h1>
          <p>Monitor and manage campus accounts</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconButton}>
            <BellIcon />
          </button>
        </div>
      </header>

      <div className={styles.scrollableArea}>

        {/* Create User Section */}
        <div className={styles.tableContainer} style={{ marginBottom: '2rem' }}>
           <div className={styles.tableHeader}>
              <h2>Create New User</h2>
           </div>
           
           <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Username</label>
                <input required type="text" className={styles.input} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Email</label>
                <input required type="email" className={styles.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Password</label>
                <input required type="password" className={styles.input} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Role</label>
                <select className={styles.input} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#fff' }}>
                   <option value="student">Student</option>
                   <option value="staff">Staff</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
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
          
          <div style={{ backgroundColor: '#fffbe1', color: '#856404', padding: '10px 15px', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px', border: '1px solid #ffeeba' }}>
            <strong>Backend Integration Note:</strong> The backend only provides user creation for admins (`POST /api/admin/users`). 
            An endpoint to list users (`GET /api/admin/users`) is missing. 
            Showing structural mock data below.
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>UserName</th>
                <th>Email</th>
                <th>Role</th>
                <th>IsActive</th>
                <th>Status</th>
                <th>Reputation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td style={{ color: '#2563eb', fontWeight: 500 }}>mockuser_{i}</td>
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
