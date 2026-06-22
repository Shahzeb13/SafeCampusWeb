"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../../dashboard.module.css";
import { incidents, securityGuards, incidentAssignment } from "@/lib/api";
import toast from "react-hot-toast";
import MapComponent from "@/components/Map/MapComponent";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// SVG Icons
const BackIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

const UserIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const MailIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);

const MapPinIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

const ShieldIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);

const CalendarIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

const DownloadIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

const LinkIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
);

const RefreshIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
);

export default function IncidentDossierPage() {
	const params = useParams();
	const id = (params as any)?.id;

	const [incident, setIncident] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [showAssignModal, setShowAssignModal] = useState(false);
	const [guards, setGuards] = useState<any[]>([]);
	const [guardsLoading, setGuardsLoading] = useState(false);
	const [assignLoading, setAssignLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGuardId, setSelectedGuardId] = useState<string | null>(null);
	const [pdfLoading, setPdfLoading] = useState(false);

	useEffect(() => {
		if (!id) return;
		fetchIncident();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	async function fetchIncident() {
		setLoading(true);
		try {
			const res = await incidents.getById(id as string);
			setIncident(res);
		} catch (err: any) {
			console.error(err);
			toast.error("Failed to load incident");
		} finally {
			setLoading(false);
		}
	}

	async function fetchImageData(url: string) {
		const resp = await fetch(url);
		const blob = await resp.blob();
		return await new Promise<{ dataUrl: string; width: number; height: number }>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const dataUrl = reader.result as string;
				const img = new Image();
				img.onload = () => resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
				img.onerror = (e) => reject(e);
				img.src = dataUrl;
			};
			reader.onerror = (e) => reject(e);
			reader.readAsDataURL(blob);
		});
	}

	async function generatePdf() {
		if (!incident) return;
		setPdfLoading(true);
		try {
			const doc = new jsPDF({ unit: "pt", format: "a4" });
			const pageWidth = doc.internal.pageSize.getWidth();
			const pageHeight = doc.internal.pageSize.getHeight();
			const margin = 40;
			let y = 40;

			doc.setFontSize(18);
			doc.text(incident.title || "Incident Dossier", margin, y);
			y += 26;

			const tableBody = [
				["Incident Type", (incident.incidentType || "").toString().replace(/_/g, " ")],
				["Status", incident.status || ""],
				["Reporter", incident.reporter_id?.username || "Unknown"],
				["Reporter Email", incident.reporter_id?.email || ""],
				["Location Text", incident.locationText || ""],
				["Coordinates", lat !== null && lng !== null ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : ""],
				["Assigned To", incident.assigned_to?.username || "Unassigned"],
				["Reported At", new Date(incident.createdAt).toLocaleString()],
			];

			try {
				(autoTable as any)(doc, {
					startY: y,
					head: [["Field", "Value"]],
					body: tableBody,
					styles: { fontSize: 10, cellPadding: 6 },
					theme: "grid",
				});
				y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : y + 12;
			} catch (atErr) {
				console.warn("autoTable failed, falling back to plain table", atErr);
				for (const row of tableBody) {
					if (y > pageHeight - margin) { doc.addPage(); y = margin; }
					doc.setFontSize(10);
					doc.text(`${row[0]}: ${String(row[1] || "")}`, margin, y);
					y += 14;
				}
			}

			doc.setFontSize(12);
			doc.text("Description", margin, y);
			y += 16;
			const descLines = doc.splitTextToSize(incident.description || "No description provided.", pageWidth - margin * 2);
			for (const line of descLines) {
				if (y > pageHeight - margin) {
					doc.addPage();
					y = margin;
				}
				doc.text(line, margin, y);
				y += 14;
			}

			if (videoUrl || audioUrl) {
				y += 6;
				doc.setFontSize(12);
				doc.text("Media Links", margin, y);
				y += 14;
				if (videoUrl) {
					if (y > pageHeight - margin) { doc.addPage(); y = margin; }
					doc.setTextColor(0, 0, 255);
					doc.text(videoUrl, margin, y);
					try { (doc as any).link(margin, y - 10, (doc as any).getTextWidth(videoUrl), 12, { url: videoUrl }); } catch (e) {}
					doc.setTextColor(0, 0, 0);
					y += 14;
				}
				if (audioUrl) {
					if (y > pageHeight - margin) { doc.addPage(); y = margin; }
					doc.setTextColor(0, 0, 255);
					doc.text(audioUrl, margin, y);
					try { (doc as any).link(margin, y - 10, (doc as any).getTextWidth(audioUrl), 12, { url: audioUrl }); } catch (e) {}
					doc.setTextColor(0, 0, 0);
					y += 14;
				}
			}

			if (images.length > 0) {
				doc.setFontSize(12);
				doc.text("Images", margin, y);
				y += 14;
				for (const img of images) {
					try {
						const { dataUrl, width: iw, height: ih } = await fetchImageData(img.url);
						const maxW = pageWidth - margin * 2;
						const ratio = iw / ih || 1;
						const drawW = maxW;
						const drawH = drawW / ratio;
						if (y + drawH > pageHeight - margin) { doc.addPage(); y = margin; }
						const fmt = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
						doc.addImage(dataUrl, fmt as any, margin, y, drawW, drawH);
						y += drawH + 10;
					} catch (e) {
						console.error("Image fetch error", e);
					}
				}
			}

			const safeTitle = (incident.title || "incident").replace(/[^a-z0-9-_]/gi, "_").substring(0, 50);
			doc.save(`${safeTitle}_${incident._id}.pdf`);
		} catch (e: any) {
			console.error("PDF generation error:", e);
			toast.error("PDF generation failed: " + (e?.message || String(e)));
		} finally {
			setPdfLoading(false);
		}
	}

	if (loading) {
		return (
			<div className={styles.scrollableArea} style={{ paddingTop: 80, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
				<div style={{ textAlign: "center", color: "#94a3b8" }}>
					<div className="spinner" style={{ width: 40, height: 40, border: "3px solid #f3f3f3", borderTop: "3px solid #0052cc", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }}></div>
					<div style={{ fontSize: "1.1rem", fontWeight: 500 }}>Decrypting dossier files...</div>
				</div>
				<style dangerouslySetInnerHTML={{ __html: `
					@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
				`}} />
			</div>
		);
	}

	if (!incident) {
		return (
			<div className={styles.scrollableArea} style={{ paddingTop: 80 }}>
				<div style={{ textAlign: "center", padding: 80, color: "#ef4444", background: "rgba(239, 68, 68, 0.05)", borderRadius: 16, border: "1px dashed rgba(239, 68, 68, 0.2)", maxWidth: 500, margin: "0 auto" }}>
					<h3 style={{ marginBottom: 8 }}>Dossier Unavailable</h3>
					<p style={{ fontSize: "0.95rem" }}>The requested incident dossier could not be retrieved. It may have been archived or deleted.</p>
					<Link href="/dashboard/securityIncharge/incidents" style={{ display: "inline-block", marginTop: 18, color: "#0052cc", fontWeight: 600 }}>
						← Return to incidents
					</Link>
				</div>
			</div>
		);
	}

	const images = incident.images || [];
	const videoUrl = incident.video?.url || incident.video?.secure_url || null;
	const audioUrl = incident.audio?.url || incident.audio?.secure_url || null;
	const lat = incident.latitude ? Number(incident.latitude) : null;
	const lng = incident.longitude ? Number(incident.longitude) : null;

	return (
		<>
			{/* Custom Embedded CSS for Premium Styling & Micro-interactions */}
			<style dangerouslySetInnerHTML={{ __html: `
				:root {
					--glass-bg: rgba(255, 255, 255, 0.85);
					--glass-border: rgba(226, 232, 240, 0.8);
					--accent-gradient: linear-gradient(135deg, #0052cc 0%, #0747a6 100%);
					--success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
					--warning-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
					--danger-gradient: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
				}

				.premium-header {
					background: var(--glass-bg);
					backdrop-filter: blur(12px);
					border-bottom: 1px solid var(--glass-border);
					padding: 20px 40px;
					display: flex;
					align-items: center;
					justify-content: space-between;
					position: sticky;
					top: 0;
					z-index: 100;
				}

				.premium-container {
					padding: 32px 40px;
					max-width: 1400px;
					margin: 0 auto;
					animation: fadeIn 0.4s ease-out;
				}

				.dossier-grid {
					display: grid;
					grid-template-columns: 2fr 1fr;
					gap: 32px;
				}

				@media (max-width: 1024px) {
					.dossier-grid {
						grid-template-columns: 1fr;
					}
				}

				.premium-card {
					background: #ffffff;
					border: 1px solid var(--glass-border);
					border-radius: 18px;
					box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04);
					padding: 28px;
					transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
					position: relative;
					overflow: hidden;
				}

				.premium-card:hover {
					box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08);
					transform: translateY(-2px);
				}

				.premium-btn {
					display: inline-flex;
					align-items: center;
					gap: 8px;
					padding: 10px 20px;
					border-radius: 12px;
					font-weight: 600;
					font-size: 0.875rem;
					transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
					border: 1px solid transparent;
				}

				.premium-btn-primary {
					background: var(--accent-gradient);
					color: #ffffff;
				}

				.premium-btn-primary:hover {
					opacity: 0.95;
					transform: translateY(-1px);
					box-shadow: 0 4px 12px rgba(0, 82, 204, 0.2);
				}

				.premium-btn-success {
					background: var(--success-gradient);
					color: #ffffff;
				}

				.premium-btn-success:hover {
					opacity: 0.95;
					transform: translateY(-1px);
					box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
				}

				.premium-btn-secondary {
					background: #ffffff;
					border: 1px solid var(--glass-border);
					color: #4b5563;
				}

				.premium-btn-secondary:hover {
					background: #f9fafb;
					color: #111827;
				}

				.status-badge {
					padding: 6px 14px;
					border-radius: 50px;
					font-weight: 700;
					font-size: 0.75rem;
					text-transform: uppercase;
					letter-spacing: 0.05em;
					display: inline-flex;
					align-items: center;
					gap: 6px;
				}

				.status-badge::before {
					content: "";
					width: 8px;
					height: 8px;
					border-radius: 50%;
					display: inline-block;
				}

				.status-badge-resolved {
					background: #d1fae5;
					color: #065f46;
				}

				.status-badge-resolved::before {
					background: #10b981;
					animation: pulse 2s infinite;
				}

				.status-badge-pending {
					background: #fef3c7;
					color: #92400e;
				}

				.status-badge-pending::before {
					background: #f59e0b;
					animation: pulse 2s infinite;
				}

				.status-badge-investigating {
					background: #e0f2fe;
					color: #075985;
				}

				.status-badge-investigating::before {
					background: #0284c7;
					animation: pulse 2s infinite;
				}

				.metadata-row {
					display: flex;
					align-items: flex-start;
					gap: 12px;
					padding: 16px 0;
					border-bottom: 1px solid #f3f4f6;
				}

				.metadata-row:last-child {
					border-bottom: none;
				}

				.metadata-icon {
					background: #f3f4f6;
					color: #6b7280;
					width: 32px;
					height: 32px;
					border-radius: 8px;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}

				.metadata-label {
					font-size: 0.75rem;
					text-transform: uppercase;
					letter-spacing: 0.05em;
					color: #9ca3af;
					font-weight: 600;
				}

				.metadata-value {
					font-size: 0.9rem;
					color: #1f2937;
					font-weight: 500;
					margin-top: 2px;
				}

				.gallery-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
					gap: 16px;
					margin-top: 16px;
				}

				.gallery-item {
					border-radius: 12px;
					overflow: hidden;
					aspect-ratio: 4/3;
					cursor: pointer;
					position: relative;
					border: 1px solid var(--glass-border);
				}

				.gallery-item img {
					width: 100%;
					height: 100%;
					object-fit: cover;
					transition: all 0.3s ease;
				}

				.gallery-item:hover img {
					transform: scale(1.08);
				}

				.gallery-overlay {
					position: absolute;
					inset: 0;
					background: rgba(0, 82, 204, 0.4);
					opacity: 0;
					display: flex;
					align-items: center;
					justify-content: center;
					transition: opacity 0.3s;
					color: white;
					font-weight: 600;
				}

				.gallery-item:hover .gallery-overlay {
					opacity: 1;
				}

				.media-container {
					margin-top: 24px;
					background: #f9fafb;
					border: 1px solid var(--glass-border);
					border-radius: 12px;
					padding: 16px;
				}

				.media-header {
					font-size: 0.9rem;
					font-weight: 700;
					color: #374151;
					margin-bottom: 12px;
					display: flex;
					align-items: center;
					gap: 8px;
				}

				.modal-backdrop {
					position: fixed;
					inset: 0;
					background: rgba(15, 23, 42, 0.6);
					backdrop-filter: blur(8px);
					display: flex;
					align-items: center;
					justify-content: center;
					z-index: 1000;
					animation: fadeIn 0.25s ease-out;
				}

				.modal-content {
					background: white;
					border-radius: 20px;
					width: 600px;
					max-width: 90%;
					box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
					overflow: hidden;
					animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
				}

				.modal-header {
					padding: 24px;
					border-bottom: 1px solid #f3f4f6;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				.guard-list-item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 16px 20px;
					border-bottom: 1px solid #f3f4f6;
					transition: background 0.2s;
					cursor: pointer;
				}

				.guard-list-item:hover {
					background: #f9fafb;
				}

				.guard-list-item.selected {
					background: #f0fdf4;
					border-left: 4px solid #10b981;
				}

				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}

				@keyframes slideUp {
					from { transform: translateY(20px); opacity: 0; }
					to { transform: translateY(0); opacity: 1; }
				}

				@keyframes pulse {
					0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
					70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
					100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
				}
			`}} />

			<header className="premium-header">
				<div style={{ display: "flex", alignItems: "center", gap: 20 }}>
					<Link href="/dashboard/securityIncharge/incidents" className="premium-btn premium-btn-secondary" style={{ padding: "8px 12px" }}>
						<BackIcon />
					</Link>
					<div>
						<h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.025em" }}>
							Incident Dossier
						</h1>
						<p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "2px 0 0 0" }}>
							Reference ID: <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{incident._id}</span>
						</p>
					</div>
				</div>

				<div style={{ display: "flex", gap: 12 }}>
					<button
						className="premium-btn premium-btn-secondary"
						onClick={() => fetchIncident()}
						title="Refresh"
					>
						<RefreshIcon /> Refresh
					</button>

					<button
						className="premium-btn premium-btn-secondary"
						onClick={async () => {
							setPdfLoading(true);
							try {
								await generatePdf();
							} catch (err) {
								console.error(err);
								toast.error('Failed to generate PDF');
							} finally {
								setPdfLoading(false);
							}
						}}
					>
						<DownloadIcon /> {pdfLoading ? 'Generating…' : 'Export Dossier'}
					</button>

					<button
						className="premium-btn premium-btn-success"
						onClick={async () => {
							setShowAssignModal(true);
							if (guards.length === 0) {
								setGuardsLoading(true);
								try {
									const resp = await securityGuards.getAll();
									const list = Array.isArray(resp) ? resp : resp?.data || [];
									setGuards(list);
								} catch (err) {
									console.error(err);
									toast.error('Failed to load security personnel');
								} finally {
									setGuardsLoading(false);
								}
							}
						}}
					>
						<ShieldIcon /> Deploy Guard
					</button>
				</div>
			</header>

			<div className={styles.scrollableArea}>
				<div className="premium-container">
					<div className="dossier-grid">
						{/* LEFT COLUMN: Main dossier content */}
						<div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
							<div className="premium-card">
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
									<div>
										<span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.05em" }}>
											{(incident.incidentType || "").toString().replace(/_/g, " ")}
										</span>
										<h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", marginTop: 4, marginBottom: 0 }}>
											{incident.title || "Untitled Incident"}
										</h2>
									</div>
									<div>
										<span className={`status-badge status-badge-${incident.status === 'resolved' ? 'resolved' : incident.status === 'pending' ? 'pending' : 'investigating'}`}>
											{incident.status}
										</span>
									</div>
								</div>

								<div style={{ fontSize: "1.05rem", color: "#374151", lineHeight: 1.7, whiteSpace: "pre-line", borderLeft: "4px solid #e5e7eb", paddingLeft: 16 }}>
									{incident.description || "No description provided."}
								</div>

								{/* IMAGES GALLERY */}
								{images.length > 0 && (
									<div style={{ marginTop: 32 }}>
										<h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", margin: "0 0 12px 0" }}>Evidence Gallery</h3>
										<div className="gallery-grid">
											{images.map((img: any, idx: number) => (
												<div key={idx} className="gallery-item" onClick={() => setSelectedImage(img.url)}>
													<img src={img.url} alt={`evidence-${idx}`} />
													<div className="gallery-overlay">
														<span>Zoom Image</span>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* VIDEO MEDIA */}
								{videoUrl && (
									<div className="media-container">
										<div className="media-header">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
											Video Evidence
										</div>
										<div style={{ borderRadius: 8, overflow: "hidden", background: "#000" }}>
											<video controls style={{ width: "100%", display: "block" }} src={videoUrl} />
										</div>
									</div>
								)}

								{/* AUDIO EVIDENCE */}
								{audioUrl && (
									<div className="media-container">
										<div className="media-header">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
											Audio Log / Dispatch Record
										</div>
										<audio controls src={audioUrl} style={{ width: "100%", marginTop: 8 }} />
									</div>
								)}
							</div>

							{/* LOCATION DETAILS & MAP */}
							{lat !== null && lng !== null && (
								<div className="premium-card">
									<h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
										<MapPinIcon /> Incident Telemetry Map
									</h3>
									<div style={{ height: 380, borderRadius: 14, overflow: "hidden", border: "1px solid var(--glass-border)" }}>
										<MapComponent
											center={[lat, lng]}
											zoom={16}
											markers={[{ id: incident._id || "marker-1", latitude: lat, longitude: lng, title: incident.title || "Incident", type: 'incident', description: incident.locationText || '' }]}
										/>
									</div>
								</div>
							)}
						</div>

						{/* RIGHT COLUMN: Metadata & Control dossiers */}
						<div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
							<div className="premium-card">
								<h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: 20 }}>
									Record Details
								</h3>

								<div className="metadata-row">
									<div className="metadata-icon">
										<UserIcon />
									</div>
									<div>
										<div className="metadata-label">Reporter Name</div>
										<div className="metadata-value">{incident.reporter_id?.username || 'Anonymous / Guest'}</div>
									</div>
								</div>

								<div className="metadata-row">
									<div className="metadata-icon">
										<MailIcon />
									</div>
									<div>
										<div className="metadata-label">Reporter Email</div>
										<div className="metadata-value" style={{ wordBreak: "break-all" }}>{incident.reporter_id?.email || '—'}</div>
									</div>
								</div>

								<div className="metadata-row">
									<div className="metadata-icon">
										<MapPinIcon />
									</div>
									<div>
										<div className="metadata-label">Reported Location</div>
										<div className="metadata-value">{incident.locationText || 'Not specified'}</div>
									</div>
								</div>

								<div className="metadata-row">
									<div className="metadata-icon">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
									</div>
									<div>
										<div className="metadata-label">Coordinates</div>
										<div className="metadata-value" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
											{lat !== null && lng !== null ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : '—'}
										</div>
									</div>
								</div>

								<div className="metadata-row">
									<div className="metadata-icon">
										<CalendarIcon />
									</div>
									<div>
										<div className="metadata-label">Timestamp</div>
										<div className="metadata-value">{new Date(incident.createdAt).toLocaleString()}</div>
									</div>
								</div>

								<div className="metadata-row">
									<div className="metadata-icon">
										<ShieldIcon />
									</div>
									<div>
										<div className="metadata-label">Deployment Status</div>
										<div className="metadata-value" style={{ color: incident.assigned_to ? "#059669" : "#dc2626", fontWeight: 700 }}>
											{incident.assigned_to ? `Assigned to ${incident.assigned_to.username}` : 'Unassigned'}
										</div>
									</div>
								</div>
							</div>

							<div className="premium-card" style={{ background: "linear-gradient(to bottom, #ffffff, #f9fafb)" }}>
								<h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: 12 }}>
									Action Desk
								</h3>
								<p style={{ fontSize: "0.85rem", color: "#6b7280", lineHeight: 1.5, marginBottom: 20 }}>
									Deploy security guards or export a digitally certified incident record as PDF.
								</p>

								<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
									<button
										className="premium-btn premium-btn-primary"
										style={{ justifyContent: "center", width: "100%" }}
										onClick={async () => {
											setShowAssignModal(true);
											if (guards.length === 0) {
												setGuardsLoading(true);
												try {
													const resp = await securityGuards.getAll();
													const list = Array.isArray(resp) ? resp : resp?.data || [];
													setGuards(list);
												} catch (err) {
													console.error(err);
													toast.error('Failed to load security personnel');
												} finally {
													setGuardsLoading(false);
												}
											}
										}}
									>
										<ShieldIcon /> Assign Responder
									</button>

									<button
										className="premium-btn premium-btn-secondary"
										style={{ justifyContent: "center", width: "100%" }}
										onClick={() => {
											navigator.clipboard?.writeText(window.location.href);
											toast.success("Dossier link copied to clipboard");
										}}
									>
										<LinkIcon /> Copy Link
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Zoom Image Lightbox Overlay */}
			{selectedImage && (
				<div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
					<div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }} onClick={(e) => e.stopPropagation()}>
						<img src={selectedImage} alt="dossier-evidence-full" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 16, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", border: "4px solid white" }} />
						<button
							onClick={() => setSelectedImage(null)}
							style={{ position: "absolute", top: -16, right: -16, width: 36, height: 36, borderRadius: "50%", background: "#ef4444", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
						>
							✕
						</button>
					</div>
				</div>
			)}

			{/* Guard Assignment Modal */}
			{showAssignModal && (
				<div className="modal-backdrop" onClick={() => setShowAssignModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<div>
								<h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#111827" }}>Deploy Security Guard</h3>
								<p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#6b7280" }}>Select a guard from active directory</p>
							</div>
							<button
								onClick={() => setShowAssignModal(false)}
								style={{ background: "#f3f4f6", border: "none", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 700 }}
							>
								✕
							</button>
						</div>

						<div style={{ padding: "16px 24px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
							<input
								type="text"
								placeholder="Search responders by name or email..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e5e7eb", outline: "none", fontSize: "0.9rem" }}
							/>
						</div>

						<div style={{ maxHeight: 320, overflowY: "auto" }}>
							{guardsLoading ? (
								<div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
									<div className="spinner" style={{ width: 28, height: 28, border: "2.5px solid #f3f3f3", borderTop: "2.5px solid #0052cc", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 1s linear infinite" }}></div>
									Fetching guards...
								</div>
							) : guards.length === 0 ? (
								<div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>No responders available.</div>
							) : (
								<div>
									{guards
										.filter(g => (g.username || '').toLowerCase().includes(searchQuery.toLowerCase()) || (g.email || '').toLowerCase().includes(searchQuery.toLowerCase()))
										.map((g: any) => (
											<div
												key={g._id}
												className={`guard-list-item ${selectedGuardId === g._id ? 'selected' : ''}`}
												onClick={() => setSelectedGuardId(g._id)}
											>
												<div>
													<div style={{ fontWeight: 700, color: "#1f2937", fontSize: "0.95rem" }}>{g.username}</div>
													<div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }}>{g.email}</div>
												</div>
												<div>
													<button
														className={`premium-btn ${selectedGuardId === g._id ? 'premium-btn-success' : 'premium-btn-secondary'}`}
														style={{ padding: "6px 12px", fontSize: "0.8rem" }}
														onClick={(ev) => {
															ev.stopPropagation();
															setSelectedGuardId(g._id);
														}}
													>
														{selectedGuardId === g._id ? 'Selected' : 'Select'}
													</button>
												</div>
											</div>
										))
									}
								</div>
							)}
						</div>

						<div style={{ padding: "16px 24px", background: "#f9fafb", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", gap: 12 }}>
							<button className="premium-btn premium-btn-secondary" onClick={() => setShowAssignModal(false)}>
								Cancel
							</button>
							<button
								className="premium-btn premium-btn-primary"
								disabled={!selectedGuardId || assignLoading}
								onClick={async () => {
									if (!selectedGuardId) return toast.error('Select a guard first');
									setAssignLoading(true);
									try {
										await incidentAssignment.assign(incident._id, selectedGuardId);
										toast.success('Incident responder deployed successfully');
										setShowAssignModal(false);
										setSelectedGuardId(null);
										fetchIncident();
									} catch (err) {
										console.error(err);
										toast.error('Failed to assign incident');
									} finally {
										setAssignLoading(false);
									}
								}}
							>
								{assignLoading ? 'Deploying...' : 'Confirm Deployment'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
