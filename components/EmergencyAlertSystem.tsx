"use client";

import React, { useEffect, useState, useRef } from 'react';
import { sos } from '@/lib/api';

export default function EmergencyAlertSystem() {
  const [activeEmergency, setActiveEmergency] = useState<any | null>(null);
  const lastProcessedId = useRef<string | null>(null);
  const chimeRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check for emergencies every 5 seconds
    const interval = setInterval(checkForEmergencies, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkForEmergencies = async () => {
    try {
      const res = await sos.getAll();
      if (res.success && Array.isArray(res.data)) {
        // Find the most recent active SOS
        const activeSos = res.data.find((s: any) => s.status === 'active');
        
        if (activeSos) {
          if (activeSos._id !== lastProcessedId.current) {
            lastProcessedId.current = activeSos._id;
            triggerAlert(activeSos);
          }
        } else {
          // If no active SOS anymore, clear the notification automatically
          setActiveEmergency(null);
        }
      }
    } catch (err) {
      console.error("Emergency system failed to poll", err);
    }
  };

  const triggerAlert = (emergency: any) => {
    setActiveEmergency(emergency);
    
    // Play a gentle alert chime instead of a loud siren
    try {
      if (!chimeRef.current) {
        // Use a short, professional chime sound
        chimeRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
      }
      chimeRef.current.play().catch(e => {});
    } catch (e) {}
  };

  if (!activeEmergency) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      width: '380px',
      background: 'rgba(30, 27, 36, 0.9)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(245, 158, 11, 0.5)',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(245, 158, 11, 0.2)',
      animation: 'slideIn 0.5s ease-out, glowPulse 2s infinite alternate',
      color: '#fff',
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes glowPulse {
          from { border-color: rgba(245, 158, 11, 0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          to { border-color: rgba(245, 158, 11, 1); box-shadow: 0 10px 30px rgba(245, 158, 11, 0.2); }
        }
      `}</style>
      
      <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
        <div style={{ 
          width: '50px', height: '50px', borderRadius: '14px', 
          background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
        }}>
          🚨
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
             <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px' }}>Active SOS Triggered</span>
             <button 
               onClick={() => setActiveEmergency(null)}
               style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}
             >
               ✕
             </button>
          </div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 600 }}>{activeEmergency.userId?.username || 'Unknown User'}</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
            "{activeEmergency.note || 'Emergency assistance requested'}"
          </p>
          
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
             <button 
                onClick={() => window.location.href = '/dashboard/sos'}
                style={{ 
                  flex: 1, padding: '8px', borderRadius: '8px', background: '#f59e0b', color: '#000', 
                  border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' 
                }}
             >
                Dispatch Unit
             </button>
             <button 
                onClick={() => window.location.href = '/dashboard/map-demo'}
                style={{ 
                  flex: 1, padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', 
                  border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', cursor: 'pointer' 
                }}
             >
                Locate
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
