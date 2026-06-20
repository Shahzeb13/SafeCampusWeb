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
            background: '#fff',
            border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Total Guards
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#09090b' }}>
              {guards.length}
            </div>
          </div>
          <div style={{
            background: '#fff',
            border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Registered
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#09090b' }}>
              {guards.length}
            </div>
          </div>
          <div style={{
            background: '#fff',
            border: '1px solid #e4e4e7', borderRadius: '16px', padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Platform
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#09090b' }}>
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
              alignItems: 'center', background: '#fff'
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '24px', border: '1px solid rgba(139, 92, 246, 0.15)',
                fontSize: '32px'
              }}>
                🛡️
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: '#09090b', fontWeight: 600 }}>
                No Security Guards Yet
              </h3>
              <p style={{ margin: 0, color: '#71717a', maxWidth: '350px', lineHeight: 1.5 }}>
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
                        <span style={{ fontWeight: 500, color: '#09090b' }}>{guard.username}</span>
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
