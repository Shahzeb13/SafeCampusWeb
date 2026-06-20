"use client";

import React, { useEffect, useState } from 'react';
import styles from '../../dashboard.module.css';
import { sos, securityGuards, auth, campuses } from '@/lib/api';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { MapMarker } from '@/components/Map/types';

// Import our dynamic map component securely bypassing SSR
const MapView = dynamic(() => import('@/components/Map'), { ssr: false });

export default function SOSPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMapAlert, setSelectedMapAlert] = useState<any | null>(null);
  const [geocodedAddress, setGeocodedAddress] = useState<string>("");
  const [campusData, setCampusData] = useState<any>(null);
  
  // Guard Assignment State
  const [guards, setGuards] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeSOSForAssign, setActiveSOSForAssign] = useState<any | null>(null);
  const [assigningGuardId, setAssigningGuardId] = useState<string | null>(null);

  // Poll for SOS updates every 5 seconds
  useEffect(() => {
    const initPage = async () => {
      try {
        const profile = await auth.getProfile();
        if (profile.campusId) {
          const campId = typeof profile.campusId === 'object' ? profile.campusId._id || profile.campusId.id : profile.campusId;
          if (campId) {
            const campRes = await campuses.getById(campId);
            if (campRes.success && campRes.data) {
              setCampusData(campRes.data);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load profile or campus data", err);
      }
      fetchSOS();
      fetchGuards();
    };

    initPage();
    const interval = setInterval(() => {
      fetchSOS(false);
    }, 100000);
    return () => clearInterval(interval);
  }, []);

  const fetchGuards = async () => {
    try {
      const res = await securityGuards.getAll();
      if (res.success) {
        setGuards(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch guards", error);
    }
  };

  // Sync selected map alert with live polling data if it belongs to the active modal
  useEffect(() => {
    if (selectedMapAlert) {
      const updatedAlert = alerts.find(a => a._id === selectedMapAlert._id);
      if (updatedAlert) {
        setSelectedMapAlert(updatedAlert);
      }
    }
  }, [alerts]);

  // Reverse geocode the location when the modal opens or the coordinates actively change
  useEffect(() => {
    if (selectedMapAlert) {
      const lat = selectedMapAlert.latestLocation?.latitude || selectedMapAlert.location?.latitude;
      const lng = selectedMapAlert.latestLocation?.longitude || selectedMapAlert.location?.longitude;
      
      if (lat && lng) {
        setGeocodedAddress("Sourcing real address via GPS...");
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(res => res.json())
          .then(data => {
             if (data && data.display_name) {
               setGeocodedAddress(data.display_name);
             } else {
               setGeocodedAddress("Could not determine street level address.");
             }
          })
          .catch(() => setGeocodedAddress("Offline / Failed to fetch address data"));
      }
    } else {
      setGeocodedAddress("");
    }
  }, [
    selectedMapAlert?._id, 
    selectedMapAlert?.latestLocation?.latitude, 
    selectedMapAlert?.latestLocation?.longitude
  ]);

  const fetchSOS = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await sos.getAll();
      if (res.success) {
        setAlerts(res.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch SOS alerts', error);
      if (showLoading) toast.error('Failed to fetch SOS alerts');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    let reason = '';
    if (newStatus === 'rejected') {
      const input = window.prompt("Please provide a reason for rejection (optional):");
      if (input === null) return; // User cancelled
      reason = input;
    }

    try {
      const res = await sos.updateStatus(id, newStatus, reason || undefined);
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchSOS(false);
      }
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleAssignGuard = async (guardId: string) => {
    if (!activeSOSForAssign) return;
    setAssigningGuardId(guardId);
    try {
      const res = await sos.assignGuard(activeSOSForAssign._id, guardId);
      if (res.success) {
        toast.success('Guard dispatched successfully! Notifications sent.');
        setShowAssignModal(false);
        fetchSOS(false);
      } else {
        toast.error(res.message || 'Failed to dispatch guard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to dispatch guard');
    } finally {
      setAssigningGuardId(null);
    }
  };

  const openAssignModal = (alert: any) => {
    setActiveSOSForAssign(alert);
    setShowAssignModal(true);
  };

  const openMap = (alert: any) => {
    setSelectedMapAlert(alert);
  };

  const closeMap = () => {
    setSelectedMapAlert(null);
  };

  const getMapMarkerData = (): MapMarker[] => {
    if (!selectedMapAlert) return [];
    
    const lat = selectedMapAlert.latestLocation?.latitude || selectedMapAlert.location?.latitude;
    const lng = selectedMapAlert.latestLocation?.longitude || selectedMapAlert.location?.longitude;
    
    if (!lat || !lng) return [];

    return [{
      id: selectedMapAlert._id,
      latitude: lat,
      longitude: lng,
      title: `${selectedMapAlert.userId?.username || 'User'} Emergency`,
      description: selectedMapAlert.note || 'Active SOS Triggered',
      type: 'sos',
      status: selectedMapAlert.status,
      time: new Date(selectedMapAlert.createdAt).toLocaleString(),
      locationDetails: geocodedAddress || 'Locating...'
    }];
  };

  const activeAlerts = alerts.filter(a => a.status !== 'resolved');
  const pastAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>SOS Command Center</h1>
          <p>Real-time emergency tracking and deployment.</p>
        </div>
      </header>

      <div className={styles.scrollableArea}>

        {/* Global Loading State */}
        {loading && alerts.length === 0 && (
           <div style={{ padding: '60px', textAlign: 'center', color: '#71717a' }}>
             <div style={{ fontSize: '24px', marginBottom: '16px' }}>📡</div>
             Scanning signals...
           </div>
        )}

        {/* Dynamic Alert Grid */}
        {!loading && activeAlerts.length > 0 && (
          <div style={{ padding: '0 24px 24px 24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
               <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626', boxShadow: '0 0 8px #dc2626', animation: 'pulse 2s infinite' }}></div>
               <h2 style={{ margin: 0, fontSize: '1.05rem', color: '#09090b', fontWeight: 700 }}>Active SOS Alerts ({activeAlerts.length})</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {activeAlerts.map(alert => {
                 const lat = alert.latestLocation?.latitude || alert.location?.latitude;
                 const lng = alert.latestLocation?.longitude || alert.location?.longitude;
                 
                 return (
                   <div key={alert._id} style={{
                     background: '#fff',
                     border: '1px solid #e4e4e7',
                     boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                     borderRadius: '12px',
                     padding: '20px',
                     display: 'flex',
                     flexDirection: 'column',
                     position: 'relative',
                     overflow: 'hidden'
                   }}>
                     <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#dc2626' }}></div>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                       <div>
                         <h3 style={{ margin: '0 0 2px 0', color: '#09090b', fontSize: '0.95rem', fontWeight: 700 }}>{alert.userId?.username || 'Unknown User'}</h3>
                         <span style={{ color: '#71717a', fontSize: '0.78rem' }}>{alert.userId?.email || 'No email registered'}</span>
                       </div>
                       <select 
                          value={alert.status} 
                          onChange={(e) => handleStatusChange(alert._id, e.target.value)}
                          className={styles.input}
                          style={{
                            padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', width: 'auto',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            borderColor: '#fee2e2'
                          }}
                        >
                          <option value="active">Active</option>
                          <option value="acknowledged">Acknowledged</option>
                          <option value="responding">Responding</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                     </div>

                     <div style={{ marginBottom: '16px', flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '0.82rem' }}>
                          <span style={{ color: '#71717a', fontWeight: 500 }}>Time:</span>
                          <span style={{ color: '#09090b' }}>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                        </div>
                        {lat && lng && (
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '0.82rem' }}>
                            <span style={{ color: '#71717a', fontWeight: 500 }}>Coords:</span>
                            <span style={{ color: '#09090b', fontFamily: 'monospace' }}>{lat.toFixed(5)}, {lng.toFixed(5)}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.82rem' }}>
                          <span style={{ color: '#71717a', fontWeight: 500 }}>Note:</span>
                          <span style={{ color: '#09090b' }}>{alert.note || 'No notes provided'}</span>
                        </div>
                     </div>

                     <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexWrap: 'wrap' }}>
                       {(lat && lng) ? (
                           <button 
                             onClick={() => openMap(alert)}
                             className={styles.primaryButton}
                             style={{ 
                               flex: 1, 
                               background: '#fff', 
                               color: '#09090b',
                               fontWeight: 600,
                               border: '1px solid #e4e4e7',
                               borderRadius: '8px',
                               padding: '8px 12px',
                               fontSize: '0.82rem'
                             }}
                           >
                             Map
                           </button>
                       ) : (
                           <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#f4f4f5', borderRadius: '8px', fontSize: '0.8rem', color: '#71717a', border: '1px solid #e4e4e7' }}>No GPS</div>
                       )}

                       {alert.assigned_to ? (
                          <div style={{ flex: 2, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '6px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                             <div style={{ fontSize: '0.68rem', color: '#16a34a', textTransform: 'uppercase', fontWeight: 700 }}>Guard Dispatched</div>
                             <div style={{ fontSize: '0.82rem', color: '#09090b', fontWeight: 600 }}>{alert.assigned_to.username}</div>
                             {alert.assignmentResponse && (
                               <div style={{ fontSize: '0.68rem', color: alert.assignmentResponse === 'unavailable' ? '#ef4444' : '#71717a', marginTop: '2px' }}>
                                 Status: {alert.assignmentResponse}
                                 {alert.assignmentResponse === 'unavailable' && (
                                   <span style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: '6px', fontWeight: 600 }} onClick={() => openAssignModal(alert)}>Reassign</span>
                                 )}
                               </div>
                             )}
                          </div>
                       ) : (
                          <button 
                             onClick={() => openAssignModal(alert)}
                             className={styles.primaryButton}
                             style={{ 
                               flex: 2, 
                               background: '#0052cc', 
                               color: 'white',
                               fontWeight: 600,
                               border: 'none',
                               borderRadius: '8px',
                               padding: '8px 12px',
                               fontSize: '0.82rem'
                             }}
                           >
                             🛡️ Dispatch Guard
                           </button>
                       )}
                     </div>
                   </div>
                 );
              })}
            </div>
          </div>
        )}

        {/* Minimalist Resolved History Table */}
        {!loading && (
          <div style={{ padding: '0 24px 40px 24px' }}>
            <div className={styles.tableContainer} style={{ opacity: activeAlerts.length > 0 ? 0.85 : 1 }}>
              <div className={styles.tableHeader}>
                <h2>Incident History (Resolved)</h2>
              </div>
              
              {pastAlerts.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#71717a', fontSize: '0.9rem' }}>No historical records found.</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Contact</th>
                      <th>Note</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastAlerts.map((alert) => (
                      <tr key={alert._id}>
                        <td>{new Date(alert.createdAt).toLocaleString()}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#09090b' }}>{alert.userId?.username || 'Unknown'}</div>
                        </td>
                        <td>{alert.note || '-'}</td>
                        <td>
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                            Resolved
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map Modal Overlay */}
      {selectedMapAlert && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(9, 9, 11, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}>
          <div style={{
            width: '95%',
            maxWidth: '1200px',
            backgroundColor: '#fff', 
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #e4e4e7',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              padding: '16px 24px', 
              borderBottom: '1px solid #e4e4e7',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fafafa'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontSize: '20px', border: '1px solid #fee2e2' }}>📍</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#09090b', fontWeight: 700 }}>Location Interface</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#71717a' }}>
                    Viewing {selectedMapAlert.userId?.username || 'User'}. Alert status is <span style={{ color: '#dc2626', fontWeight: 600, textTransform: 'capitalize' }}>{selectedMapAlert.status}</span>.
                  </p>
                </div>
              </div>
              <button 
                onClick={closeMap}
                style={{
                  background: '#fff',
                  border: '1px solid #e4e4e7',
                  color: '#71717a',
                  width: '36px', height: '36px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.15s'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ height: '650px', width: '100%', position: 'relative' }}>
              <MapView 
                center={[
                  selectedMapAlert.latestLocation?.latitude || selectedMapAlert.location?.latitude || 0, 
                  selectedMapAlert.latestLocation?.longitude || selectedMapAlert.location?.longitude || 0
                ]} 
                zoom={16} 
                markers={getMapMarkerData()} 
                geofenceRadius={campusData?.allowedRadiusMeters ?? 1000}
                geofenceCenter={[
                  campusData?.location?.latitude ?? 31.5204,
                  campusData?.location?.longitude ?? 74.3587
                ]}
              />

              
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e4e4e7', color: '#09090b', pointerEvents: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                 <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Connection Status</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 6px #16a34a', animation: 'pulse 2s infinite' }}></div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#09090b' }}>Receiving GPS telemetry</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guard Selection Modal */}
      {showAssignModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          background: 'rgba(9, 9, 11, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            width: '100%', maxWidth: '480px', background: '#fff', borderRadius: '16px',
            border: '1px solid #e4e4e7', overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1rem', color: '#09090b', fontWeight: 700 }}>Dispatch Security Guard</h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#71717a' }}>Respond to SOS from {activeSOSForAssign?.userId?.username}</p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{ background: '#fff', border: '1px solid #e4e4e7', color: '#71717a', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '16px 20px' }}>
              {guards.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: '#71717a' }}>
                  <p style={{ fontSize: '24px', margin: '0 0 8px' }}>🛡️</p>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>No security personnel registered yet.</p>
                </div>
              ) : (
                guards.map((guard: any) => (
                  <div key={guard._id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px', borderRadius: '8px', marginBottom: '8px',
                    background: '#fafafa', border: '1px solid #e4e4e7',
                    transition: 'all 0.15s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: '#e0e7ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: '#0052cc', fontSize: '0.85rem'
                      }}>
                        {guard.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ color: '#09090b', fontWeight: 600, fontSize: '0.88rem' }}>{guard.username}</div>
                        <div style={{ color: '#71717a', fontSize: '0.78rem' }}>{guard.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignGuard(guard._id)}
                      disabled={assigningGuardId === guard._id}
                      style={{
                        padding: '6px 14px', borderRadius: '6px',
                        background: assigningGuardId === guard._id ? '#e4e4e7' : '#dc2626',
                        color: assigningGuardId === guard._id ? '#a1a1aa' : '#fff', 
                        border: 'none', 
                        cursor: assigningGuardId === guard._id ? 'wait' : 'pointer',
                        fontWeight: 600, fontSize: '0.78rem'
                      }}
                    >
                      {assigningGuardId === guard._id ? 'Deploying...' : 'Dispatch'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
