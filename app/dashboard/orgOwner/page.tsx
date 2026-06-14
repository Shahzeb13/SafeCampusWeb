import React, { Suspense } from 'react';
import OrgOwnerDashboard from '@/components/orgOwnerDashboard/OrgOwnerDashboard';

export default function OrgOwnerPage() {
  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#09090b', letterSpacing: '-0.03em' }}>
            Organization Overview
          </h1>
          <p style={{ color: '#71717a', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Welcome back. Here is the current status and details of your organization.
          </p>
        </div>
        
        <Suspense fallback={
          <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '20px', border: '1px solid #f4f4f5' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: '#0052cc', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <p style={{ marginTop: '1rem', color: '#71717a', fontWeight: 600 }}>Loading Organization Data...</p>
          </div>
        }>
          <OrgOwnerDashboard />
        </Suspense>
      </div>
    </div>
  );
}
