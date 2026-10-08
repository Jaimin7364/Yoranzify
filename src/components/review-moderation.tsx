"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewModeration({ id, status }: { id: number; status: string }) { const router = useRouter(); const [busy, setBusy] = useState(false); async function update(nextStatus: "APPROVED" | "HIDDEN") { setBusy(true); const response = await fetch(`/api/admin/reviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) }); setBusy(false); if (response.ok) router.refresh(); } return <div className="review-moderation"><button className="admin-secondary" disabled={busy || status === "HIDDEN"} onClick={() => update("HIDDEN")}>Hide</button><button className="button button-dark" disabled={busy || status === "APPROVED"} onClick={() => update("APPROVED")}>Approve</button></div>; }
