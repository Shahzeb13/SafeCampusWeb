import React from 'react';
import styles from './dashboard.module.css';

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ShieldUserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="11" r="3" />
  </svg>
);

export default function IncidentsDashboard() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Incident Dashboard</h1>
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
              <div className={`${styles.iconBox} ${styles.iconSuccess}`}>
                <CheckCircleIcon />
              </div>
            </div>
            <span className={styles.statValue}>42</span>
            <span className={styles.statLabel}>Resolved Cases</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${styles.iconWarning}`}>
                <ClockIcon />
              </div>
            </div>
            <span className={styles.statValue}>12</span>
            <span className={styles.statLabel}>Under Investigation</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${styles.iconDanger}`}>
                <AlertCircleIcon />
              </div>
            </div>
            <span className={styles.statValue}>5</span>
            <span className={styles.statLabel}>Active Incidents</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${styles.iconInfo}`}>
                <ShieldUserIcon />
              </div>
            </div>
            <span className={styles.statValue}>8</span>
            <span className={styles.statLabel}>Security Personnel</span>
          </div>
        </div>

        {/* Reports List */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>Reports Lists</h2>
            <input 
              type="text" 
              placeholder="Search Report" 
              className={styles.searchInput}
            />
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Location</th>
                <th>Reporter</th>
                <th>Time</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: '#2563eb', fontWeight: 500 }}>#A1025</td>
                <td>Incident</td>
                <td>Office 2B</td>
                <td>Fatima S</td>
                <td>8 hours ago</td>
                <td><span className={`${styles.badge} ${styles.badgeInfo}`}>Low</span></td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Resolved</span></td>
                <td><button className={styles.rowAction}>⋮</button></td>
              </tr>
              <tr>
                <td style={{ color: '#2563eb', fontWeight: 500 }}>#A1026</td>
                <td>Incident</td>
                <td>Cafeteria</td>
                <td>Ahmed R</td>
                <td>8 hours ago</td>
                <td><span className={`${styles.badge} ${styles.badgeWarning}`}>Medium</span></td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Resolved</span></td>
                <td><button className={styles.rowAction}>⋮</button></td>
              </tr>
              <tr>
                <td style={{ color: '#2563eb', fontWeight: 500 }}>#A1027</td>
                <td>Request</td>
                <td>Reception</td>
                <td>Mike D</td>
                <td>5 hours ago</td>
                <td><span className={`${styles.badge} ${styles.badgeInfo}`}>Low</span></td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Resolved</span></td>
                <td><button className={styles.rowAction}>⋮</button></td>
              </tr>
              <tr>
                <td style={{ color: '#2563eb', fontWeight: 500 }}>#A1028</td>
                <td>Maintenance</td>
                <td>Office 2B</td>
                <td>Sarah J</td>
                <td>1 hours ago</td>
                <td><span className={`${styles.badge} ${styles.badgeWarning}`}>Medium</span></td>
                <td><span className={`${styles.badge} ${styles.badgeInfo}`}>Investigating</span></td>
                <td><button className={styles.rowAction}>⋮</button></td>
              </tr>
              <tr>
                <td style={{ color: '#2563eb', fontWeight: 500 }}>#A1029</td>
                <td>Maintenance</td>
                <td>Reception</td>
                <td>Zara B</td>
                <td>3 hours ago</td>
                <td><span className={`${styles.badge} ${styles.badgeDanger}`}>High</span></td>
                <td><span className={`${styles.badge} ${styles.badgeInfo}`}>Investigating</span></td>
                <td><button className={styles.rowAction}>⋮</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
