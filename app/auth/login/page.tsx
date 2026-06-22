"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import styles from '../auth.module.css';
import { auth } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const MailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await auth.login(formData);
      if(response){
        console.log("response exists !")
      }

      // Save token to localStorage so the socket client can use it for JWT auth
      if (response?.token) {
        localStorage.setItem("userToken", response.token);
      }

      toast.success('Successfully logged in!');
      const role = response?.role;
      console.log(role);
      console.log(role === "super_admin");
      if (role === 'super_admin') {
        router.replace('/dashboard/superAdmin');
      } else if (role === 'organization_owner') {
        router.replace('/dashboard/orgOwner');
      } else if(role === "campus_admin"){
        router.replace("/dashboard/campusAdmin");
      }
      else if(role === "security_incharge"){
        router.replace("/dashboard/securityIncharge");
      }
      else {
        router.replace('/auth/login');
      }
    } catch (err: any) {
      alert("login failed!")
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            background: '#f4f4f5',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: '#09090b',
          }}
        >
          <ShieldIcon />
        </div>
        <h1>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your admin account to continue.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email address</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <MailIcon />
            </span>
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="admin@institution.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
            <label className={styles.label} style={{ margin: 0 }}>
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className={styles.forgotLink}
            >
              Forgot password?
            </Link>
          </div>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>
              <LockIcon />
            </span>
            <input
              type="password"
              id="password"
              className={styles.input}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        <button id="login-submit" type="submit" className={styles.primaryButton} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in to Dashboard'}
        </button>
      </form>

      {/* Footer note */}
      <p
        style={{
          marginTop: '32px',
          fontSize: '0.78rem',
          color: '#9ca3af',
          textAlign: 'center',
          lineHeight: '1.6',
        }}
      >
        Protected by SafeCampus enterprise security. <br />
        Unauthorized access is prohibited.
      </p>
    </div>
  );
}
