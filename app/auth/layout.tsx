import React from 'react';
import styles from './auth.module.css';
import Image from 'next/image';

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoGlow} />
          <Image 
            src="/logo.png" 
            alt="SafeCampus Logo" 
            width={180} 
            height={180} 
            className={styles.logo}
            priority
          />
        </div>
        
        <h1 className={styles.brandName}>
          SafeCampus<span className={styles.brandDot}>.</span>
        </h1>
        
        <p className={styles.slogan}>We Guard What Matters Most</p>
        
        <div className={styles.statsGrid}>
          <div className={statCardWithStyles(styles.statCard)}>
            <div className={styles.statIcon}><ShieldIcon/></div>
            <span className={styles.statValue}>1.2M+</span>
            <span className={styles.statLabel}>Active Firewalls</span>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}><EyeOffIcon/></div>
            <span className={styles.statValue}>450</span>
            <span className={styles.statLabel}>Protected Accounts</span>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}><AlertTriangleIcon/></div>
            <span className={styles.statValue}>34</span>
            <span className={styles.statLabel}>Threats Blocked Today</span>
          </div>
        </div>
      </div>
      
      <div className={styles.rightSection}>
        {children}
      </div>
    </div>
  );
}

// Helper to handle multiple classes if needed, though not strictly required here
function statCardWithStyles(className: string) {
    return className;
}
