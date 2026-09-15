import { redirect } from "next/navigation";
import { CheckoutFlow } from "@/components/checkout-flow";
import { requireUser } from "@/lib/auth";
import { cartSnapshot } from "@/lib/cart";
import { listAddresses } from "@/lib/profile";
import type { AddressView } from "@/components/address-manager";
import { prisma } from "@/lib/prisma";
import type { CartView } from "@/components/cart";
export default async function CheckoutPage() { const user = await requireUser("/checkout"); const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } }); const [cart, addresses] = await Promise.all([cartSnapshot({ userId: user.id }, settings?.shippingChargePaise, settings?.freeShippingAbovePaise), listAddresses(user.id)]); if (!cart.items.length) redirect("/cart"); return <section className="container checkout-page"><header><p className="eyebrow">Secure checkout</p><h1>Complete your order.</h1><p>Every price and stock level will be verified once more when you place it.</p></header><CheckoutFlow addresses={addresses as AddressView[]} cart={cart as CartView} codEnabled={settings?.codEnabled ?? true} /></section>; }
