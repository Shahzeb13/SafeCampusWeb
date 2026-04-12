"use client";

import React, { useEffect, useRef, useState } from 'react';

interface WebRTCStreamPlayerProps {
  url: string; // The RTSP URL
  streamerUrl?: string; // The webrtc-streamer server URL (defualt: http://127.0.0.1:8000)
  fallbackUrl?: string; // Mock video if streamer is not reachable
}

/**
 * A professional WebRTC receiver component designed to work with 'webrtc-streamer'.
 * This is the modern standard for showing real CCTV feeds in the browser with sub-second latency.
 */
export default function WebRTCStreamPlayer({ url, streamerUrl = "http://127.0.0.1:8000", fallbackUrl }: WebRTCStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function connect() {
      try {
        // 1. Create Peer Connection
        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        pcRef.current = pc;

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            fetch(`${streamerUrl}/addIceCandidate?peerid=${url}&candidate=${JSON.stringify(event.candidate)}`);
          }
        };

        pc.ontrack = (event) => {
          if (videoRef.current && isMounted) {
            videoRef.current.srcObject = event.streams[0];
            setIsLive(true);
          }
        };

        // 2. Get Offer from Streamer
        const response = await fetch(`${streamerUrl}/call?peerid=${url}&url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error("Streamer unreachable");
        
        const data = await response.json();
        await pc.setRemoteDescription(new RTCSessionDescription(data));

        // 3. Create and Send Answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        await fetch(`${streamerUrl}/answer?peerid=${url}&answer=${JSON.stringify(answer)}`);

      } catch (err) {
        if (isMounted) {
          setError("WebRTC Server Offline - Using Mock Feed");
          setIsLive(false);
        }
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (pcRef.current) pcRef.current.close();
    };
  }, [url, streamerUrl]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      >
        {!isLive && fallbackUrl && <source src={fallbackUrl} type="video/mp4" />}
      </video>

      {/* Connection Status Indicator */}
      <div style={{ 
        position: 'absolute', bottom: '12px', right: '12px', z鳳Index: 20,
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.6)'
      }}>
        <div style={{ 
          width: '6px', height: '6px', borderRadius: '50%', 
          background: isLive ? '#22c55e' : '#71717a' 
        }}></div>
        <span style={{ fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>
          {isLive ? 'WEBRTC_ACTIVE' : 'MOCK_RESERVE'}
        </span>
      </div>

      {error && !isLive && (
        <div style={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', textAlign: 'center', width: '100%' 
        }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>{error}</div>
        </div>
      )}
    </div>
  );
}
