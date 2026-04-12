"use client";

import React, { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import { sos } from '@/lib/api';

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

export default function GeneralDashboard() {
  const [activeSOS, setActiveSOS] = useState<any[]>([]);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await sos.getActive();
        if (res.success) {
          setActiveSOS(res.data);
        }
      } catch (e) {
        console.error("Failed to fetch active SOS", e);
      }
    };
    fetchActive();
    
    const interval = setInterval(fetchActive, 10000); // 10s refresh for dashboard
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>SafeCampus Overview</h1>
          <p>Monitor and manage campus security at a glance</p>
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
          <div className={styles.statCard} style={{ borderColor: activeSOS.length > 0 ? 'red' : '' }}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${activeSOS.length > 0 ? styles.iconDanger : styles.iconSuccess}`}>
                <AlertCircleIcon />
              </div>
            </div>
            <span className={styles.statValue} style={{ color: activeSOS.length > 0 ? 'red' : '' }}>{activeSOS.length}</span>
            <span className={styles.statLabel}>Active SOS ALERTS</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${styles.iconInfo}`}>
                <ShieldUserIcon />
              </div>
            </div>
            <span className={styles.statValue}>15</span>
            <span className={styles.statLabel}>Total Wardens / Staff</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${styles.iconWarning}`}>
                <ClockIcon />
              </div>
            </div>
            {/* Mock Incidents Stats, API missing */}
            <span className={styles.statValue}>12</span>
            <span className={styles.statLabel}>Incidents Under Investigation</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${styles.iconSuccess}`}>
                <CheckCircleIcon />
              </div>
            </div>
            {/* Mock Incidents Stats, API missing */}
            <span className={styles.statValue}>42</span>
            <span className={styles.statLabel}>Resolved Incidents</span>
          </div>
        </div>

        {/* Reports List */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>Active Emergencies Overview</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Emergency Type</th>
                <th>Time Triggered</th>
                <th>User Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeSOS.length === 0 ? (
                <tr>
                   <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                     No Active Emergency Signals at the moment.
                   </td>
                </tr>
              ) : (
                activeSOS.map((alert) => (
                  <tr key={alert._id}>
                    <td><span style={{ color: 'red', fontWeight: 'bold' }}>SOS ALARM</span></td>
                    <td>{new Date(alert.createdAt).toLocaleTimeString()}</td>
                    <td>{alert.userId?.username || 'Unknown'} - {alert.userId?.email}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeDanger}`} style={{ textTransform: 'uppercase' }}>
                        {alert.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
