import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="auth-page"><Link className="brand auth-logo" href="/">YORANZIFY</Link><section className="auth-visual"><div className="auth-visual-copy"><p className="eyebrow">The art of dressing well</p><blockquote>“Style should feel like yourself—only clearer.”</blockquote><span>Yoranzify journal · Issue 01</span></div></section><section className="auth-content">{children}<p className="auth-legal">By continuing, you agree to our Terms and Privacy Policy.</p></section></main>;
}
