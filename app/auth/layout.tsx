import React from 'react';
import styles from './auth.module.css';

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      {/* LEFT — Brand Panel */}
      <div className={styles.leftSection}>
        {/* Brand Mark */}
        <div className={styles.logoWrapper}>
          <div className={styles.logoGlow}>
            <ShieldIcon />
          </div>
          <div className={styles.brandWordmark}>
            <h2 className={styles.brandName}>SafeCampus<span className={styles.brandDot}>.</span></h2>
            <span className={styles.brandTag}>Admin Command Center</span>
          </div>
        </div>

        {/* Hero Headline */}
        <div className={styles.heroBlock}>
          <h1 className={styles.slogan}>
            Security through<br />Clarity.
          </h1>
          <p className={styles.sloganSub}>
            A unified platform for managing campus security, incidents, and real-time coordination across your entire organization.
          </p>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <MapPinIcon />
            </div>
            <span className={styles.statValue}>24</span>
            <span className={styles.statLabel}>Active Campuses</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <ShieldCheckIcon />
            </div>
            <span className={styles.statValue}>8.4k+</span>
            <span className={styles.statLabel}>Protected Users</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <ActivityIcon />
            </div>
            <span className={styles.statValue}>99.9%</span>
            <span className={styles.statLabel}>System Uptime</span>
          </div>
        </div>
      </div>

      {/* RIGHT — Form Panel */}
      <div className={styles.rightSection}>
        {children}
      </div>
    </div>
  );
}
