import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, MapPinned } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { orderInclude } from "@/lib/orders";
import { AdminOrderEditor } from "@/components/admin-order-editor";

const money = (value: number) => `₹${(value / 100).toLocaleString("en-IN")}`;

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const order = await prisma.order.findUnique({ where: { id: Number((await params).id) }, include: { ...orderInclude, user: true, reservations: true } });
  if (!order) notFound();
  const editorOrder = { id: order.id, status: order.status, fulfillmentMethod: order.fulfillmentMethod, courierName: order.courierName, trackingNumber: order.trackingNumber, trackingUrl: order.trackingUrl, internalNotes: order.internalNotes };

  return <main className="admin-main settings-page">
    <Link className="back-link" href="/admin/orders"><ArrowLeft size={14} />Orders</Link>
    <header className="admin-top order-admin-title"><div><p className="eyebrow">{order.orderNumber}</p><h1>{order.user.name}</h1><p>{order.user.email} · {order.user.mobile}</p></div><div><span className={`order-status ${order.status.toLowerCase()}`}>{order.status.replaceAll("_", " ")}</span><strong>{money(order.totalPaise)}</strong></div></header>
    <section className="order-print-actions"><div><p className="eyebrow">Packing documents</p><h2>Invoice & shipping label</h2></div><Link className="button" href={`/admin/orders/${order.id}/invoice`}><FileText size={16} />Tax invoice</Link><Link className="button button-dark" href={`/admin/orders/${order.id}/shipping-label`}><MapPinned size={16} />Address label</Link></section>
    <div className="admin-order-grid"><div><section className="order-items"><h2>Order items</h2>{order.items.map((item) => <article key={item.id}><div><strong>{item.productName}</strong><small>{item.colorName} / {item.sizeName} · {item.sku} · Qty {item.quantity}</small></div><span>{money(item.lineTotalPaise)}</span></article>)}</section><section className="order-timeline"><h2>Status timeline</h2>{order.history.map((item) => <div key={item.id}><i /><div><strong>{item.status.replaceAll("_", " ")}</strong><small>{new Date(item.createdAt).toLocaleString("en-IN")} · {item.note}</small></div></div>)}</section></div><aside><AdminOrderEditor key={`${order.id}-${order.updatedAt.toISOString()}`} order={editorOrder} /><section className="admin-delivery"><h2>Delivery address</h2><p>{order.addressFullName}<br />{order.addressLine1}<br />{order.addressCity}, {order.addressState} {order.addressPostalCode}<br />+91 {order.addressMobile}</p></section></aside></div>
  </main>;
}
