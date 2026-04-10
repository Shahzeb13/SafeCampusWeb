import React from 'react';
import styles from '../dashboard.module.css';

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const UserCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
);

const UserMinusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="18" y1="8" x2="23" y2="13" />
    <line x1="23" y1="8" x2="18" y2="13" />
  </svg>
);

const HandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.508-1.827-4.885-3.116L5.59 13.6a1 1 0 0 1 .4-1.2l2.6-1.5" />
    <path d="M6 10V2a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v9" />
  </svg>
);

export default function UsersDashboard() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>User Management Dashboard</h1>
          <p>Monitor and manage campus security</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconButton}>
            <BellIcon />
          </button>
        </div>
      </header>

      <div className={styles.scrollableArea}>
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${styles.iconInfo}`}>
                <UsersIcon />
              </div>
            </div>
            <span className={styles.statValue}>1250</span>
            <span className={styles.statLabel}>Total Users</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${styles.iconSuccess}`}>
                <UserCheckIcon />
              </div>
            </div>
            <span className={styles.statValue}>1190</span>
            <span className={styles.statLabel}>Active Users</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${styles.iconWarning}`}>
                <HandIcon />
              </div>
            </div>
            <span className={styles.statValue}>12</span>
            <span className={styles.statLabel}>Admin Requests</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${styles.iconDanger}`}>
                <UserMinusIcon />
              </div>
            </div>
            <span className={styles.statValue}>5</span>
            <span className={styles.statLabel}>Blocked Users</span>
          </div>
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
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td style={{ color: '#2563eb', fontWeight: 500 }}>noorfaraz</td>
                  <td>sample@email.com</td>
                  <td>Admin</td>
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
