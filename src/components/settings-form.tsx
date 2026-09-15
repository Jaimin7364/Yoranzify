"use client";

import Image from "next/image";
import { Check, ImagePlus, LoaderCircle, Save, Upload } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

export type SettingsView = {
  storeName: string; contactNumber: string | null; whatsappNumber: string | null; contactEmail: string | null; address: string | null;
  instagramUrl: string | null; facebookUrl: string | null; gstNumber: string | null; currency: string;
  shippingChargeRupees: number; freeShippingAboveRupees: number; lowStockThreshold: number; codEnabled: boolean; maintenanceMode: boolean;
  logoMediaId: number | null; faviconMediaId: number | null; logoUrl: string | null; faviconUrl: string | null;
};

function Input({ label, name, defaultValue, type = "text", hint }: { label: string; name: string; defaultValue?: string | number | null; type?: string; hint?: string }) {
  return <label className="settings-field"><span>{label}</span><input name={name} type={type} defaultValue={defaultValue ?? ""} />{hint && <small>{hint}</small>}</label>;
}

function MediaUpload({ label, kind, initialUrl, onUploaded }: { label: string; kind: "LOGO" | "FAVICON"; initialUrl: string | null; onUploaded: (id: number | null, url: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null); const [preview, setPreview] = useState(initialUrl); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return; setBusy(true); setError("");
    const body = new FormData(); body.set("file", file); body.set("kind", kind);
    try { const response = await fetch("/api/admin/media", { method: "POST", body }); const result = await response.json(); if (!response.ok) throw new Error(result.error?.message || "Upload failed"); setPreview(result.media.url); onUploaded(result.media.id, result.media.url); }
    catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "Upload failed"); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  }
  return <div className="media-uploader"><div className="media-preview">{preview ? <Image src={preview} alt={`${label} preview`} fill unoptimized sizes="180px" /> : <ImagePlus size={30} />}</div><div><strong>{label}</strong><p>JPEG, PNG or WebP. Converted and optimized automatically.</p><input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event.target.files?.[0])} /><span className="media-buttons"><button type="button" className="admin-secondary" disabled={busy} onClick={() => input.current?.click()}>{busy ? <LoaderCircle className="spin" size={15} /> : <Upload size={15} />}{busy ? "Processing…" : "Choose image"}</button>{preview && <button type="button" className="admin-secondary" onClick={() => { setPreview(null); onUploaded(null, null); }}>Remove {label.toLowerCase()}</button>}</span>{error && <small className="field-error">{error}</small>}</div></div>;
}

export function SettingsForm({ initial }: { initial: SettingsView }) {
  const [logo, setLogo] = useState({ id: initial.logoMediaId, url: initial.logoUrl });
  const [favicon, setFavicon] = useState({ id: initial.faviconMediaId, url: initial.faviconUrl });
  const [saving, setSaving] = useState(false); const [message, setMessage] = useState(""); const [failed, setFailed] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(""); setFailed(false);
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form);
    const payload = { ...data, shippingChargeRupees: Number(data.shippingChargeRupees), freeShippingAboveRupees: Number(data.freeShippingAboveRupees), lowStockThreshold: Number(data.lowStockThreshold), codEnabled: form.has("codEnabled"), maintenanceMode: form.has("maintenanceMode"), logoMediaId: logo.id, faviconMediaId: favicon.id };
    try { const response = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) throw new Error(result.error?.message || "Settings could not be saved"); setMessage("Store settings saved successfully."); }
    catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Settings could not be saved"); }
    finally { setSaving(false); }
  }
  return <form className="settings-form" onSubmit={save}><section className="settings-section"><div className="settings-section-head"><div><p className="eyebrow">Identity</p><h2>Brand details</h2></div><p>How your store appears to customers.</p></div><div className="settings-fields two"><Input label="Store name" name="storeName" defaultValue={initial.storeName} /><Input label="Currency" name="currency" defaultValue={initial.currency} /></div><div className="upload-grid"><MediaUpload label="Store logo" kind="LOGO" initialUrl={logo.url} onUploaded={(id, url) => setLogo({ id, url })} /><MediaUpload label="Favicon" kind="FAVICON" initialUrl={favicon.url} onUploaded={(id, url) => setFavicon({ id, url })} /></div></section>
    <section className="settings-section"><div className="settings-section-head"><div><p className="eyebrow">Communication</p><h2>Contact & social</h2></div><p>Details shown across the storefront.</p></div><div className="settings-fields two"><Input label="Contact email" name="contactEmail" type="email" defaultValue={initial.contactEmail} /><Input label="Contact number" name="contactNumber" type="tel" defaultValue={initial.contactNumber} /><Input label="WhatsApp number" name="whatsappNumber" type="tel" defaultValue={initial.whatsappNumber} /><Input label="GST number" name="gstNumber" defaultValue={initial.gstNumber} /><Input label="Instagram URL" name="instagramUrl" type="url" defaultValue={initial.instagramUrl} /><Input label="Facebook URL" name="facebookUrl" type="url" defaultValue={initial.facebookUrl} /><label className="settings-field full"><span>Business address</span><textarea name="address" defaultValue={initial.address ?? ""} rows={4} /></label></div></section>
    <section className="settings-section"><div className="settings-section-head"><div><p className="eyebrow">Commerce</p><h2>Shipping & inventory</h2></div><p>All monetary values are stored safely as paise.</p></div><div className="settings-fields three"><Input label="Shipping charge (₹)" name="shippingChargeRupees" type="number" defaultValue={initial.shippingChargeRupees} /><Input label="Free shipping above (₹)" name="freeShippingAboveRupees" type="number" defaultValue={initial.freeShippingAboveRupees} /><Input label="Low stock threshold" name="lowStockThreshold" type="number" defaultValue={initial.lowStockThreshold} /></div><div className="switch-list"><label className="switch-row"><div><strong>Cash on delivery</strong><p>Allow customers to choose COD at checkout.</p></div><input type="checkbox" name="codEnabled" defaultChecked={initial.codEnabled} /></label><label className="switch-row"><div><strong>Maintenance mode</strong><p>Temporarily replace the customer store with a maintenance message.</p></div><input type="checkbox" name="maintenanceMode" defaultChecked={initial.maintenanceMode} /></label></div></section>
    <div className="settings-save">{message && <p className={failed ? "save-error" : "save-success"}>{!failed && <Check size={16} />}{message}</p>}<button className="button button-dark" disabled={saving}>{saving ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />}{saving ? "Saving…" : "Save settings"}</button></div></form>;
}
