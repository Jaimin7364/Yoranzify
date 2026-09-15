import type { Metadata } from "next";
import Link from "next/link";
import { Heart, KeyRound, MapPin, Package, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listAddresses } from "@/lib/profile";
import { AddressManager, type AddressView } from "@/components/address-manager";
export const metadata: Metadata = { title: "My addresses", robots: { index: false, follow: false } };
export default async function AddressesPage() { const user = await requireUser("/account/addresses"); const addresses = await listAddresses(user.id); return <section className="container account-page"><div className="account-heading"><p className="eyebrow">Where your edit arrives</p><h1>Addresses.</h1><p>Keep delivery details ready for a smoother checkout.</p></div><div className="account-grid"><aside className="account-menu"><Link className="account-link" href="/account"><UserRound size={18} />Overview</Link><Link className="account-link" href="#"><Package size={18} />My orders</Link><Link className="account-link" href="/account/wishlist"><Heart size={18} />Wishlist</Link><Link className="account-link active" href="/account/addresses"><MapPin size={18} />Addresses</Link><Link className="account-link" href="/account#security"><KeyRound size={18} />Security</Link></aside><main className="account-main"><article className="account-panel"><AddressManager initial={addresses as AddressView[]} /></article></main></div></section>; }
