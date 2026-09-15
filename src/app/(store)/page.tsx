import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomepageSectionType, Prisma } from "@prisma/client";
import { HomeBannerCarousel } from "@/components/home-banner-carousel";
import { ProductCard } from "@/components/product-card";
import { publicHomepageContent } from "@/lib/homepage-cms";
import { prisma } from "@/lib/prisma";

const ticker = ["New season, softer forms", "Free shipping over ₹1,999", "Easy 7-day returns", "Made for everyday expression"];
const publicWhere = { status: "ACTIVE" as const, archivedAt: null, category: { archivedAt: null, isVisible: true } };
const productInclude = { category: true, images: { include: { media: true }, orderBy: { position: "asc" as const }, take: 1 } } satisfies Prisma.ProductInclude;
type Item = Prisma.ProductGetPayload<{ include: typeof productInclude }>;
const categoryInclude = { image: true } satisfies Prisma.CategoryInclude;
type HomeCategory = Prisma.CategoryGetPayload<{ include: typeof categoryInclude }>;

export default async function HomePage() {
  const [{ banners, sections }, newArrivals, featured, bestSellers, sale, trending, homeCategories] = await Promise.all([
    publicHomepageContent(), prisma.product.findMany({ where: publicWhere, include: productInclude, orderBy: { createdAt: "desc" }, take: 8 }), prisma.product.findMany({ where: { ...publicWhere, isFeatured: true }, include: productInclude, orderBy: { createdAt: "desc" }, take: 4 }), prisma.product.findMany({ where: { ...publicWhere, isBestSeller: true }, include: productInclude, orderBy: [{ deliveredSalesCount: "desc" }, { createdAt: "desc" }], take: 4 }), prisma.product.findMany({ where: { ...publicWhere, salePricePaise: { not: null } }, include: productInclude, orderBy: { createdAt: "desc" }, take: 4 }), prisma.product.findMany({ where: publicWhere, include: productInclude, orderBy: [{ deliveredSalesCount: "desc" }, { createdAt: "desc" }], take: 4 }), prisma.category.findMany({ where: { parentId: null, archivedAt: null, isVisible: true }, include: categoryInclude, orderBy: [{ displayOrder: "asc" }, { name: "asc" }], take: 6 })
  ]);
  const blockData = { banners, newItems: newArrivals, featured, bestSellers, sale, trending, categories: homeCategories };
  return <>{sections.map((section) => <HomepageBlock key={section.id} type={section.type} title={section.title} subtitle={section.subtitle} linkUrl={section.linkUrl} {...blockData} />)}<div className="ticker" aria-label="Store benefits"><div className="ticker-track">{[...ticker, ...ticker].map((item, index) => <span key={`${item}-${index}`}>✦ &nbsp; {item}</span>)}</div></div></>;
}

