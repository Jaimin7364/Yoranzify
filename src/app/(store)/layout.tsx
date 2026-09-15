import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { getSiteSettings } from "@/lib/settings";
import { getCategoryTree } from "@/lib/categories";
import { CartProvider } from "@/components/cart";
import { WishlistProvider } from "@/components/wishlist";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategoryTree(true)]);
  if (settings?.maintenanceMode) return <main className="maintenance-page"><div><span className="brand">{settings.storeName.toUpperCase()}</span><p className="eyebrow">A short intermission</p><h1>We’re tailoring something special.</h1><p>The store is receiving a little care. Please visit us again shortly.</p></div></main>;
  return <CartProvider><WishlistProvider><a className="skip-link" href="#main-content">Skip to main content</a><StoreHeader categories={categories.map(({ name, slug }) => ({ name, slug }))} storeName={settings?.storeName} logoUrl={settings?.logo ? `/api/media/${settings.logo.id}` : null} freeShippingAboveRupees={(settings?.freeShippingAbovePaise ?? 199900) / 100} /><main id="main-content">{children}</main><StoreFooter storeName={settings?.storeName} contactEmail={settings?.contactEmail} instagramUrl={settings?.instagramUrl} facebookUrl={settings?.facebookUrl} /></WishlistProvider></CartProvider>;
}
