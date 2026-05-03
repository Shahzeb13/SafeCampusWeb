"use client";

import React, { useState } from 'react';
import styles from '../auth.module.css';
import Link from 'next/link';
import { auth } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
      const result = await auth.login(formData);
      if (result.token) {
        localStorage.setItem('userToken', result.token);
      }
      toast.success('Successfully logged in!');
      router.push('/dashboard'); 
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h1>Welcome Back</h1>
      <p className={styles.subtitle}>Ready to Secure your Campus ?</p>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}><MailIcon /></span>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="Email" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required 
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Password</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}><LockIcon /></span>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="Password" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required 
            />
          </div>
        </div>
        
        <button type="submit" className={styles.primaryButton} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
    </div>
  );
}
