import type { Metadata } from "next";
import Link from "next/link";
import { Heart, KeyRound, MapPin, Package, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { WishlistPageContent } from "@/components/wishlist";
export const metadata: Metadata = { title: "My wishlist", robots: { index: false, follow: false } };
export default async function WishlistPage() { await requireUser("/account/wishlist"); return <section className="container account-page"><div className="account-heading"><p className="eyebrow">Saved for later</p><h1>Your wishlist.</h1><p>A private edit of pieces that caught your eye.</p></div><div className="account-grid"><aside className="account-menu"><Link className="account-link" href="/account"><UserRound size={18} />Overview</Link><Link className="account-link" href="#"><Package size={18} />My orders</Link><Link className="account-link active" href="/account/wishlist"><Heart size={18} />Wishlist</Link><Link className="account-link" href="/account/addresses"><MapPin size={18} />Addresses</Link><Link className="account-link" href="/account#security"><KeyRound size={18} />Security</Link></aside><main className="account-main"><WishlistPageContent /></main></div></section>; }
