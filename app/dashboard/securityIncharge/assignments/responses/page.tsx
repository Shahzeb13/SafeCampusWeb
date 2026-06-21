"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../../dashboard.module.css';
import { incidents } from '@/lib/api';
import toast from 'react-hot-toast';

export default function GuardResponsesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchResponses() {
    setLoading(true);
    try {
      const res = await incidents.getAssignmentResponses();
      const list = Array.isArray(res) ? res : res?.data || [];
      setData(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch assignment responses');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.scrollableArea}>
      <header className={styles.header} style={{ marginBottom: 12 }}>
        <div className={styles.headerTitle}>
          <h1>Guard Responses</h1>
          <p>Responses by on-duty security personnel (responding/unavailable/completed)</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/securityIncharge/incidents">
            <button className={styles.primaryButton} style={{ marginRight: 12 }}>← Back to Incidents</button>
          </Link>
          <button className={styles.primaryButton} onClick={() => fetchResponses()}>Refresh</button>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2>Recent Assignment Responses</h2>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading responses…</div>
        ) : data.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>No responses yet.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Incident</th>
                <th>Guard</th>
                <th>Response</th>
                <th>Note</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((inc: any) => (
                <tr key={inc._id}>
                  <td style={{ fontWeight: 600 }}>{inc.title || 'Untitled'}</td>
                  <td>{inc.assigned_to?.username || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{inc.assignmentResponse || '—'}</td>
                  <td style={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inc.assignmentNote || '—'}</td>
                  <td>{new Date(inc.updatedAt || inc.createdAt).toLocaleString()}</td>
                  <td>
                    <Link href={`/dashboard/securityIncharge/incidents/${inc._id}`}>
                      <button className={styles.primaryButton} style={{ padding: '6px 10px', fontSize: 13 }}>View Dossier</button>
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
