"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import styles from '../auth.module.css';

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.resetPassword(formData);
      toast.success('Password reset successful. Please log in.');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h1>Reset Password</h1>
      <p className={styles.subtitle}>Enter the OTP sent to your email and choose a new password.</p>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email address</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>📧</span>
            <input
              type="email"
              name="email"
              className={styles.input}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>OTP</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>🔢</span>
            <input
              type="text"
              name="otp"
              className={styles.input}
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>New Password</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>🔒</span>
            <input
              type="password"
              name="newPassword"
              className={styles.input}
              placeholder="New password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <button type="submit" className={styles.primaryButton} disabled={loading}>
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>
      <p style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link href="/auth/login" className={styles.link}>Back to Login</Link>
      </p>
    </div>
  );
}
