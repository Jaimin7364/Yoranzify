"use client";
import Link from "next/link";
import { BadgePercent, BarChart3, Boxes, Building2, Images, LayoutDashboard, Mail, Package, Settings, ShoppingBag, Star, Tags, Users } from "lucide-react";
import { usePathname } from "next/navigation";

const nav = [["Overview", "/admin", LayoutDashboard], ["Products", "/admin/products", ShoppingBag], ["Categories", "/admin/categories", Tags], ["Suppliers", "/admin/suppliers", Building2], ["Offers", "/admin/offers", BadgePercent], ["Orders", "/admin/orders", Package], ["Reviews", "/admin/reviews", Star], ["Inventory", "/admin/inventory", Boxes], ["Customers", "/admin/customers", Users], ["Banners", "/admin/banners", Images], ["Email", "/admin/notifications", Mail], ["Analytics", "/admin/analytics", BarChart3], ["Settings", "/admin/settings", Settings]] as const;

export function AdminNav() {
  const pathname = usePathname();
  return <nav className="admin-nav">{nav.map(([label, href, Icon]) => <Link className={pathname === href ? "active" : ""} href={href} key={label}><Icon size={17} />{label}</Link>)}</nav>;
}
