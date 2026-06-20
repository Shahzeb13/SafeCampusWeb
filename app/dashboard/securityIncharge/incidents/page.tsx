"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../dashboard.module.css';
import { incidents } from '@/lib/api';
import toast from 'react-hot-toast';

const INCIDENT_TYPES = [
  "all",
  "theft",
  "property_damage",
  "harassment",
  "fighting",
  "drug_alcohol",
  "unauthorized_access",
  "cyber_incident",
  "fire_emergency",
  "medical_emergency",
  "suspicious_activity",
  "other"
];

export default function IncidentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchIncidents();
  }, [filterType]); // Refetch when filter changes

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      // Passes 'all' or specific type to the /api/incidents endpoint
      const res = await incidents.getAll(filterType);
      setData(res); // backend returns an array directly because we used res.status(200).json(incidents)
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Global Incidents</h1>
          <p>Monitor resolved and pending incidents reported by students/staff.</p>
        </div>
      </header>

      <div className={styles.scrollableArea}>
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>Incidents List</h2>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Filter by Type:</span>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.input}
                style={{ padding: '8px 12px', minWidth: '180px', borderRadius: '8px' }}
              >
                {INCIDENT_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
             <div style={{ padding: '60px', textAlign: 'center', color: '#a1a1aa' }}>
               <div style={{ animation: 'pulse 1.5s infinite', fontSize: '24px', marginBottom: '16px' }}>⌛</div>
               Loading incidents...
             </div>
          ) : data.length === 0 ? (
             <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff' }}>
               <div style={{ 
                 width: '80px', height: '80px', 
                 borderRadius: '50%', 
                 background: 'rgba(22, 163, 74, 0.08)', 
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 marginBottom: '24px', border: '1px solid rgba(74, 222, 128, 0.2)'
               }}>
                 <span style={{ fontSize: '32px' }}>✨</span>
               </div>
               <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: '#09090b', fontWeight: 600 }}>Coast is clear!</h3>
               <p style={{ margin: 0, color: '#71717a', maxWidth: '300px', lineHeight: 1.5 }}>
                 {filterType === 'all' 
                   ? "There are absolutely no incidents currently reported in your database. Good job keeping the campus safe!" 
                   : `There are currently no incidents matching the "${filterType.replace(/_/g, ' ')}" category.`}
               </p>
             </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Reporter</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {data.map((incident: any) => (
                  <tr key={incident._id}>
                    <td style={{ fontWeight: 500, color: '#09090b', textTransform: 'capitalize' }}>
                      {incident.incidentType?.replace(/_/g, ' ')}
                    </td>
                    <td>{incident.locationText || 'No location given'}</td>
                    <td>
                      <div><strong>{incident.reporter_id?.username || 'Unknown'}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{incident.reporter_id?.email || 'N/A'}</div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${incident.status === 'resolved' ? styles.badgeSuccess : incident.status === 'pending' ? styles.badgeWarning : styles.badgeInfo}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td>{new Date(incident.createdAt).toLocaleDateString()} at {new Date(incident.createdAt).toLocaleTimeString()}</td>
                    <td>
                      <Link href={`/dashboard/securityIncharge/incidents/${incident._id}`}>
                        <button className={styles.primaryButton} style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>View Dossier</button>
                      </Link>
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
