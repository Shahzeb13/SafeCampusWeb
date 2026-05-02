"use client";

import React, { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import EmergencyAlertSystem from '@/components/EmergencyAlertSystem';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await auth.getProfile();
        if (profile.role !== 'admin') {
          throw new Error('Not an admin');
        }
        setUser(profile);
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { name: 'Incidents', path: '/dashboard/incidents', icon: <AlertTriangleIcon /> },
    { name: 'SOS Alerts', path: '/dashboard/sos', icon: <SOSIcon /> },
    { name: 'Live Map', path: '/dashboard/map-demo', icon: <MapIcon /> },
    { name: 'Live CCTV', path: '/dashboard/cctv', icon: <CameraIcon /> },
    { name: 'Face Scan', path: '/dashboard/facial-recognition', icon: <FaceIcon /> },
    { name: 'Emergency Contacts', path: '/dashboard/emergency-contacts', icon: <PhoneCallIcon /> },
    { name: 'Security Guards', path: '/dashboard/security-guards', icon: <ShieldGuardIcon /> },
    { name: 'Manage Users', path: '/dashboard/users', icon: <UsersIcon /> },
  ];


  const handleLogout = async () => {
    try {
      await auth.logout();
      router.push('/auth/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#09090b', color: '#fff' }}>Loading Admin Panel...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <ShieldIcon />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>SafeCampus</span>
            <span className={styles.brandSubtitle}>Admin Portal</span>
          </div>
        </div>

        <nav className={styles.navMenu}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`${styles.navItem} ${pathname === item.path ? styles.navItemActive : ''}`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#a1a1aa' }}>
             <ShieldUserIcon />
             <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#fff' }}>{user?.username}</span>
               <span style={{ fontSize: '0.75rem' }}>Administrator</span>
             </div>
          </div>
          <button onClick={handleLogout} className={styles.navItem} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area (Outlet) */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* Global Emergency Listener */}
      <EmergencyAlertSystem />
    </div>
  );
}

// Icons
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SOSIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="11" r="3" fill="red" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
)

const MapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
)

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const FaceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    <path d="M17.657 16.657l-1.414 -1.414" />
    <path d="M6.343 16.657l1.414 -1.414" />
    <path d="M9 18h6" />
    <path d="M12 21v-1" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const ShieldUserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="11" r="3" />
  </svg>
);

const PhoneCallIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const ShieldGuardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="10" r="3" />
    <path d="M12 13v3" />
  </svg>
);
