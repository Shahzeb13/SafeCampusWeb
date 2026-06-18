"use client";

import React, { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import EmergencyAlertSystem from '@/components/EmergencyAlertSystem';
import Loading from './loading';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await auth.getProfile();
        if(profile.role === "super_admin" && pathname === "/dashboard"){
          router.replace("/dashboard/superAdmin")
        }
        else if(profile.role === "organization_owner" && pathname === "/dashboard"){
          router.replace("/dashboard/orgOwner")
        }
        else if(profile.role === "campus_admin" && pathname === "/dashboard"){
          router.replace("/dashboard/campusAdmin");
        }
        setUser(profile);
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);



  const isSuperAdmin = user?.role === 'super_admin';
  const isOrgOwner = user?.role === 'organization_owner';
  const isCampusAdmin = user?.role === "campus_admin"

  const superAdminNavItems = [
    { name: 'Dashboard', path: '/dashboard/superAdmin', icon: <DashboardIcon /> },
    { name: 'Organizations', path: '/dashboard/superAdmin/organizations', icon: <BuildingIcon /> },
    { name: 'Campuses', path: '/dashboard/superAdmin/campuses', icon: <MapPinIcon /> },
    { name: 'Users', path: '/dashboard/superAdmin/users', icon: <UsersIcon /> },
    { name: 'System Health', path: '/dashboard/superAdmin/system-health', icon: <ActivityIcon /> },
    { name: 'Audit Logs', path: '/dashboard/superAdmin/audit-logs', icon: <FileTextIcon /> },
    { name: 'Settings', path: '/dashboard/superAdmin/settings', icon: <SettingsIcon /> },
  ];

  const securityInchargeNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { name: 'Incidents', path: '/dashboard/admin/incidents', icon: <AlertTriangleIcon /> },
    { name: 'SOS Alerts', path: '/dashboard/admin/sos', icon: <SOSIcon /> },
    { name: 'Live Map', path: '/dashboard/admin/map-demo', icon: <MapIcon /> },
    { name: 'Live CCTV', path: '/dashboard/admin/cctv', icon: <CameraIcon /> },
    { name: 'Face Scan', path: '/dashboard/admin/facial-recognition', icon: <FaceIcon /> },
    { name: 'Emergency Contacts', path: '/dashboard/admin/emergency-contacts', icon: <PhoneCallIcon /> },
    { name: 'Security Guards', path: '/dashboard/admin/security-guards', icon: <ShieldGuardIcon /> },
    { name: 'Messages', path: '/dashboard/admin/messages', icon: <ChatIcon /> },
    { name: 'Manage Users', path: '/dashboard/admin/users', icon: <UsersIcon /> },
  ];

  const orgOwnerNavItems = [
    { name: 'Dashboard', path: '/dashboard/orgOwner', icon: <DashboardIcon /> },
    { name: 'Campuses', path: '/dashboard/orgOwner/campuses', icon: <MapPinIcon /> },
    { name: 'Users', path: '/dashboard/orgOwner/users', icon: <UsersIcon /> },
    { name: 'Settings', path: '/dashboard/orgOwner/settings', icon: <SettingsIcon /> },
  ];


 const campusAdminNavItems = [
    { name: 'Dashboard', path: '/dashboard/campusAdmin', icon: <DashboardIcon /> },
    // { name: 'Incidents', path: '/dashboard/admin/incidents', icon: <AlertTriangleIcon /> },
    // { name: 'SOS Alerts', path: '/dashboard/admin/sos', icon: <SOSIcon /> },
    // { name: 'Live Map', path: '/dashboard/campusAdmin/map-demo', icon: <MapIcon /> },
    // { name: 'Live CCTV', path: '/dashboard/campusAdmin/cctv', icon: <CameraIcon /> },
    // { name: 'Face Scan', path: '/dashboard/admin/facial-recognition', icon: <FaceIcon /> },
    // { name: 'Emergency Contacts', path: '/dashboard/campusamin/emergency-contacts', icon: <PhoneCallIcon /> },
    { name: 'Manage Security Personal', path: '/dashboard/campusAdmin/securityPersonal', icon: <ShieldGuardIcon /> },
    // { name: 'Messages', path: '/dashboard/admin/messages', icon: <ChatIcon /> },
    { name: 'Manage Students / Staff', path: '/dashboard/campusAdmin/users', icon: <UsersIcon /> },
  ];


  let navItems = campusAdminNavItems;
  if (isSuperAdmin) {
    navItems = superAdminNavItems;
  } else if (isOrgOwner) {
    navItems = orgOwnerNavItems;
  }
  else if(isCampusAdmin){
    navItems = campusAdminNavItems
  }

  const handleLogout = async () => {
    try {
      await auth.logout();
      router.replace('/auth/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };


  return (
    <>
      {loading && <Loading />}
      
      <div 
        className={styles.dashboardContainer} 
        style={{ display: loading ? 'none' : 'flex' }}
      >
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <div className={styles.logoIcon}>
              <ShieldIcon />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>SafeCampus</span>
              <span className={styles.brandSubtitle}>Security through clarity</span>
            </div> 
          </div>

          <nav className={styles.navMenu}>
            {navItems.map((item) => {
                const isActive = item.path === '/dashboard' || item.path === '/dashboard/superAdmin' || item.path === '/dashboard/orgOwner'
                  ? pathname === item.path
                  : pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
          </nav>
          
          <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid #e4e4e7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: '#71717a' }}>
               <ShieldUserIcon />
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#09090b' }}>{user?.username}</span>
                 <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{isSuperAdmin ? 'Platform Admin' : isOrgOwner ? 'Organization Owner' : 'Campus Admin'}</span>
               </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Link href="#" className={styles.navItem} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                <SupportIcon /> Support
              </Link>
              <button onClick={handleLogout} className={styles.navItem} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px 12px', fontSize: '0.8rem' }}>
                <SignOutIcon /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area (Outlet) */}
        <main className={styles.mainContent}>
          {children}
        </main>

        {/* Global Emergency Listener */}
        <EmergencyAlertSystem />
      </div>
    </>
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

const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="16" />
    <line x1="15" y1="22" x2="15" y2="16" />
    <line x1="9" y1="16" x2="15" y2="16" />
    <path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm8-4h-2v2h2V6zm-2 4h2v2h-2v-2z" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SupportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SignOutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
