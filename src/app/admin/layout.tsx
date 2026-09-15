import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false, noarchive: true } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="admin-shell"><aside className="admin-sidebar"><Link className="brand" href="/">YORANZIFY</Link><p className="eyebrow admin-label">Workspace</p><AdminNav /></aside>{children}</div>;
}
