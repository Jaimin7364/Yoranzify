"use client";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

type Banner = { id: number; desktopMediaId: number; mobileMediaId: number | null; altText: string; title: string; subtitle: string | null; buttonText: string | null; buttonUrl: string | null };
export function HomeBannerCarousel({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0); const [paused, setPaused] = useState(false); const current = banners[active];
  useEffect(() => { if (paused || banners.length < 2) return; const timer = window.setInterval(() => setActive((value) => (value + 1) % banners.length), 6000); return () => window.clearInterval(timer); }, [paused, banners.length]);
  const move = (direction: number) => setActive((value) => (value + direction + banners.length) % banners.length);
  return <section className="cms-hero" aria-roledescription="carousel" aria-label="Featured collections" tabIndex={0} onKeyDown={(event) => { if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
    <picture key={current.id}><source media="(max-width: 700px)" srcSet={`/api/media/${current.mobileMediaId || current.desktopMediaId}`} /><img src={`/api/media/${current.desktopMediaId}`} alt={current.altText} /></picture>
    {current.buttonText && current.buttonUrl && <Link className="banner-buy-button focus-ring" href={current.buttonUrl} aria-label={`${current.buttonText}: ${current.title}`}>{current.buttonText}</Link>}
    {banners.length > 1 && <div className="carousel-controls"><button aria-label="Previous banner" onClick={() => move(-1)}><ChevronLeft /></button><span aria-live="polite">{active + 1} / {banners.length}</span><button aria-label="Next banner" onClick={() => move(1)}><ChevronRight /></button><button aria-label={paused ? "Play carousel" : "Pause carousel"} onClick={() => setPaused(!paused)}>{paused ? <Play /> : <Pause />}</button></div>}
  </section>;
}
