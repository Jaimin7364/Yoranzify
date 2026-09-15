import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function StoreFooter({ storeName = "Yoranzify", contactEmail, instagramUrl, facebookUrl }: { storeName?: string; contactEmail?: string | null; instagramUrl?: string | null; facebookUrl?: string | null }) {
  return <footer className="container">
    <section className="newsletter">
      <div><p className="eyebrow">The Yoranzify edit</p><h2>Notes on style,<br />sent occasionally.</h2></div>
      <form className="newsletter-form"><input type="email" aria-label="Email address" placeholder="Your email address" /><button aria-label="Subscribe"><ArrowRight /></button></form>
    </section>
    <div className="footer">
      <div className="footer-grid">
        <div className="footer-brand"><Link className="brand" href="/">{storeName.toUpperCase()}</Link><p>Considered silhouettes, honest materials, and clothes made for the rhythm of real life.</p></div>
        <div><h3>Shop</h3><div className="footer-links"><Link href="#new-in">New arrivals</Link><Link href="#women">Women</Link><Link href="#men">Men</Link><Link href="#sale">Sale</Link></div></div>
        <div><h3>Help</h3><div className="footer-links"><Link href="/shipping">Shipping</Link><Link href="/returns">Returns</Link><Link href="/cancellation">Cancellations</Link><Link href="/contact">Contact</Link></div></div>
        <div><h3>Connect</h3><div className="footer-links">{instagramUrl && <Link href={instagramUrl}>Instagram</Link>}{facebookUrl && <Link href={facebookUrl}>Facebook</Link>}{contactEmail && <a href={`mailto:${contactEmail}`}>Email us</a>}{!instagramUrl && !facebookUrl && !contactEmail && <span>Social links coming soon</span>}</div></div>
      </div>
      <div className="footer-bottom"><span>© 2026 {storeName}. All rights reserved.</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · <Link href="/about">About</Link></span><span>Designed with intention in India.</span></div>
    </div>
  </footer>;
}
