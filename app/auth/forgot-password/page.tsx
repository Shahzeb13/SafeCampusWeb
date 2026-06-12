"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.forgotPassword(email);
      toast.success('OTP sent to your email.');
      // After requesting OTP, navigate to reset password page
      router.push('/auth/reset-password');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h1>Forgot Password</h1>
      <p className={styles.subtitle}>Enter your email address to receive a password reset code.</p>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email address</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>📧</span>
            <input
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={loading}
        >
          {loading ? 'Sending…' : 'Send OTP'}
        </button>
      </form>
      <p style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link href="/auth/login" className={styles.link}>Back to Login</Link>
      </p>
    </div>
  );
}
