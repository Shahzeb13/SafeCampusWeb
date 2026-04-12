"use client";

import React, { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';

const MOCK_DETECTED = [
  { id: 'SUB-101', name: 'Shahzeb', role: 'Student', confidence: '98.4%', status: 'Clear', lastSeen: 'Main Gate', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shahzeb' },
  { id: 'SUB-204', name: 'Unknown Subject', role: 'Visitor', confidence: '72.1%', status: 'Flagged', lastSeen: 'Science Block', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown' },
  { id: 'SUB-309', name: 'Professor Ahmed', role: 'Staff', confidence: '99.2%', status: 'Clear', lastSeen: 'Library', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed' }
];

export default function FacialRecognitionPage() {
  const [activeSubject, setActiveSubject] = useState(MOCK_DETECTED[0]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(prev => (prev >= 100 ? 0 : prev + 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Forensic Face Analysis</h1>
          <p>Institutional biometric verification and identity cross-referencing system.</p>
        </div>
      </header>

      <div className={styles.scrollableArea}>
        <div style={{ padding: '0 24px 40px 24px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
          
          {/* Main Scanner Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div style={{ 
               position: 'relative', 
               background: '#09090b', 
               borderRadius: '12px', 
               overflow: 'hidden', 
               border: '1px solid rgba(255, 255, 255, 0.1)',
               height: '550px'
             }}>
                {/* Background "Live" Image */}
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
                  alt="Scanning Feed" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, filter: 'grayscale(1)' }}
                />

                {/* Scanning Bounding Box */}
                <div style={{ 
                  position: 'absolute', 
                  top: '20%', 
                  left: '35%', 
                  width: '30%', 
                  height: '40%', 
                  border: '1px solid #fff',
                  zIndex: 5
                }}>
                   {/* Corner Accents */}
                   <div style={{ position: 'absolute', top: -2, left: -2, width: 15, height: 15, borderTop: '2px solid #fff', borderLeft: '2px solid #fff' }}></div>
                   <div style={{ position: 'absolute', top: -2, right: -2, width: 15, height: 15, borderTop: '2px solid #fff', borderRight: '2px solid #fff' }}></div>
                   <div style={{ position: 'absolute', bottom: -2, left: -2, width: 15, height: 15, borderBottom: '2px solid #fff', borderLeft: '2px solid #fff' }}></div>
                   <div style={{ position: 'absolute', bottom: -2, right: -2, width: 15, height: 15, borderBottom: '2px solid #fff', borderRight: '2px solid #fff' }}></div>
                   
                   {/* Moving Scan Line */}
                   <div style={{ 
                     position: 'absolute', 
                     top: `${scanProgress}%`, 
                     left: 0, 
                     right: 0, 
                     height: '1px', 
                     background: '#fff', 
                     boxShadow: '0 0 10px #fff',
                     zIndex: 6 
                   }}></div>
                   
                   {/* Target Label */}
                   <div style={{ position: 'absolute', top: -25, left: 0, color: '#fff', fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                     [ PROCESSING_FRAME_082 ]
                   </div>
                </div>

                {/* HUD Elements */}
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 10, color: '#71717a', fontFamily: 'monospace', fontSize: '10px' }}>
                   SYSTEM_NODE: forensic_alpha_01<br />
                   ENCRYPTION: active_aes<br />
                   SIGNAL_STRENGTH: 94%
                </div>
             </div>

             {/* Logic Summary */}
             <div style={{ background: '#09090b', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '30px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                   📋
                </div>
                <div style={{ flex: 1 }}>
                   <h3 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '1rem' }}>Biometric Extraction Logic</h3>
                   <p style={{ margin: 0, color: '#71717a', fontSize: '0.85rem' }}>
                     Automated detection script identifies facial anchor points. Geometry vectors are compared against encrypted student records to establish mathematical probability of identity.
                   </p>
                </div>
             </div>
          </div>

          {/* Result Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             
             {/* Identity Card */}
             <div style={{ background: '#09090b', border: '1px solid #fff', borderRadius: '12px', padding: '24px', position: 'relative' }}>
                <h2 style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px', fontWeight: 'bold' }}>Identification Result</h2>
                
                <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                   <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', filter: 'grayscale(1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={activeSubject.avatar} alt="Avatar" style={{ width: '100%', height: '100%' }} />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold' }}>{activeSubject.name}</div>
                      <div style={{ color: '#71717a', fontSize: '0.8rem' }}>{activeSubject.role} // {activeSubject.id}</div>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                   <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ color: '#52525b', fontSize: '0.6rem', textTransform: 'uppercase', marginBottom: '4px' }}>Match Score</div>
                      <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>{activeSubject.confidence}</div>
                   </div>
                   <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ color: '#52525b', fontSize: '0.6rem', textTransform: 'uppercase', marginBottom: '4px' }}>Validation</div>
                      <div style={{ color: activeSubject.status === 'Clear' ? '#4ade80' : '#f87171', fontSize: '1rem', fontWeight: 'bold' }}>{activeSubject.status}</div>
                   </div>
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717a', fontSize: '0.8rem' }}>
                      <span>Last Seen:</span>
                      <span style={{ color: '#fff' }}>{activeSubject.lastSeen}</span>
                   </div>
                </div>
             </div>

             {/* Detection History */}
             <div style={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', fontWeight: 'bold' }}>Log History</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   {MOCK_DETECTED.map((sub) => (
                      <div 
                        key={sub.id} 
                        onClick={() => setActiveSubject(sub)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          padding: '10px', 
                          borderRadius: '8px', 
                          background: activeSubject.id === sub.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                          border: activeSubject.id === sub.id ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                          cursor: 'pointer'
                        }}
                      >
                         <img src={sub.avatar} alt="User" style={{ width: '32px', height: '32px', borderRadius: '4px', filter: 'grayscale(1)' }} />
                         <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{sub.name}</div>
                            <div style={{ color: '#52525b', fontSize: '0.7rem' }}>Match {sub.confidence}</div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

          </div>

        </div>
      </div>
    </>
  );
}
