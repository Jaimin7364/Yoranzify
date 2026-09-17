import { SupplierManager } from "@/components/supplier-manager";
import { prisma } from "@/lib/prisma";

export default async function SuppliersPage() { const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } }); return <main className="admin-main settings-page"><SupplierManager initial={suppliers} /></main>; }
