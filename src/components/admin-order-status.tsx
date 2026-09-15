"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
const next: Record<string, string | undefined> = { PLACED: "CONFIRMED", CONFIRMED: "PACKED", PACKED: "SHIPPED", SHIPPED: "OUT_FOR_DELIVERY", OUT_FOR_DELIVERY: "DELIVERED" };
export function AdminOrderStatus({ id, status }: { id: number; status: string }) { const router = useRouter(); const [busy, setBusy] = useState(false); const target = next[status]; if (!target) return null; return <button disabled={busy} onClick={async () => { setBusy(true); const response = await fetch(`/api/admin/orders/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: target }) }); setBusy(false); if (response.ok) router.refresh(); }}>{busy ? "Updating…" : `Mark ${target.replaceAll("_", " ")}`}</button>; }
