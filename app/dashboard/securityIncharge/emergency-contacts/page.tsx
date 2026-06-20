"use client";

import React, { useState, useEffect } from 'react';
import styles from '../../dashboard.module.css';
import { emergencyContacts } from '@/lib/api';
import toast from 'react-hot-toast';

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default function EmergencyContactsDashboard() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    phoneNumber: '', 
    category: 'security', 
    isPrimary: false 
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await emergencyContacts.getAll();
      setContacts(data);
    } catch (err: any) {
      toast.error("Failed to fetch contacts");
    } finally {
      setFetching(false);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await emergencyContacts.create(formData);
      toast.success('Emergency contact created');
      setFormData({ name: '', phoneNumber: '', category: 'security', isPrimary: false });
      fetchContacts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create contact');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await emergencyContacts.delete(id);
      toast.success('Contact deleted');
      fetchContacts();
    } catch (err: any) {
      toast.error('Failed to delete contact');
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Campus Emergency Services</h1>
          <p>Manage high-order emergency responders and official contacts</p>
        </div>
        <div className={styles.headerActions}>
          <div style={{ backgroundColor: '#dc2626', padding: '6px 14px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
            OFFICIAL CONTACTS
          </div>
        </div>
      </header>

      <div className={styles.scrollableArea}>
        {/* Create Contact Form */}
        <div className={styles.tableContainer} style={{ marginBottom: '2rem' }}>
          <div className={styles.tableHeader}>
            <h2>Add New Official Service</h2>
          </div>
          
          <form onSubmit={handleCreateContact} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Service Name</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. Main Security Hub"
                className={styles.input}
                style={{ padding: '0.75rem' }}
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Phone Number</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. +92348..."
                className={styles.input}
                style={{ padding: '0.75rem' }}
                value={formData.phoneNumber} 
                onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Category</label>
              <select 
                className={styles.input}
                style={{ padding: '0.75rem' }}
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="security">Security</option>
                <option value="ambulance">Ambulance</option>
                <option value="fire">Fire Brigade</option>
                <option value="admin">Administration</option>
                <option value="hostel">Hostel Warden</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '25px' }}>
              <input 
                type="checkbox" 
                id="isPrimary"
                checked={formData.isPrimary} 
                onChange={e => setFormData({...formData, isPrimary: e.target.checked})}
                style={{ width: '18px', height: '18px', accentColor: '#0052cc' }}
              />
              <label htmlFor="isPrimary" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#09090b' }}>Mark as Primary Contact</label>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
              <button type="submit" disabled={loading} className={styles.primaryButton} style={{ padding: '0.75rem 2rem', width: 'auto' }}>
                {loading ? 'Adding...' : 'Save Official Contact'}
              </button>
            </div>
          </form>
        </div>

        {/* Contacts List */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>Active Emergency Services</h2>
          </div>
          
          {fetching ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#71717a' }}>Loading contacts...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Number</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#71717a' }}>No official contacts found. Add one above!</td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact._id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ 
                            backgroundColor: contact.isPrimary ? '#dc2626' : '#f4f4f5', 
                            color: contact.isPrimary ? '#fff' : '#09090b',
                            padding: '5px', borderRadius: '50%', display: 'flex' 
                          }}>
                            <ShieldIcon />
                          </div>
                          {contact.name}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0052cc', fontWeight: 500 }}>
                          <PhoneIcon />
                          {contact.phoneNumber}
                        </div>
                      </td>
                      <td>
                        <span className={styles.badge} style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                          {contact.category}
                        </span>
                      </td>
                      <td>
                        {contact.isPrimary ? (
                          <span className={`${styles.badge} ${styles.badgeDanger}`}>PRIMARY</span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeInfo}`}>SECONDARY</span>
                        )}
                      </td>
                      <td>
                        <button 
                          onClick={() => handleDeleteContact(contact._id)}
                          className={styles.rowAction} 
                          style={{ color: '#ef4444' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
