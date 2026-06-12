"use client";

import React, { useEffect, useState } from 'react';
import styles from '../../dashboard.module.css';
import { sos, securityGuards } from '@/lib/api';
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
  
  // Guard Assignment State
  const [guards, setGuards] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeSOSForAssign, setActiveSOSForAssign] = useState<any | null>(null);
  const [assigningGuardId, setAssigningGuardId] = useState<string | null>(null);

  // Poll for SOS updates every 5 seconds
  useEffect(() => {
    fetchSOS();
    fetchGuards();
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
        // Debounce or just fetch if we haven't or if coordinates shifted significantly
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
           <div style={{ padding: '60px', textAlign: 'center', color: '#a1a1aa' }}>
             <div style={{ animation: 'pulse 1.5s infinite', fontSize: '24px', marginBottom: '16px' }}>📡</div>
             Scanning signals...
           </div>
        )}

        {/* Dynamic Alert Grid */}
        {!loading && activeAlerts.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
               <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 10px #f59e0b', animation: 'pulse 2s infinite' }}></div>
               <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: 600, letterSpacing: '1px' }}>Active SOS Alerts ({activeAlerts.length})</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {activeAlerts.map(alert => {
                 const lat = alert.latestLocation?.latitude || alert.location?.latitude;
                 const lng = alert.latestLocation?.longitude || alert.location?.longitude;
                 
                 return (
                   <div key={alert._id} style={{
                     background: 'rgba(30, 27, 36, 0.8)', // smooth dark pleasing back
                     border: '1px solid rgba(139, 92, 246, 0.2)', // violet border
                     boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
                     borderRadius: '16px',
                     padding: '24px',
                     display: 'flex',
                     flexDirection: 'column',
                     position: 'relative',
                     overflow: 'hidden'
                   }}>
                     {/* Pleasing Indigo Accent Bar */}
                     <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}></div>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                       <div>
                         <h3 style={{ margin: '0 0 4px 0', color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 500 }}>{alert.userId?.username || 'Unknown User'}</h3>
                         <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{alert.userId?.email || 'No email registered'}</span>
                       </div>
                       <select 
                          value={alert.status} 
                          onChange={(e) => handleStatusChange(alert._id, e.target.value)}
                          className={styles.input}
                          style={{
                            padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', width: 'auto',
                            backgroundColor: alert.status === 'active' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                            color: alert.status === 'active' ? '#f59e0b' : '#818cf8',
                            borderColor: alert.status === 'active' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(99, 102, 241, 0.3)'
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
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.85rem' }}>
                          <span style={{ color: '#64748b' }}>Time:</span>
                          <span style={{ color: '#cbd5e1' }}>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                        </div>
                        {lat && lng && (
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.85rem' }}>
                            <span style={{ color: '#64748b' }}>Coords:</span>
                            <span style={{ color: '#cbd5e1', fontFamily: 'Inter, sans-serif' }}>{lat.toFixed(5)}, {lng.toFixed(5)}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                          <span style={{ color: '#64748b' }}>Note:</span>
                          <span style={{ color: '#cbd5e1' }}>{alert.note || 'No notes provided'}</span>
                        </div>
                     </div>

                     <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexWrap: 'wrap' }}>
                       {(lat && lng) ? (
                          <button 
                            onClick={() => openMap(alert)}
                            className={styles.primaryButton}
                            style={{ 
                              flex: 1, 
                              background: 'rgba(255, 255, 255, 0.05)', 
                              color: 'white',
                              fontWeight: 500,
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              padding: '10px'
                            }}
                          >
                            Map
                          </button>
                       ) : (
                          <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>No GPS</div>
                       )}

                       {alert.assigned_to ? (
                         <div style={{ flex: 2, background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase' }}>Guard Dispatched</div>
                            <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{alert.assigned_to.username}</div>
                            {alert.assignmentResponse && (
                              <div style={{ fontSize: '0.7rem', color: alert.assignmentResponse === 'unavailable' ? '#ef4444' : '#cbd5e1', marginTop: '2px' }}>
                                Status: {alert.assignmentResponse}
                                {alert.assignmentResponse === 'unavailable' && (
                                  <span style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: '6px' }} onClick={() => openAssignModal(alert)}>Reassign</span>
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
                              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)', 
                              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                              color: 'white',
                              fontWeight: 500,
                              border: 'none',
                              borderRadius: '8px',
                              padding: '10px'
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
          <div className={styles.tableContainer} style={{ opacity: activeAlerts.length > 0 ? 0.7 : 1 }}>
            <div className={styles.tableHeader} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
              <h2 style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>Incident History (Resolved)</h2>
            </div>
            
            {pastAlerts.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>No historical records found.</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ color: '#64748b' }}>Time</th>
                    <th style={{ color: '#64748b' }}>Contact</th>
                    <th style={{ color: '#64748b' }}>Note</th>
                    <th style={{ color: '#64748b' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastAlerts.map((alert) => (
                    <tr key={alert._id}>
                      <td style={{ color: '#94a3b8' }}>{new Date(alert.createdAt).toLocaleString()}</td>
                      <td>
                        <div style={{ color: '#e2e8f0' }}>{alert.userId?.username || 'Unknown'}</div>
                      </td>
                      <td style={{ color: '#94a3b8' }}>{alert.note || '-'}</td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                          Resolved
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Map Modal Overlay (Pleasing and Immersive) */}
      {selectedMapAlert && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)', // Slate background instead of pure black
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}>
          <div style={{
            width: '95%',
            maxWidth: '1200px',
            backgroundColor: '#1e1e24', 
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid rgba(139, 92, 246, 0.2)', // Indigo glow
            boxShadow: '0 0 40px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              padding: '20px 32px', 
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', fontSize: '24px' }}>📍</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc', fontWeight: 500 }}>Location Interface</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
                    Viewing {selectedMapAlert.userId?.username || 'User'}. Alert status is <span style={{ color: '#a78bfa', fontWeight: '500', textTransform: 'capitalize' }}>{selectedMapAlert.status}</span>.
                  </p>
                </div>
              </div>
              <button 
                onClick={closeMap}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: '#94a3b8',
                  width: '40px', height: '40px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8' }}
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
              />
              
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, background: 'rgba(30, 30, 36, 0.85)', backdropFilter: 'blur(8px)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                 <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Connection Status</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399', animation: 'pulse 2s infinite' }}></div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f1f5f9' }}>Receiving exact GPS feed</span>
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
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px'
        }}>
          <div style={{
            width: '100%', maxWidth: '500px', background: '#09090b', borderRadius: '20px',
            border: '1px solid rgba(139,92,246,0.3)', overflow: 'hidden',
            boxShadow: '0 0 60px rgba(99,102,241,0.15)'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Dispatch Security Guard</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#a1a1aa' }}>Respond to SOS from {activeSOSForAssign?.userId?.username}</p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}
              >✕</button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '16px' }}>
              {guards.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#a1a1aa' }}>
                  <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>🛡️</p>
                  <p style={{ margin: 0 }}>No security personnel registered yet.</p>
                </div>
              ) : (
                guards.map((guard: any) => (
                  <div key={guard._id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px', borderRadius: '12px', marginBottom: '8px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: '#fff', fontSize: '0.9rem'
                      }}>
                        {guard.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.95rem' }}>{guard.username}</div>
                        <div style={{ color: '#71717a', fontSize: '0.8rem' }}>{guard.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignGuard(guard._id)}
                      disabled={assigningGuardId === guard._id}
                      style={{
                        padding: '8px 18px', borderRadius: '8px',
                        background: assigningGuardId === guard._id ? '#333' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                        color: '#fff', border: 'none', cursor: assigningGuardId === guard._id ? 'wait' : 'pointer',
                        fontWeight: 600, fontSize: '0.8rem',
                        boxShadow: '0 2px 8px rgba(239,68,68,0.3)'
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
