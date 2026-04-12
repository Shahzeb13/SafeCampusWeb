"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { incidents } from '@/lib/api';
import toast from 'react-hot-toast';
import styles from '../../dashboard.module.css';
import dynamic from 'next/dynamic';
import { MapMarker } from '@/components/Map/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MapView = dynamic(() => import('@/components/Map'), { ssr: false });

export default function IncidentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanningImage, setScanningImage] = useState<string | null>(null);

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const data = await incidents.getById(id);
      setIncident(data);
    } catch (err) {
      toast.error("Failed to load incident details");
      router.push('/dashboard/incidents');
    } finally {
      setLoading(false);
    }
  };

  const getMapData = (): MapMarker[] => {
    if (!incident || !incident.latitude || !incident.longitude) return [];
    return [{
      id: incident._id,
      latitude: incident.latitude,
      longitude: incident.longitude,
      title: incident.incidentType ? incident.incidentType.replace(/_/g, ' ').toUpperCase() : 'Incident',
      type: 'incident',
      status: incident.status,
    }];
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text('SafeCampus Incident Report', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text(`Incident ID: ${incident._id}`, 14, 45);
      doc.text(`Title: ${incident.title}`, 14, 53);
      doc.text(`Type: ${incident.incidentType?.replace(/_/g, ' ').toUpperCase() || 'General'}`, 14, 61);
      doc.text(`Status: ${incident.status.toUpperCase()}`, 14, 69);
      doc.text(`Reported At: ${new Date(incident.createdAt).toLocaleString()}`, 14, 77);
      
      doc.setFontSize(15);
      doc.setTextColor(0, 0, 0);
      doc.text('Reporter Identity', 14, 90);
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text(`Name: ${incident.reporter_id?.username || 'Unknown'}`, 14, 98);
      doc.text(`Email: ${incident.reporter_id?.email || 'N/A'}`, 14, 106);
      doc.text(`Role: ${(incident.reporter_role || 'Unknown').toUpperCase()}`, 14, 114);

      doc.setFontSize(15);
      doc.setTextColor(0, 0, 0);
      doc.text('Geographical Data', 14, 127);
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      const locText = doc.splitTextToSize(`Location: ${incident.locationText || 'No physical location specified'}`, 180);
      doc.text(locText, 14, 135);
      let nextY = 135 + (locText.length * 6);
      if (incident.latitude && incident.longitude) {
         doc.text(`GPS Coordinates: ${incident.latitude.toFixed(6)}, ${incident.longitude.toFixed(6)}`, 14, nextY);
         nextY += 8;
      }

      doc.setFontSize(15);
      doc.setTextColor(0, 0, 0);
      doc.text('Incident Abstract', 14, nextY + 8);
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      const splitDesc = doc.splitTextToSize(incident.description || 'No detailed description provided.', 180);
      doc.text(splitDesc, 14, nextY + 16);
      
      nextY = nextY + 16 + (splitDesc.length * 5) + 10;

      const mediaRows: string[][] = [];
      if (incident.images && incident.images.length > 0) {
        incident.images.forEach((img: any, i: number) => {
          mediaRows.push([`Photograph ${i + 1}`, img.url]);
        });
      }
      if (incident.video && incident.video.url) {
        mediaRows.push(['Video Footage', incident.video.url]);
      }
      if (incident.audio && incident.audio.url) {
        mediaRows.push([`Voice Note (${incident.voiceDuration || 'Unknown duration'})`, incident.audio.url]);
      }

      if (mediaRows.length > 0) {
        autoTable(doc, {
          startY: nextY,
          head: [['Evidence Type', 'Cloudinary Secure Link']],
          body: mediaRows,
          theme: 'grid',
          headStyles: { fillColor: [99, 102, 241] },
          styles: { fontSize: 9, overflow: 'linebreak', cellWidth: 'wrap' },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 140 }
          }
        });
      } else {
        doc.setFontSize(12);
        doc.text('No digital media assets attached to this report.', 14, nextY);
      }

      doc.save(`SafeCampus_Dossier_${incident._id}.pdf`);
      toast.success('Official PDF Report Generated!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to generate PDF document');
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
        <div style={{ animation: 'spin 2s linear infinite', fontSize: '3rem' }}>⚙️</div>
        <h2 style={{ marginLeft: '1rem' }}>Decrypting Incident Files...</h2>
      </div>
    );
  }

  if (!incident) return null;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => router.back()} 
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ←
          </button>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              Incident Dossier 
              <span className={`${styles.badge} ${incident.status === 'resolved' ? styles.badgeSuccess : incident.status === 'pending' ? styles.badgeWarning : styles.badgeInfo}`}>
                {incident.status}
              </span>
            </h1>
            <p>Cryptographic ID: {incident._id}</p>
          </div>
        </div>
        <button 
           onClick={generatePDF}
           style={{
             background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
             color: '#fff',
             border: 'none',
             borderRadius: '8px',
             padding: '10px 20px',
             fontSize: '0.9rem',
             fontWeight: 600,
             cursor: 'pointer',
             boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
             display: 'flex',
             alignItems: 'center',
             gap: '8px'
           }}
        >
          <span>📄</span> Export to PDF
        </button>
      </header>

      <div className={styles.scrollableArea}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', paddingBottom: '40px' }}>
          
          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Overview Card */}
            <div style={{ background: '#09090b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px' }}>
               <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#fff', margin: '0 0 12px 0', textTransform: 'capitalize' }}>
                 {incident.title}
               </h2>
               <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                 <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                   {incident.incidentType?.replace(/_/g, ' ')}
                 </span>
                 <span style={{ color: '#71717a', fontSize: '0.8rem' }}>
                   {new Date(incident.createdAt).toLocaleString()}
                 </span>
               </div>
               
               <p style={{ color: '#d4d4d8', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                 {incident.description}
               </p>
            </div>

            {/* Automated Analysis Section */}
            <div style={{ background: '#09090b', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ position: 'relative' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#fff', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Automated Threat Intelligence
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                   <div style={{ background: '#0c0c0e', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ fontSize: '0.65rem', color: '#71717a', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>Urgency Level</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: incident.incidentType === 'medical_emergency' || incident.description?.toLowerCase().includes('weapon') ? '#ef4444' : '#fbbf24' }}>
                         {incident.incidentType === 'medical_emergency' || incident.description?.toLowerCase().includes('weapon') ? 'CRITICAL' : 'ELEVATED'}
                      </div>
                   </div>
                   <div style={{ background: '#0c0c0e', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ fontSize: '0.65rem', color: '#71717a', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>Recommended Protocol</div>
                      <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '500' }}>
                         {incident.incidentType === 'medical_emergency' ? 'Dispatch EMS Unit 4' : 'Secure Perimeter'}
                      </div>
                   </div>
                </div>

                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', borderLeft: '2px solid #fff' }}>
                   <div style={{ fontSize: '0.85rem', color: '#a1a1aa', lineHeight: '1.5' }}>
                     Detection system identifies a potential <strong>{incident.incidentType?.replace(/_/g, ' ')}</strong> cluster at current coordinates. 
                     Standard security protocols suggest immediate verification by campus personnel.
                   </div>
                </div>
              </div>
            </div>

            {/* Media Evidence Gallery (existing) */}
            <div style={{ background: 'rgba(30, 27, 36, 0.8)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📁</span> Attached Evidence
              </h3>

              {!incident.images?.length && !incident.video && !incident.audio ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  No media files were attached to this report.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Images Section */}
                  {incident.images && incident.images.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Photographs</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                        {incident.images.map((img: any, i: number) => (
                           <div 
                             key={i} 
                             className="media-item"
                             style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '1/1' }}
                           >
                             <img src={img.url} alt="Incident Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                             
                             {/* Sleek Hover Overlay */}
                             <div className="media-overlay" onClick={() => setScanningImage(img.url)}>
                                <span style={{ fontSize: '20px' }}>👁️‍🗨️</span>
                                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>SCAN FACE ID</span>
                             </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Section */}
                  {incident.video && incident.video.url && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Video Footage</h4>
                      <div 
                        className="media-item" 
                        style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#000' }}
                      >
                        <video controls style={{ width: '100%', maxHeight: '400px' }} preload="metadata">
                          <source src={incident.video.url} type={incident.video.url.includes('.mov') ? 'video/mp4' : 'video/mp4'} />
                        </video>
                        
                        {/* Video Scan Trigger */}
                        <div 
                          className="media-overlay" 
                          style={{ top: 0, left: 0, height: '40px', bottom: 'auto', background: 'rgba(99, 102, 241, 0.9)' }}
                          onClick={() => setScanningImage(incident.video.url)}
                        >
                           <span style={{ fontSize: '14px' }}>🛡️</span>
                           <span style={{ fontSize: '10px', fontWeight: 'bold' }}>ANALYZE BIOMETRIC STREAM</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <style>{`
                    .media-item { position: relative; cursor: pointer; transition: all 0.3s; }
                    .media-overlay {
                      position: absolute;
                      top: 0; left: 0; right: 0; bottom: 0;
                      background: rgba(99, 102, 241, 0.8);
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      gap: 8px;
                      opacity: 0;
                      transition: all 0.3s;
                      color: #fff;
                      z-index: 5;
                    }
                    .media-item:hover .media-overlay { opacity: 1; }
                  `}</style>

                  {/* Audio Section */}
                  {incident.audio && incident.audio.url && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Voice Note Recording {incident.voiceDuration && `(${incident.voiceDuration})`}</h4>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}>
                        <audio controls style={{ width: '100%' }}>
                          <source src={incident.audio.url} type="audio/mpeg" />
                          <source src={incident.audio.url} type="audio/mp4" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Neural Scan Modal Overlay */}
            {scanningImage && (
              <div style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, 
                background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px'
              }}>
                <div style={{ 
                   width: '100%', maxWidth: '1000px', height: '80vh', background: '#09090b', borderRadius: '24px', 
                   border: '1px solid #6366f1', overflow: 'hidden', display: 'flex', position: 'relative',
                   boxShadow: '0 0 100px rgba(99, 102, 241, 0.2)' 
                }}>
                   <button 
                     onClick={() => setScanningImage(null)}
                     style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1010, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}
                   >
                     ✕
                   </button>

                   <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {scanningImage.includes('.mp4') || scanningImage.includes('.mov') ? (
                         <video autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.6 }}>
                           <source src={scanningImage} type="video/mp4" />
                         </video>
                      ) : (
                         <img src={scanningImage} alt="Scan Target" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.6 }} />
                      )}
                      
                      {/* Bounding Box Simulation */}
                      <div style={{ 
                        position: 'absolute', top: '25%', left: '35%', width: '30%', height: '40%', 
                        border: '2px solid #6366f1', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' 
                      }}>
                         <div style={{ position: 'absolute', bottom: '-25px', left: 0, width: '100%', textAlign: 'center', color: '#fff', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px' }}>
                           FACE_LOCKED_2.0
                         </div>
                         <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: '#fff', boxShadow: '0 0 10px #fff', animation: 'scanLine 2s infinite' }}></div>
                      </div>
                   </div>

                   <div style={{ width: '350px', background: 'rgba(15, 12, 20, 1)', borderLeft: '1px solid rgba(139, 92, 246, 0.2)', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ fontSize: '10px', color: '#6366f1', fontWeight: 'bold', textTransform: 'uppercase' }}>
                         {scanningImage.includes('.mp4') ? 'Neural Stream Processing' : 'Static Pattern Extraction'}
                      </div>
                      <h2 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold', margin: '0' }}>Subject Analysis</h2>
                      
                      <div style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                         <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '10px' }}>PROBABILITY MATCH</div>
                         <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>94.2%</div>
                         <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
                            <div style={{ width: '94%', height: '100%', background: '#6366f1' }}></div>
                         </div>
                      </div>

                      <div style={{ color: '#fff' }}>
                         <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '5px' }}>IDENTIFIED SUBJECT</div>
                         <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Shahzeb (Admin Testing)</div>
                         <div style={{ fontSize: '0.8rem', color: '#6366f1' }}>Student ID: SUB-992</div>
                      </div>

                      <div style={{ marginTop: 'auto', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                         <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 'bold' }}>THREAT ADVISORY</div>
                         <div style={{ fontSize: '0.8rem', color: '#fff', marginTop: '5px' }}>Subject matches known presence markers. Cross-referencing previous alert logs...</div>
                      </div>
                   </div>
                </div>
              </div>
            )}
            
          </div>

          {/* Sidebar / Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Identity Card */}
            <div style={{ background: 'rgba(30, 27, 36, 0.8)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Reporter Identity</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                   {incident.reporter_id?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ color: '#f8fafc', fontWeight: 500 }}>{incident.reporter_id?.username || 'Unknown'}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{incident.reporter_id?.email || 'N/A'}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                <strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{incident.reporter_role || 'Unknown'}</span>
              </div>
            </div>

            {/* Geographical Card */}
            <div style={{ background: 'rgba(30, 27, 36, 0.8)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Spatial Location</h3>
                <p style={{ margin: 0, color: '#f8fafc', fontSize: '0.95rem', lineHeight: '1.4' }}>
                  📍 {incident.locationText || 'No specific location mentioned'}
                </p>
                {incident.latitude && incident.longitude && (
                  <p style={{ margin: '8px 0 0 0', color: '#a78bfa', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}
                  </p>
                )}
              </div>
              
              {incident.latitude && incident.longitude ? (
                 <div style={{ height: '200px', width: '100%', borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <MapView 
                      center={[incident.latitude, incident.longitude]} 
                      zoom={16} 
                      markers={getMapData()} 
                    />
                 </div>
              ) : (
                 <div style={{ height: '60px', width: '100%', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                    No GPS Telemetry
                 </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