type BlockProps = { type: HomepageSectionType; title: string | null; subtitle: string | null; linkUrl: string | null; banners: { id: number; desktopMediaId: number; mobileMediaId: number | null; altText: string; title: string; subtitle: string | null; buttonText: string | null; buttonUrl: string | null }[]; categories: HomeCategory[]; newItems: Item[]; featured: Item[]; bestSellers: Item[]; sale: Item[]; trending: Item[] };
function HomepageBlock(props: BlockProps) {
  if (props.type === "HERO") return props.banners.length ? <HomeBannerCarousel banners={props.banners} /> : <FallbackHero />;
  if (props.type === "CATEGORIES") return props.categories.length ? <section className="container section" id="categories"><SectionHead eyebrow={props.subtitle || "Find your point of view"} title={props.title || "Shop by category"} href={props.linkUrl || "/shop"} /><div className="category-grid">{props.categories.map((category) => <Link className={`category-card focus-ring ${category.image ? "has-image" : ""}`} href={`/categories/${category.slug}`} key={category.id}>{category.image && <Image src={`/api/media/${category.image.id}`} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" />}<div className="category-card-info"><div>{category.description && <p className="eyebrow">{category.description}</p>}<h3>{category.name}</h3></div><span className="round-arrow"><ArrowRight /></span></div></Link>)}</div></section> : null;
  if (props.type === "NEW_ARRIVALS") return props.newItems.length ? <section className="container section" id="new-in"><SectionHead eyebrow={props.subtitle || "Just landed"} title={props.title || "The new edit"} href={props.linkUrl || "/shop"} /><div className="product-grid">{props.newItems.map((item) => <HomeProduct item={item} key={item.id} />)}</div></section> : null;
  if (props.type === "FEATURED_COLLECTION" && props.featured.length) return <Collection eyebrow={props.subtitle || "The atelier selection"} title={props.title || "Featured pieces"} href={props.linkUrl || "/shop?collection=featured"} items={props.featured} />;
  if (props.type === "BEST_SELLERS" && props.bestSellers.length) return <Collection eyebrow={props.subtitle || "Loved on repeat"} title={props.title || "Best sellers"} href={props.linkUrl || "/shop?collection=bestsellers"} items={props.bestSellers} />;
  if (props.type === "OFFERS" && props.sale.length) return <Collection eyebrow={props.subtitle || "Considered prices"} title={props.title || "The sale edit"} href={props.linkUrl || "/shop?collection=sale"} items={props.sale} />;
  if (props.type === "TRENDING" && props.trending.length) return <Collection eyebrow={props.subtitle || "Of the moment"} title={props.title || "Trending now"} href={props.linkUrl || "/shop"} items={props.trending} />;
  if (props.type === "GALLERY") return <section className="story"><div className="story-grid"><div className="story-art" aria-hidden="true" /><div className="story-copy"><p className="eyebrow">{props.subtitle || "Our point of view"}</p><h2>{props.title || "Fewer pieces. More possibilities."}</h2><Link className="text-link" href={props.linkUrl || "/shop"}>Discover the edit <ArrowRight size={15} /></Link></div></div></section>;
  if (props.type === "TESTIMONIALS") return <section className="container section testimonial-home"><p className="eyebrow">Community notes</p><h2 className="section-title">{props.title || "Worn and loved"}</h2><blockquote>“Beautifully considered pieces that feel effortless from the first wear.”</blockquote></section>;
  return null;
}
function FallbackHero() { return <section className="hero"><Image className="hero-image" src="/images/yoranzify-hero.png" alt="Two models wearing Yoranzify's neutral contemporary collection" fill priority sizes="100vw" /><div className="hero-shade" /><div className="container hero-content"><p className="eyebrow">The Autumn Edit · 2026</p><h1>Quiet form.<em>Bold presence.</em></h1><p className="hero-copy">A study in clean lines, lived-in texture and effortless shape—pieces designed to feel entirely your own.</p><Link className="button button-light focus-ring" href="#new-in">Explore the edit <ArrowRight size={16} /></Link></div></section>; }
function SectionHead({ eyebrow, title, href }: { eyebrow: string; title: string; href: string }) { return <div className="section-head"><div><p className="eyebrow">{eyebrow}</p><h2 className="section-title">{title}</h2></div><Link className="text-link" href={href}>View all <ArrowRight size={15} /></Link></div>; }
function Collection({ eyebrow, title, href, items }: { eyebrow: string; title: string; href: string; items: Item[] }) { return <section className="container section"><SectionHead eyebrow={eyebrow} title={title} href={href} /><div className="product-grid">{items.map((item) => <HomeProduct item={item} key={item.id} />)}</div></section>; }
function HomeProduct({ item }: { item: Item }) { return <ProductCard name={item.name} meta={`${item.category.name}${item.brand ? ` · ${item.brand}` : ""}`} price={`₹${((item.salePricePaise ?? item.regularPricePaise) / 100).toLocaleString("en-IN")}`} oldPrice={item.salePricePaise ? `₹${(item.regularPricePaise / 100).toLocaleString("en-IN")}` : undefined} tag={item.isBestSeller ? "Bestseller" : item.salePricePaise ? "Sale" : undefined} href={`/products/${item.slug}`} imageUrl={item.images[0] ? `/api/media/${item.images[0].media.id}` : undefined} />; }
