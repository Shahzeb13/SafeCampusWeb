"use client";

import React, { useEffect, useState } from 'react';
import styles from '../../dashboard.module.css';
import { securityGuards } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SecurityGuardsPage() {
  const [guards, setGuards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuards();
  }, []);

  const fetchGuards = async () => {
    setLoading(true);
    try {
      const res = await securityGuards.getAll();
      setGuards(res.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to fetch security personnel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Security Personnel</h1>
          <p>Manage and monitor all registered security guards on campus.</p>
        </div>
      </header>

      <div className={styles.scrollableArea}>
        {/* Stats Banner */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))',
            border: '1px solid rgba(99,102,241,0.2)', borderRadius: '16px', padding: '24px',
          }}>
            <div style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Total Guards
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
              {guards.length}
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.08))',
            border: '1px solid rgba(34,197,94,0.2)', borderRadius: '16px', padding: '24px',
          }}>
            <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Registered
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
              {guards.length}
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))',
            border: '1px solid rgba(251,191,36,0.2)', borderRadius: '16px', padding: '24px',
          }}>
            <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Platform
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
              Mobile
            </div>
          </div>
        </div>

        {/* Guards Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>All Security Guards</h2>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#a1a1aa' }}>
              <div style={{ animation: 'pulse 1.5s infinite', fontSize: '24px', marginBottom: '16px' }}>⌛</div>
              Loading personnel roster...
            </div>
          ) : guards.length === 0 ? (
            <div style={{
              padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column',
              alignItems: 'center', background: 'rgba(20, 20, 25, 0.4)'
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '24px', border: '1px solid rgba(139, 92, 246, 0.2)',
                fontSize: '32px'
              }}>
                🛡️
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: '#fff', fontWeight: 600 }}>
                No Security Guards Yet
              </h3>
              <p style={{ margin: 0, color: '#a1a1aa', maxWidth: '350px', lineHeight: 1.5 }}>
                Security personnel can register through the mobile app by selecting the &quot;Security&quot; role,
                or you can create them from the &quot;Manage Users&quot; page.
              </p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Guard</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {guards.map((guard: any) => (
                  <tr key={guard._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 'bold', color: '#fff', fontSize: '0.85rem'
                        }}>
                          {guard.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span style={{ fontWeight: 500, color: '#e4e4e7' }}>{guard.username}</span>
                      </div>
                    </td>
                    <td>{guard.email}</td>
                    <td>{guard.phoneNumber || '—'}</td>
                    <td>{new Date(guard.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
