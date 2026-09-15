import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Yoranzify — Modern Indian Fashion", template: "%s | Yoranzify" },
  description: "Considered clothing for expressive, everyday living.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  alternates: { canonical: "/" },
  applicationName: "Yoranzify",
  openGraph: { type: "website", siteName: "Yoranzify", title: "Yoranzify — Modern Indian Fashion", description: "Considered clothing for expressive, everyday living.", images: [{ url: "/images/yoranzify-hero.png", width: 1200, height: 630, alt: "Yoranzify contemporary fashion" }] },
  twitter: { card: "summary_large_image", title: "Yoranzify — Modern Indian Fashion", description: "Considered clothing for expressive, everyday living.", images: ["/images/yoranzify-hero.png"] }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: "Yoranzify", url: origin, logo: `${origin}/images/yoranzify-hero.png` };
  return <html lang="en" data-scroll-behavior="smooth"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} />{children}</body></html>;
}
