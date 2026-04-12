"use client";

import React, { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';
import WebRTCStreamPlayer from '@/components/CCTV/WebRTCStreamPlayer';

const CAMERAS = [
  { id: 'CAM-01', location: 'Gate A - Primary Entrance', rtsp: 'rtsp://192.168.1.101:554/ch1', mock: 'https://assets.mixkit.co/videos/preview/mixkit-security-camera-at-a-parking-lot-entry-32777-large.mp4' },
  { id: 'CAM-02', location: 'Section B - Main Corridor', rtsp: 'rtsp://192.168.1.102:554/ch1', mock: 'https://assets.mixkit.co/videos/preview/mixkit-security-camera-rotating-in-a-building-32770-large.mp4' },
  { id: 'CAM-03', location: 'Block 4 - Admin Lobby', rtsp: 'rtsp://192.168.1.103:554/ch1', mock: 'https://assets.mixkit.co/videos/preview/mixkit-security-camera-looking-at-the-stairs-32774-large.mp4' },
  { id: 'CAM-04', location: 'Parking Zone 3', rtsp: 'rtsp://192.168.1.104:554/ch1', mock: 'https://assets.mixkit.co/videos/preview/mixkit-security-camera-in-a-parking-lot-32772-large.mp4' }
];

export default function CCTVPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Surveillance Network</h1>
          <p>Multi-node biometric surveillance and spatial security grid.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
             Capture Snapshot
           </button>
           <button className={styles.primaryButton}>
             Configure Nodes
           </button>
        </div>
      </header>

      <div className={styles.scrollableArea}>
        <div style={{ padding: '0 24px 40px 24px' }}>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', 
            gap: '20px' 
          }}>
            {CAMERAS.map((cam) => (
              <div key={cam.id} style={{ 
                background: '#0c0c0e', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                border: '1px solid rgba(255,255,255,0.08)',
                position: 'relative'
              }}>
                {/* Header HUD */}
                <div style={{ 
                  position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
                  padding: '12px 16px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></div>
                     <span style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}>SEC_NODE_{cam.id}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontFamily: 'monospace' }}>
                    {currentTime.toLocaleTimeString()} [ UTC+5 ]
                  </div>
                </div>

                {/* The WebRTC Player */}
                <div style={{ height: '320px', width: '100%' }}>
                   <WebRTCStreamPlayer url={cam.rtsp} fallbackUrl={cam.mock} />
                </div>

                {/* Bottom Metadata */}
                <div style={{ padding: '12px 16px', background: '#0c0c0e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{cam.location}</div>
                    <div style={{ color: '#71717a', fontSize: '0.75rem', textTransform: 'uppercase' }}>BITRATE: 4.2MBPS</div>
                </div>

                {/* Simulated scanline effect */}
                <div style={{ 
                   position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                   background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 2px, transparent 4px)',
                   pointerEvents: 'none'
                }}></div>
              </div>
            ))}
          </div>

          {/* Analysis Footer */}
          <div style={{ 
            marginTop: '30px', 
            padding: '24px', 
            background: '#0c0c0e', 
            borderRadius: '12px', 
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                   🎛️
                </div>
                <div>
                   <h5 style={{ margin: 0, color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>Forensic Video Triage Engine</h5>
                   <p style={{ margin: '4px 0 0 0', color: '#71717a', fontSize: '0.8rem' }}>Streams are being parsed for object persistence and unauthorized boundary crossing in real-time.</p>
                </div>
             </div>
             <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>NETWORK HEALTH</div>
                   <div style={{ color: '#22c55e', fontSize: '0.7rem' }}>OPTIMAL (12ms Latency)</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
