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
		// fetch image and return dataUrl and intrinsic size
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

			// Key/value table
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
				// Use the autoTable plugin API
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
				// fallback: print key/value pairs
				for (const row of tableBody) {
					if (y > pageHeight - margin) { doc.addPage(); y = margin; }
					doc.setFontSize(10);
					doc.text(`${row[0]}: ${String(row[1] || "")}`, margin, y);
					y += 14;
				}
			}

			// Description
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

			// Media links
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

			// Images
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
			// Do not rethrow — we handle failures gracefully here
		} finally {
			setPdfLoading(false);
		}
	}

	if (loading) {
		return (
			<div className={styles.scrollableArea} style={{ paddingTop: 40 }}>
				<div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Loading incident…</div>
			</div>
		);
	}

	if (!incident) {
		return (
			<div className={styles.scrollableArea} style={{ paddingTop: 40 }}>
				<div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Incident not found.</div>
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
			<header className={styles.header}>
				<div className={styles.headerTitle}>
					<h1>Incident Dossier</h1>
					<p>Detailed incident record and media</p>
				</div>

				<div className={styles.headerActions}>
					<Link href="/dashboard/securityIncharge/incidents">
						<button className={styles.primaryButton} style={{ marginRight: 12 }}>
							← Back to Incidents
						</button>
					</Link>

					<button
						className={styles.primaryButton}
						style={{ background: 'linear-gradient(90deg,#006b44,#00875a)', border: 'none', marginRight: 10 }}
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
						Assign Guard
					</button>

					<button
						className={styles.primaryButton}
						style={{ marginLeft: 0, background: 'linear-gradient(90deg,#0b74a6,#006b44)', border: 'none' }}
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
						{pdfLoading ? 'Generating…' : 'Download PDF'}
					</button>
				</div>
			</header>

			<div className={styles.scrollableArea}>
				<div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>

					<div className={styles.tableContainer} style={{ padding: 20, boxShadow: '0 6px 24px rgba(2,6,23,0.04)', borderRadius: 14 }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
							<div>
								<h2 style={{ margin: 0, fontSize: '1.25rem' }}>{incident.title || "Untitled Incident"}</h2>
								<div style={{ color: "#6b7280", marginTop: 8, fontWeight: 600 }}>{(incident.incidentType || "").toString().replace(/_/g, " ")}</div>
							</div>

							<div>
								<span className={`${styles.badge} ${incident.status === "resolved" ? styles.badgeSuccess : incident.status === "pending" ? styles.badgeWarning : styles.badgeInfo}`}>
									{incident.status}
								</span>
							</div>
						</div>

						<div style={{ marginTop: 18, marginBottom: 6, color: "#334155", lineHeight: 1.6, fontSize: 15 }}>{incident.description || "No description provided."}</div>

						{/* Images */}
						{images.length > 0 && (
							<div style={{ marginTop: 18 }}>
								<h3 style={{ margin: "0 0 8px 0" }}>Images</h3>
								<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
									{images.map((img: any, idx: number) => (
										<div
											key={idx}
											style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--ent-border)", background: '#fff', transition: 'transform 0.18s ease, box-shadow 0.18s ease' }}
											onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
											onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
										>
											<img
												src={img.url}
												alt={`incident-img-${idx}`}
												style={{ width: "100%", height: 140, objectFit: "cover", cursor: "pointer" }}
												onClick={() => setSelectedImage(img.url)}
											/>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Video */}
						{videoUrl && (
							<div style={{ marginTop: 18 }}>
								<h3 style={{ margin: "0 0 8px 0" }}>Video</h3>
								<div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--ent-border)", padding: 8 }}>
									<video controls style={{ width: "100%", borderRadius: 8 }} src={videoUrl} />
								</div>
							</div>
						)}

						{/* Audio */}
						{audioUrl && (
							<div style={{ marginTop: 18 }}>
								<h3 style={{ margin: "0 0 8px 0" }}>Audio</h3>
								<div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--ent-border)", padding: 12 }}>
									<audio controls src={audioUrl} style={{ width: "100%" }} />
								</div>
							</div>
						)}

						{/* Map */}
						{lat !== null && lng !== null && (
							<div style={{ marginTop: 18 }}>
								<h3 style={{ margin: "0 0 8px 0" }}>Location</h3>
								<div style={{ height: 360, borderRadius: 12, overflow: "hidden", border: "1px solid var(--ent-border)" }}>
									<MapComponent
										center={[lat, lng]}
										zoom={16}
										markers={[{ id: incident._id || "marker-1", latitude: lat, longitude: lng, title: incident.title || "Incident", type: 'incident', description: incident.locationText || '' }]}
									/>
								</div>
							</div>
						)}
					</div>

					<aside className={styles.statCard} style={{ padding: 20, position: 'relative' }}>
						<h3 style={{ marginTop: 0 }}>Details</h3>

						<div style={{ marginTop: 12 }}>
							<strong>Reporter</strong>
							<div style={{ marginTop: 6 }}>{incident.reporter_id?.username || 'Unknown'}</div>
							<div style={{ marginTop: 4, fontSize: 13, color: '#6b7280' }}>{incident.reporter_id?.email || '—'}</div>
						</div>

						<div style={{ marginTop: 16 }}>
							<strong>Location Text</strong>
							<div style={{ marginTop: 6, color: '#374151' }}>{incident.locationText || 'Not specified'}</div>
						</div>

						<div style={{ marginTop: 16 }}>
							<strong>Coordinates</strong>
							<div style={{ marginTop: 6, color: '#374151' }}>{lat !== null && lng !== null ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : '—'}</div>
						</div>

						<div style={{ marginTop: 16 }}>
							<strong>Assigned To</strong>
							<div style={{ marginTop: 6 }}>{incident.assigned_to?.username || 'Unassigned'}</div>
							<div style={{ marginTop: 4, fontSize: 13, color: '#6b7280' }}>{incident.assigned_to?.email || ''}</div>
						</div>

						<div style={{ marginTop: 16 }}>
							<strong>Reported</strong>
							<div style={{ marginTop: 6 }}>{new Date(incident.createdAt).toLocaleString()}</div>
						</div>

						<div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
							<button className={styles.primaryButton} onClick={() => navigator.clipboard?.writeText(window.location.href)}>
								Copy Link
							</button>
							<button className={styles.iconButton} onClick={() => fetchIncident()} title="Refresh">⟳</button>
						</div>

						{/* Quick Assign summary */}
						<div style={{ marginTop: 18 }}>
							{incident.assigned_to ? (
								<div style={{ fontSize: 13, color: '#065f46' }}>
									Assigned to <strong>{incident.assigned_to.username}</strong>
								</div>
							) : (
								<div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
									<button
										className={styles.primaryButton}
										style={{ width: '100%' }}
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
										Assign Now
									</button>
								</div>
							)}
						</div>
					</aside>
				</div>
			</div>

			{/* Image Lightbox */}
			{selectedImage && (
				<div onClick={() => setSelectedImage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
					<img src={selectedImage} alt="preview" style={{ maxWidth: '92%', maxHeight: '92%', borderRadius: 12 }} />
				</div>
			)}

			{/* Assign Modal */}
			{showAssignModal && (
				<div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
					<div style={{ width: '760px', maxWidth: '96%', background: '#fff', borderRadius: 12, boxShadow: '0 20px 60px rgba(2,6,23,0.2)', overflow: 'hidden' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--ent-border)' }}>
							<h3 style={{ margin: 0 }}>Assign Security Guard</h3>
							<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
								<input
									type="text"
									placeholder="Search guards..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className={styles.input}
									style={{ width: 220 }}
								/>
								<button className={styles.iconButton} onClick={() => setShowAssignModal(false)}>✕</button>
							</div>
						</div>
						<div style={{ maxHeight: 420, overflow: 'auto' }}>
							{guardsLoading ? (
								<div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading guards…</div>
							) : guards.length === 0 ? (
								<div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No guards found.</div>
							) : (
								<div style={{ display: 'grid', gap: 8, padding: 12 }}>
									{guards.filter(g => (g.username || '').toLowerCase().includes(searchQuery.toLowerCase()) || (g.email || '').toLowerCase().includes(searchQuery.toLowerCase())).map((g: any) => (
										<div key={g._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, border: selectedGuardId === g._id ? '1px solid #c7f0df' : '1px solid var(--ent-border)', background: selectedGuardId === g._id ? 'linear-gradient(90deg, rgba(240,253,244,1), rgba(230,252,240,1))' : '#fff', cursor: 'pointer' }} onClick={() => setSelectedGuardId(g._id)}>
										<div>
											<div style={{ fontWeight: 700 }}>{g.username}</div>
											<div style={{ fontSize: 13, color: '#6b7280' }}>{g.email}</div>
										</div>
										<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
											<button className={styles.primaryButton} style={{ padding: '8px 12px' }} onClick={async (ev) => { ev.stopPropagation(); setSelectedGuardId(g._id); }}>
												Select
											</button>
										</div>
									</div>
								))}
								</div>
							)}
						</div>
						<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: 12, borderTop: '1px solid var(--ent-border)' }}>
							<button className={styles.iconButton} onClick={() => setShowAssignModal(false)}>Cancel</button>
							<button className={styles.primaryButton} disabled={!selectedGuardId || assignLoading} onClick={async () => {
								if (!selectedGuardId) return toast.error('Select a guard first');
								setAssignLoading(true);
								try {
									await incidentAssignment.assign(incident._id, selectedGuardId);
									toast.success('Incident assigned');
									setShowAssignModal(false);
									setSelectedGuardId(null);
									fetchIncident();
								} catch (err) {
									console.error(err);
									toast.error('Failed to assign incident');
								} finally {
									setAssignLoading(false);
								}
							}}>
								{assignLoading ? 'Assigning…' : 'Assign'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

