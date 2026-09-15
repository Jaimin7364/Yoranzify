"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function CustomerStateButton({ id, active }: { id: number; active: boolean }) { const router = useRouter(); const [busy, setBusy] = useState(false); return <button className={active ? "danger" : ""} disabled={busy} onClick={async () => { if (active && !confirm("Disable this customer and revoke all active sessions?")) return; setBusy(true); const response = await fetch(`/api/admin/customers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !active }) }); setBusy(false); if (response.ok) router.refresh(); }}>{busy ? "Updating…" : active ? "Disable" : "Enable"}</button>; }
