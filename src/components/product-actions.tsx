"use client";
import { Archive, Pencil, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
export function ProductActions({ id, archived }: { id: number; archived: boolean }) { const router = useRouter(); return <div className="table-actions"><Link aria-label="Edit product" href={`/admin/products/${id}/edit`}><Pencil size={15} /></Link><button aria-label={archived ? "Restore product" : "Archive product"} onClick={async () => { if (!archived && !confirm("Archive this product?")) return; await fetch(archived ? `/api/admin/products/${id}/restore` : `/api/admin/products/${id}`, { method: archived ? "POST" : "DELETE" }); router.refresh(); }}>{archived ? <RotateCcw size={15} /> : <Archive size={15} />}</button></div>; }
