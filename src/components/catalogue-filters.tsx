"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import type { CatalogueParams } from "@/lib/catalogue";

type Facets = { categories: { name: string; slug: string }[]; colors: { name: string; hex: string }[]; sizes: { name: string }[]; brands: string[] };

export function CatalogueFilters({ params, facets }: { params: CatalogueParams; facets: Facets }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="filter-trigger button button-light" type="button" onClick={() => setOpen(true)}><SlidersHorizontal size={16} /> Filters</button>
    <aside className={`catalogue-filters ${open ? "open" : ""}`} aria-label="Product filters">
      <div className="filter-mobile-head"><strong>Refine</strong><button type="button" className="icon-button" aria-label="Close filters" onClick={() => setOpen(false)}><X /></button></div>
      <form action="/shop" method="get">
        {params.q && <input type="hidden" name="q" value={params.q} />}{params.collection && <input type="hidden" name="collection" value={params.collection} />}
        <label className="filter-field"><span>Category</span><select name="category" defaultValue={params.category}><option value="">All categories</option>{facets.categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
        <label className="filter-field"><span>Department</span><select name="gender" defaultValue={params.gender.toLowerCase()}><option value="">Everyone</option><option value="women">Women</option><option value="men">Men</option><option value="unisex">Unisex</option><option value="kids">Kids</option></select></label>
        <fieldset><legend>Sizes</legend><div className="filter-chips">{facets.sizes.map((size) => <label key={size.name}><input type="checkbox" name="size" value={size.name} defaultChecked={params.sizes.includes(size.name)} /><span>{size.name}</span></label>)}</div></fieldset>
        <fieldset><legend>Colours</legend><div className="filter-checks">{facets.colors.map((color) => <label key={color.name}><input type="checkbox" name="color" value={color.name} defaultChecked={params.colors.includes(color.name)} /><i style={{ background: color.hex }} />{color.name}</label>)}</div></fieldset>
        {facets.brands.length > 0 && <label className="filter-field"><span>Brand</span><select name="brand" defaultValue={params.brand}><option value="">All brands</option>{facets.brands.map((brand) => <option key={brand}>{brand}</option>)}</select></label>}
        <fieldset><legend>Price</legend><div className="price-filter"><label>Min ₹<input name="minPrice" type="number" min="0" defaultValue={params.minPrice === null ? "" : params.minPrice / 100} /></label><label>Max ₹<input name="maxPrice" type="number" min="0" defaultValue={params.maxPrice === null ? "" : params.maxPrice / 100} /></label></div></fieldset>
        <label className="stock-check"><input name="availability" value="in-stock" type="checkbox" defaultChecked={params.availability === "in-stock"} /> Only show in-stock pieces</label>
        <button className="button button-dark" type="submit">Show pieces</button><Link className="clear-filters" href="/shop">Clear all</Link>
      </form>
    </aside>{open && <button className="filter-backdrop" aria-label="Close filters" onClick={() => setOpen(false)} />}
  </>;
}
