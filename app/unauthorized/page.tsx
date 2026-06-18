"use client";

import React from 'react';
import Link from 'next/link';

const LockIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default function UnauthorizedPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: '#09090b',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px',
      color: '#fafafa',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: '#18181b',
        borderRadius: '16px',
        border: '1px solid #ef4444',
        padding: '40px 32px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(239, 68, 68, 0.1), 0 1px 3px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Glowing lock icon wrapper */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <LockIcon />
        </div>

        {/* Core RED Text Header */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: '#ef4444',
          margin: '0 0 12px',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase'
        }}>
          403: Unauthorized
        </h1>

        {/* Subtitle */}
        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#e4e4e7',
          margin: '0 0 20px'
        }}>
          Whoa there, space cadet! You shall not pass! 🛑
        </h2>

        {/* Hilarious message */}
        <div style={{
          fontSize: '0.9rem',
          color: '#a1a1aa',
          lineHeight: 1.6,
          background: '#09090b',
          padding: '16px 20px',
          borderRadius: '8px',
          borderLeft: '4px solid #ef4444',
          textAlign: 'left',
          marginBottom: '32px'
        }}>
          <p style={{ margin: '0 0 8px' }}>
            🔒 <strong>Security Log:</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li style={{ marginBottom: '6px' }}>Our security hamsters scanned your credentials and started laughing.</li>
            <li style={{ marginBottom: '6px' }}>We've notified your supervisor, your mother, and our local campus squirrel patrol.</li>
            <li style={{ marginBottom: 0 }}>Please back away from the keyboard slowly and think about what you did.</li>
          </ul>
        </div>

        

        {/* Dynamic Navigation button */}
        <Link href="/dashboard" style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: '#ef4444',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.9rem',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          transition: 'background 0.2s ease',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
        >
          <HomeIcon /> Return to Safety
        </Link>
      </div>
    </div>
  );
}
