"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../../dashboard.module.css';
import { sos } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SOSResponsesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchResponses() {
    setLoading(true);
    try {
      const res = await sos.getAll();
      const list = res.success ? (res.data || []).filter((s: any) => s.assignmentResponse) : res?.data || [];
      setData(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch SOS responses');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.scrollableArea}>
      <header className={styles.header} style={{ marginBottom: 12 }}>
        <div className={styles.headerTitle}>
          <h1>SOS Assignment Responses</h1>
          <p>See responses from guards assigned to SOS alerts.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/securityIncharge/sos">
            <button className={styles.primaryButton} style={{ marginRight: 12 }}>Open SOS Console</button>
          </Link>
          <button className={styles.primaryButton} onClick={() => fetchResponses()}>Refresh</button>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2>Recent SOS Responses</h2>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading responses…</div>
        ) : data.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>No SOS responses yet.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SOS</th>
                <th>Guard</th>
                <th>Response</th>
                <th>Note</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((sosItem: any) => (
                <tr key={sosItem._id}>
                  <td style={{ fontWeight: 600 }}>{sosItem.userId?.username || 'User SOS'}</td>
                  <td>{sosItem.assigned_to?.username || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{sosItem.assignmentResponse || '—'}</td>
                  <td style={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sosItem.assignmentNote || '—'}</td>
                  <td>{new Date(sosItem.updatedAt || sosItem.createdAt).toLocaleString()}</td>
                  <td>
                    <Link href={`/dashboard/securityIncharge/sos`}>
                      <button className={styles.primaryButton} style={{ padding: '6px 10px', fontSize: 13 }}>Open Console</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
