"use client";

import dynamic from 'next/dynamic';

// Next.js requires us to dynamically import Leaflet because it relies on the 'window' object,
// which is undefined during server-side rendering (SSR).
const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false, // This is the crucial part that disables SSR
  loading: () => (
    <div style={{ 
      height: '100%', 
      width: '100%', 
      minHeight: '400px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#1f2937', 
      color: '#9ca3af',
      borderRadius: '12px'
    }}>
      Loading Map Data...
    </div>
  ),
});

export default DynamicMap;
