import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { const { token } = await searchParams; return token ? <AuthForm mode="reset" token={token} /> : <div className="auth-card"><p className="eyebrow">Invalid link</p><h1>This reset link is incomplete.</h1><p className="auth-intro">Request a new link to continue.</p><Link className="button button-dark" href="/forgot-password">Request reset link</Link></div>; }
