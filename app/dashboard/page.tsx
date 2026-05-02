"use client";

import React, { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import { sos, incidents as incidentApi } from '@/lib/api';

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
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, resolved: 0, security: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sosRes = await sos.getActive();
        if (sosRes.success) setActiveSOS(sosRes.data);

        const incRes = await incidentApi.getAll();
        const allIncidents = incRes || [];
        
        // Filter for assigned incidents to show in the feed
        const assigned = allIncidents.filter((i: any) => i.assigned_to).slice(0, 10);
        setRecentAssignments(assigned);

        // Calculate stats
        setStats({
          pending: allIncidents.filter((i: any) => i.status === 'pending').length,
          resolved: allIncidents.filter((i: any) => i.status === 'resolved').length,
          security: 15 // Mock or fetch from guards API
        });

      } catch (e) {
        console.error("Dashboard data fetch failed", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
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
          <div className={styles.statCard} style={{ borderColor: activeSOS.length > 0 ? '#ef4444' : '' }}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${activeSOS.length > 0 ? styles.iconDanger : styles.iconSuccess}`}>
                <AlertCircleIcon />
              </div>
            </div>
            <span className={styles.statValue} style={{ color: activeSOS.length > 0 ? '#ef4444' : '' }}>{activeSOS.length}</span>
            <span className={styles.statLabel}>Active SOS ALERTS</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${styles.iconInfo}`}>
                <ShieldUserIcon />
              </div>
            </div>
            <span className={styles.statValue}>{stats.security}</span>
            <span className={styles.statLabel}>Registered Security Guards</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${styles.iconWarning}`}>
                <ClockIcon />
              </div>
            </div>
            <span className={styles.statValue}>{stats.pending}</span>
            <span className={styles.statLabel}>Incidents Pending Dispatch</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.iconBox} ${styles.iconSuccess}`}>
                <CheckCircleIcon />
              </div>
            </div>
            <span className={styles.statValue}>{stats.resolved}</span>
            <span className={styles.statLabel}>Successfully Resolved</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* SOS Reports List */}
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2>🔴 Active Emergencies</h2>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>User</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeSOS.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                      No active distress signals.
                    </td>
                  </tr>
                ) : (
                  activeSOS.map((alert) => (
                    <tr key={alert._id}>
                      <td><span style={{ color: '#ef4444', fontWeight: 'bold' }}>SOS ALARM</span></td>
                      <td>{alert.userId?.username || 'Unknown'}</td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeDanger}`}>
                          {alert.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Security Response Feed */}
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2>🛡️ Security Response Feed</h2>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Guard</th>
                  <th>Incident</th>
                  <th>Response</th>
                </tr>
              </thead>
              <tbody>
                {recentAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                      No recent security assignments.
                    </td>
                  </tr>
                ) : (
                  recentAssignments.map((assignment) => (
                    <tr key={assignment._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{assignment.assigned_to?.username}</div>
                        <div style={{ fontSize: '0.7rem', color: '#71717a' }}>{new Date(assignment.updatedAt).toLocaleTimeString()}</div>
                      </td>
                      <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {assignment.title}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${
                          assignment.assignmentResponse === 'responding' ? styles.badgeSuccess : 
                          assignment.assignmentResponse === 'unavailable' ? styles.badgeDanger : 
                          assignment.assignmentResponse === 'completed' ? styles.badgeSuccess : 
                          styles.badgeWarning
                        }`}>
                          {assignment.assignmentResponse || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
