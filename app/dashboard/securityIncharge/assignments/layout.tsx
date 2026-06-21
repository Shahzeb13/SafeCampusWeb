"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../../dashboard.module.css';

export default function AssignmentsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const base = '/dashboard/securityIncharge/assignments';

  const tabs = [
    { label: 'My Assignments', href: `${base}` },
    { label: 'Guard Responses', href: `${base}/responses` },
  ];

  return (
    <div>
      <nav className={styles.tabBar} role="navigation" aria-label="Assignments Tabs">
        {tabs.map((t) => {
          const isActive = pathname === t.href || pathname === t.href + '/' || (t.href === base && pathname.startsWith(base) && pathname.split('/').length <= base.split('/').length + 1);
          return (
            <Link key={t.href} href={t.href} className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}>
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div>{children}</div>
    </div>
  );
}
