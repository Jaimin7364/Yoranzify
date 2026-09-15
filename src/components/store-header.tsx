"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart";

type NavCategory = { name: string; slug: string };

export function StoreHeader({ storeName = "Yoranzify", freeShippingAboveRupees = 1999, logoUrl, categories = [] }: { storeName?: string; freeShippingAboveRupees?: number; logoUrl?: string | null; categories?: NavCategory[] }) {
  const { cart, setOpen: setCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ name: string; slug: string; category: string }[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  useEffect(() => { if (searchQuery.trim().length < 2) return; const controller = new AbortController(); const timer = window.setTimeout(async () => { try { const response = await fetch(`/api/products?q=${encodeURIComponent(searchQuery.trim())}` , { signal: controller.signal }); if (response.ok) setSuggestions((await response.json()).products.slice(0, 5)); } catch { /* A new keystroke cancels the previous suggestion request. */ } }, 180); return () => { window.clearTimeout(timer); controller.abort(); }; }, [searchQuery]);

  return <>
    <div className="announcement">Complimentary shipping on orders over ₹{freeShippingAboveRupees.toLocaleString("en-IN")}</div>
    <header className="site-header">
      <div className="container header-row">
        <nav className="nav-links desktop-only" aria-label="Main navigation">
          <Link href="/shop?collection=new">New in</Link>{categories.slice(0, 2).map((category) => <Link href={`/categories/${category.slug}`} key={category.slug}>{category.name}</Link>)}
        </nav>
        <button className="icon-button mobile-only focus-ring" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
        <Link className={`brand focus-ring ${logoUrl ? "brand-with-logo" : ""}`} href="/">{logoUrl ? <Image src={logoUrl} alt={storeName} width={180} height={52} unoptimized priority /> : storeName.toUpperCase()}</Link>
        <div className="header-actions">
          <button className="icon-button focus-ring" aria-label="Search" aria-expanded={searchOpen} onClick={() => setSearchOpen((v) => !v)}><Search size={19} /></button>
          <Link className="icon-button desktop-only focus-ring" aria-label="Account" href="/account"><UserRound size={19} /></Link>
          <Link className="icon-button desktop-only focus-ring" aria-label="Wishlist" href="/account/wishlist"><Heart size={19} /></Link>
          <button className="icon-button focus-ring" style={{ position: "relative" }} aria-label={`Shopping bag with ${cart.itemCount} items`} onClick={() => setCartOpen(true)}><ShoppingBag size={19} />{cart.itemCount > 0 && <span className="badge">{cart.itemCount}</span>}</button>
        </div>
      </div>
      {searchOpen && <div className="search-panel open">
        <form className="container search-inner" action="/shop"><Search size={22} /><input ref={searchRef} name="q" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); if (event.target.value.trim().length < 2) setSuggestions([]); }} aria-label="Search products" autoComplete="off" placeholder="What are you looking for?" /><button className="search-submit" type="submit">Search catalogue</button><button type="button" className="icon-button" aria-label="Close search" onClick={() => setSearchOpen(false)}><X size={20} /></button>{suggestions.length > 0 && <div className="search-suggestions" role="listbox" aria-label="Product suggestions">{suggestions.map((product) => <Link role="option" key={product.slug} href={`/products/${product.slug}`} onClick={() => setSearchOpen(false)}><strong>{product.name}</strong><small>{product.category}</small></Link>)}<Link className="suggestion-all" href={`/shop?q=${encodeURIComponent(searchQuery.trim())}`}>View all results</Link></div>}</form>
      </div>}
    </header>
    {menuOpen && <aside className="mobile-menu open" aria-label="Mobile menu">
      <div className="mobile-menu-head"><span className={`brand ${logoUrl ? "brand-with-logo" : ""}`}>{logoUrl ? <Image src={logoUrl} alt={storeName} width={160} height={46} unoptimized /> : storeName.toUpperCase()}</span><button className="icon-button focus-ring" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X /></button></div>
      <nav className="mobile-nav" aria-label="Mobile navigation"><Link onClick={() => setMenuOpen(false)} href="/shop?collection=new">New in</Link>{categories.map((category) => <Link onClick={() => setMenuOpen(false)} href={`/categories/${category.slug}`} key={category.slug}>{category.name}</Link>)}<Link onClick={() => setMenuOpen(false)} href="/shop?collection=sale">Sale</Link></nav>
    </aside>}
  </>;
}
