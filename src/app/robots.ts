import type { MetadataRoute } from "next";
const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/account/", "/checkout", "/cart", "/api/", "/login", "/register", "/forgot-password", "/reset-password"] }, sitemap: `${origin}/sitemap.xml`, host: origin }; }
