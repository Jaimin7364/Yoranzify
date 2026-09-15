import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart";
export const metadata: Metadata = { title: "Shopping bag", robots: { index: false, follow: false } };
export default function CartPage() { return <section className="container cart-page"><CartPageContent /></section>; }
