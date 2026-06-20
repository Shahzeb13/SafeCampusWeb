import React from 'react';
import styles from '../../dashboard.module.css';

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function SettingsDashboard() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Settings</h1>
          <p>System configuration</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconButton}>
            <BellIcon />
          </button>
        </div>
      </header>

      <div className={styles.scrollableArea}>
        <div style={{ padding: '0 24px 40px 24px' }}>
          <div className={styles.tableContainer} style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.05rem', color: '#09090b', fontWeight: 700, marginBottom: '8px' }}>System Settings</h2>
            <p style={{ color: '#71717a', fontSize: '0.88rem', margin: 0 }}>Settings configuration page coming soon.</p>
          </div>
        </div>
      </div>
    </>
  );
}
