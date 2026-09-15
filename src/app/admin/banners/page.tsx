import { HomepageManager } from "@/components/homepage-manager";
import { bannerInclude, ensureHomepageSections } from "@/lib/homepage-cms";
import { prisma } from "@/lib/prisma";
export default async function BannersPage() { const [banners, sections] = await Promise.all([prisma.banner.findMany({ include: bannerInclude, orderBy: [{ position: "asc" }, { id: "asc" }] }), ensureHomepageSections()]); return <main className="admin-main cms-page"><HomepageManager initialBanners={banners} initialSections={sections} /></main>; }
