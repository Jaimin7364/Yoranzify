"use client";

import Image from "next/image";
import Link from "next/link";
import { WishlistButton } from "./wishlist";

export function ProductCard({ productId, name, meta, price, oldPrice, art = "art-one", tag, href, imageUrl }: { productId?: number; name: string; meta: string; price: string; oldPrice?: string; art?: string; tag?: string; href?: string; imageUrl?: string }) {
  return <article className="product-card">
    <div className="product-visual">
      {imageUrl ? <Link href={href ?? "#"}><Image className="product-art" src={imageUrl} alt={`${name} product preview`} fill unoptimized sizes="(max-width: 580px) 77vw, 25vw" /></Link> : <div className={`product-art ${art}`} role="img" aria-label={`${name} product preview`} />}
      {tag && <span className="product-tag">{tag}</span>}
      {productId && <WishlistButton productId={productId} name={name} />}
    </div>
    <div className="product-info"><div><h3 className="product-name">{href ? <Link href={href}>{name}</Link> : name}</h3><p className="product-meta">{meta}</p></div><span className="price">{oldPrice && <del>{oldPrice}</del>}{price}</span></div>
  </article>;
}
