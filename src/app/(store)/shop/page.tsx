import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { CatalogueFilters } from "@/components/catalogue-filters";
import { ProductCard } from "@/components/product-card";
import { canonicalCatalogueQuery, getCatalogueFacets, lowestEffectivePrice, parseCatalogueParams, queryCatalogue } from "@/lib/catalogue";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = parseCatalogueParams(await searchParams);
  const query = canonicalCatalogueQuery(params);
  const title = params.q ? `Search: ${params.q}` : params.collection || "Shop all";
  return { title, description: "Browse Yoranzify clothing by category, colour, size, availability and price.", alternates: { canonical: `/shop${query ? `?${query}` : ""}` } };
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = parseCatalogueParams(await searchParams);
  const [result, facets] = await Promise.all([queryCatalogue(params), getCatalogueFacets()]);
  const pageHref = (page: number) => { const query = canonicalCatalogueQuery({ ...params, page }); return `/shop${query ? `?${query}` : ""}`; };
  const collectionNames = { featured: "Featured pieces", new: "New arrivals", bestsellers: "Best sellers", sale: "The sale edit" };
  const heading = params.q ? `Results for “${params.q}”` : params.collection ? collectionNames[params.collection] : "All pieces";

  return <section className="container catalogue-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Shop</span></nav>
    <header className="catalogue-heading">
      <div><p className="eyebrow">The full collection</p><h1>{heading}</h1><p>{result.total} {result.total === 1 ? "piece" : "pieces"} found</p></div>
      <form className="catalogue-sort" action="/shop">
        <input type="hidden" name="q" value={params.q} /><input type="hidden" name="category" value={params.category} /><input type="hidden" name="gender" value={params.gender.toLowerCase()} />
        {params.sizes.map((size) => <input key={size} type="hidden" name="size" value={size} />)}
        {params.colors.map((color) => <input key={color} type="hidden" name="color" value={color} />)}
        <input type="hidden" name="collection" value={params.collection} />
        <label>Sort by <select name="sort" defaultValue={params.sort}><option value="newest">Newest</option><option value="popular">Most popular</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label><button type="submit">Apply</button>
      </form>
    </header>
    <div className="catalogue-layout">
      <CatalogueFilters params={params} facets={facets} />
      <div className="catalogue-results">
        {result.products.length ? <div className="catalogue-grid">{result.products.map((product) => {
          const price = lowestEffectivePrice(product);
          const oldPrice = product.salePricePaise ? `₹${(product.regularPricePaise / 100).toLocaleString("en-IN")}` : undefined;
          const tag = product.isNewArrival ? "New" : product.isBestSeller ? "Bestseller" : product.salePricePaise ? "Sale" : undefined;
          return <ProductCard key={product.id} productId={product.id} name={product.name} meta={`${product.category.name}${product.brand ? ` · ${product.brand}` : ""}`} price={`₹${(price / 100).toLocaleString("en-IN")}`} oldPrice={oldPrice} tag={tag} href={`/products/${product.slug}`} imageUrl={product.images[0] ? `/api/media/${product.images[0].media.id}` : undefined} />;
        })}</div> : <div className="catalogue-empty"><Search /><h2>No pieces match your edit.</h2><p>Try removing a filter or searching for another style.</p><Link className="button button-dark" href="/shop">Clear filters</Link></div>}
        {result.pages > 1 && <nav className="pagination" aria-label="Catalogue pages"><Link aria-disabled={result.page === 1} href={pageHref(Math.max(1, result.page - 1))}><ChevronLeft /> Previous</Link><span>Page {result.page} of {result.pages}</span><Link aria-disabled={result.page === result.pages} href={pageHref(Math.min(result.pages, result.page + 1))}>Next <ChevronRight /></Link></nav>}
      </div>
    </div>
  </section>;
}
