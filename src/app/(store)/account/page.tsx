import { Heart, KeyRound, MapPin, Package, UserRound } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { AuthForm } from "@/components/auth-form";
import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth";

export default async function AccountPage() { const user = await requireUser("/account"); return <section className="container account-page"><div className="account-heading"><p className="eyebrow">My Yoranzify</p><h1>Hello, {user.name.split(" ")[0]}.</h1><p>Manage your details, saved pieces, and orders in one place.</p></div><div className="account-grid"><aside className="account-menu"><Link className="account-link active" href="/account"><UserRound size={18} />Overview</Link><Link className="account-link" href="/account/orders"><Package size={18} />My orders</Link><Link className="account-link" href="/account/wishlist"><Heart size={18} />Wishlist</Link><Link className="account-link" href="/account/addresses"><MapPin size={18} />Addresses</Link><Link className="account-link" href="#security"><KeyRound size={18} />Security</Link><LogoutButton /></aside><div className="account-main"><ProfileForm initial={{ name: user.name, email: user.email, mobile: user.mobile }} /><article className="account-panel" id="security"><AuthForm mode="change" /></article></div></div></section>; }
