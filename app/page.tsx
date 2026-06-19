'use client';

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { 
  Shield, 
  AlertCircle, 
  Activity, 
  Users, 
  Layout, 
  Globe, 
  Bell, 
  CheckCircle2
} from "lucide-react";
import s from "./landing.module.css";
import { landing } from "@/lib/api";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    institution: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [tilt, setTilt] = useState({ rx: 8, ry: -12 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const rx = -(y / (box.height / 2)) * 12;
    const ry = (x / (box.width / 2)) * 12;
    setTilt({ rx, ry });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 8, ry: -12 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.institution || !formData.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await landing.submitContact(formData);
      toast.success("Inquiry sent! Check your email for confirmation.");
      setFormData({ name: "", institution: "", email: "", message: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to send inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={s.landingContainer}>
      <Toaster position="top-right" />

      {/* --- NAVIGATION --- */}
      <nav className={s.nav}>
        <div className={s.navInner}>
          <div className={s.logoArea}>
            <div className={s.logoIcon}>
              <Shield size={20} />
            </div>
            <span className={s.brandName}>SafeCampus</span>
          </div>
          
          <div className={s.navLinks}>
            <Link href="#solutions" className={s.navLink}>Solutions</Link>
            <Link href="#platform" className={s.navLink}>Platform</Link>
            <Link href="#resources" className={s.navLink}>Resources</Link>
            <Link href="#pricing" className={s.navLink}>Pricing</Link>
          </div>

          <div className={s.navActions}>
            {/* <Link href="/auth/login" className={s.loginLink}>Login</Link> */}
            <button className={s.btnPrimary}>
              Request Demo
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* --- HERO SECTION --- */}
        <section className={s.hero}>
          <div className={s.heroImageContainer}>
            <Image 
              src="/LandingPageImages/SafeCampusHeroImage.png" 
              alt="SafeCampus Hero" 
              fill
              style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.9 }}
              priority
            />
            <div className={s.heroOverlay} />
          </div>

          <div className={s.heroContent}>
            <div className={s.heroText}>
              <div className={s.badge}>
                <span className={s.pulse} />
                SafeCampus v2.0 is now live
              </div>
              
              <h1 className={s.heroTitle}>
                Modern Campus Safety Management for Institutions
              </h1>
              
              <p className={s.heroSub}>
                Manage incidents, SOS alerts, and security coordination from one unified platform built for structural stability.
              </p>

              <div className={s.heroBtns}>
                <button className={`${s.btnPrimary} ${s.btnLarge}`}>
                  Request a Demo
                </button>
                <button className={`${s.btnGlass} ${s.btnLarge}`}>
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section id="platform" className={s.section}>
          <div className={s.sectionInner}>
            <div className={s.sectionHeader}>
              <span className={s.label}>Platform Capabilities</span>
              <h2 className={s.sectionTitle}>Comprehensive Security Infrastructure</h2>
            </div>

            <div className={s.featureGrid}>
              {[
                { 
                  title: "Incident Reporting", 
                  desc: "Streamlined workflows for reporting and tracking campus incidents in real-time with comprehensive audit trails.",
                  icon: AlertCircle,
                  color: "#3b82f6"
                },
                { 
                  title: "SOS Alert System", 
                  desc: "Immediate panic button functionality integrating directly with campus security dispatch for rapid response.",
                  icon: Activity,
                  color: "#ef4444"
                },
                { 
                  title: "Security Team Coordination", 
                  desc: "Geospatial tracking and communication tools to deploy personnel effectively during critical events.",
                  icon: Users,
                  color: "#10b981"
                },
                { 
                  title: "Admin Dashboard", 
                  desc: "Centralized command center providing high-level metrics, active alerts, and detailed reporting analytics.",
                  icon: Layout,
                  color: "#0f172a"
                },
                { 
                  title: "Multi-Campus Support", 
                  desc: "Scalable architecture designed to manage distinct campus locations from a single organizational instance.",
                  icon: Globe,
                  color: "#6366f1"
                },
                { 
                  title: "Real-Time Notifications", 
                  desc: "Multi-channel mass communication system to broadcast critical updates to students and faculty instantly.",
                  icon: Bell,
                  color: "#2563eb"
                }
              ].map((feature, i) => (
                <div key={i} className={s.featureCard}>
                  <div className={s.iconBox} style={{ color: feature.color }}>
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h3 className={s.featureTitle}>{feature.title}</h3>
                    <p className={s.featureDesc}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CLARITY SECTION --- */}
        <section className={s.section} style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
          <div className={s.sectionInner}>
            <div className={s.clarityGrid}>
              <div className={s.clarityText}>
                <div>
                  <h2 className={s.heroTitle} style={{ fontSize: '56px', marginBottom: '24px' }}>
                    Security through Clarity.
                  </h2>
                  <p className={s.heroSub}>
                    Our platform is engineered to remove friction during critical moments. By consolidating disparate security systems into one unified interface, we enable rapid, decisive action.
                  </p>
                </div>

                <ul className={s.checklist}>
                  {[
                    { t: "Improve campus safety response", d: "Reduce response times by an average of 40%." },
                    { t: "Centralize incident management", d: "One source of truth for all security data." },
                    { t: "Better coordination", d: "Seamless communication between dispatch and guards." }
                  ].map((item, i) => (
                    <li key={i} className={s.checkItem}>
                      <div style={{ marginTop: '4px' }}>
                        <CheckCircle2 size={24} color="#2563eb" />
                      </div>
                      <div>
                        <h4 className={s.checkTitle}>{item.t}</h4>
                        <p className={s.checkDesc}>{item.d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={s.phoneWrapper}>
                <div 
                  className={s.phoneContainer}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Backdrop Glow */}
                  <div className={s.phoneBackdrop} />

                  {/* Physical Side Buttons */}
                  <div className={`${s.phoneButton} ${s.buttonVolumeUp}`} />
                  <div className={`${s.phoneButton} ${s.buttonVolumeDown}`} />
                  <div className={`${s.phoneButton} ${s.buttonPower}`} />

                  {/* Floating Widget Left: Alert */}
                  <div className={`${s.floatingWidget} ${s.widgetLeft}`}>
                    <div className={s.widgetIcon} style={{ backgroundColor: '#ef4444' }}>
                      <AlertCircle size={16} />
                    </div>
                    <div className={s.widgetText}>
                      <span className={s.widgetTitle}>SOS Active</span>
                      <span className={s.widgetSub}>Location Shared</span>
                    </div>
                  </div>

                  {/* Floating Widget Right: Safe */}
                  <div className={`${s.floatingWidget} ${s.widgetRight}`}>
                    <div className={s.widgetIcon} style={{ backgroundColor: '#10b981' }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div className={s.widgetText}>
                      <span className={s.widgetTitle}>Status Secure</span>
                      <span className={s.widgetSub}>All guards online</span>
                    </div>
                  </div>

                  {/* Device Frame */}
                  <div 
                    className={s.phoneFrame}
                    style={{
                      transform: `rotateY(${tilt.ry}deg) rotateX(${tilt.rx}deg) scale(${tilt.rx === 8 && tilt.ry === -12 ? 1 : 1.05})`
                    }}
                  >
                    {/* Notch */}
                    <div className={s.phoneNotch}>
                      <div className={s.phoneNotchCamera} />
                      <div className={s.phoneNotchSpeaker} />
                    </div>

                    {/* Status Bar */}
                    <div className={s.phoneStatusBar}>
                      <span>9:41</span>
                      <div className={s.statusBarRight}>
                        <Activity size={10} style={{ transform: 'rotate(90deg)' }} />
                        <div className={s.statusBarBattery}>
                          <div className={s.statusBarBatteryFill} />
                        </div>
                      </div>
                    </div>

                    {/* Screen Content */}
                    <div className={s.phoneScreen}>
                      {/* Reflection Glare */}
                      <div className={s.phoneGlare} />

                      <Image 
                        src="/LandingPageImages/SafeCampusAppInterface.jpeg" 
                        alt="SafeCampus App Interface" 
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="290px"
                      />
                    </div>

                    {/* Home Bar Indicator */}
                    <div className={s.phoneHomeBar} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FORM SECTION --- */}
        <section id="pricing" className={`${s.section} ${s.formSection}`}>
          <div className={s.sectionInner}>
            <div className={s.formBox}>
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 className={s.sectionTitle} style={{ fontSize: '48px', marginBottom: '16px' }}>
                  Bring SafeCampus to Your Institution
                </h2>
                <p className={s.featureDesc} style={{ fontSize: '16px' }}>
                  Fill out the form below and our enterprise team will be in touch within 24 hours.
                </p>
              </div>

              <form className={s.form} onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <div className={s.inputGroup}>
                    <label className={s.inputLabel}>Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Jane Doe" 
                      className={s.input} 
                    />
                  </div>
                  <div className={s.inputGroup}>
                    <label className={s.inputLabel}>Institution / Organization</label>
                    <input 
                      type="text" 
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      placeholder="University Name" 
                      className={s.input} 
                    />
                  </div>
                </div>

                <div className={s.inputGroup}>
                  <label className={s.inputLabel}>Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jane@university.edu" 
                    className={s.input} 
                  />
                </div>

                <div className={s.inputGroup}>
                  <label className={s.inputLabel}>Tell us about yourself</label>
                  <textarea 
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Briefly describe your current safety infrastructure..." 
                    className={`${s.input} ${s.textarea}`}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`${s.btnPrimary} ${s.btnLarge}`} 
                  style={{ width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? "Sending..." : "Send Inquiry"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className={s.footer}>
        <div className={s.sectionInner}>
          <div className={s.footerGrid}>
            <div className={s.footerBrand}>
              <div className={s.logoArea}>
                <div className={s.logoIcon} style={{ width: '24px', height: '24px', borderRadius: '4px' }}>
                  <Shield size={16} />
                </div>
                <span className={s.brandName} style={{ fontSize: '18px' }}>SafeCampus</span>
              </div>
              <p className={s.featureDesc}>
                Empowering institutions with modern, reliable safety management tools for a more secure campus environment.
              </p>
            </div>

            <div className={s.footerNav}>
              <div className={s.footerCol}>
                <h5 className={s.footerColTitle}>Platform</h5>
                <ul className={s.footerLinks}>
                  <li><Link href="#">Features</Link></li>
                  <li><Link href="#">Security</Link></li>
                  <li><Link href="#">Mobile App</Link></li>
                </ul>
              </div>
              <div className={s.footerCol}>
                <h5 className={s.footerColTitle}>Company</h5>
                <ul className={s.footerLinks}>
                  <li><Link href="#">About Us</Link></li>
                  <li><Link href="#">Contact</Link></li>
                  <li><Link href="#">Careers</Link></li>
                </ul>
              </div>
              <div className={s.footerCol}>
                <h5 className={s.footerColTitle}>Legal</h5>
                <ul className={s.footerLinks}>
                  <li><Link href="#">Privacy Policy</Link></li>
                  <li><Link href="#">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className={s.footerBottom}>
            <p>© 2026 SafeCampus. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '32px' }}>
              <Link href="#">Twitter</Link>
              <Link href="#">LinkedIn</Link>
              <Link href="#">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
