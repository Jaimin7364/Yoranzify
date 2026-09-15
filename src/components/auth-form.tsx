"use client";

import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register" | "forgot" | "reset" | "change";
type ApiFailure = { error?: { message?: string; details?: { fieldErrors?: Record<string, string[]> } } };

const config = {
  login: { eyebrow: "Welcome back", title: "Sign in to your wardrobe", submit: "Sign in", endpoint: "/api/auth/login" },
  register: { eyebrow: "Join Yoranzify", title: "Create your account", submit: "Create account", endpoint: "/api/auth/register" },
  forgot: { eyebrow: "Account recovery", title: "Reset your password", submit: "Send reset link", endpoint: "/api/auth/forgot-password" },
  reset: { eyebrow: "Choose a new password", title: "Make it memorable", submit: "Update password", endpoint: "/api/auth/reset-password" },
  change: { eyebrow: "Account security", title: "Change your password", submit: "Save new password", endpoint: "/api/auth/change-password" }
} as const;

function Field({ label, name, type = "text", autoComplete, error, toggle }: { label: string; name: string; type?: string; autoComplete?: string; error?: string[]; toggle?: boolean }) {
  const [shown, setShown] = useState(false);
  const actualType = toggle && shown ? "text" : type;
  return <div className="auth-field"><label htmlFor={name}>{label}</label><div className="auth-input-wrap"><input id={name} name={name} type={actualType} autoComplete={autoComplete} aria-invalid={Boolean(error?.length)} aria-describedby={error?.length ? `${name}-error` : undefined} required />{toggle && <button type="button" aria-label={shown ? "Hide password" : "Show password"} onClick={() => setShown((value) => !value)}>{shown ? <EyeOff size={18} /> : <Eye size={18} />}</button>}</div>{error?.map((message) => <small className="field-error" id={`${name}-error`} key={message}>{message}</small>)}</div>;
}

export function AuthForm({ mode, nextPath = "/account", token }: { mode: Mode; nextPath?: string; token?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [devToken, setDevToken] = useState("");
  const details = config[mode];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage(""); setErrors({});
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (token) data.token = token;
    try {
      const response = await fetch(details.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json() as ApiFailure & { message?: string; devResetToken?: string };
      if (!response.ok) { setMessage(result.error?.message ?? "Please check your details and try again."); setErrors(result.error?.details?.fieldErrors ?? {}); return; }
      if (mode === "login" || mode === "register") { router.push(nextPath); router.refresh(); }
      else if (mode === "reset" || mode === "change") { router.push("/login?password=updated"); router.refresh(); }
      else { setMessage(result.message ?? "Check your email for the next step."); if (result.devResetToken) setDevToken(result.devResetToken); }
    } catch { setMessage("We couldn't connect. Please try again."); }
    finally { setPending(false); }
  }

  return <div className="auth-card"><p className="eyebrow">{details.eyebrow}</p><h1>{details.title}</h1>{mode === "login" && <p className="auth-intro">Welcome back. Your saved pieces and orders are waiting.</p>}<form onSubmit={submit} noValidate>
    {mode === "register" && <Field label="Full name" name="name" autoComplete="name" error={errors.name} />}
    {(mode === "login" || mode === "register" || mode === "forgot") && <Field label="Email address" name="email" type="email" autoComplete="email" error={errors.email} />}
    {mode === "register" && <Field label="Mobile number" name="mobile" type="tel" autoComplete="tel" error={errors.mobile} />}
    {mode === "change" && <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" toggle error={errors.currentPassword} />}
    {(mode === "login" || mode === "register" || mode === "reset" || mode === "change") && <Field label={mode === "change" ? "New password" : "Password"} name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} toggle error={errors.password} />}
    {(mode === "register" || mode === "reset" || mode === "change") && <Field label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" toggle error={errors.confirmPassword} />}
    {mode === "login" && <div className="auth-between"><label className="check"><input type="checkbox" /> Keep me signed in</label><Link href="/forgot-password">Forgot password?</Link></div>}
    {message && <div className={mode === "forgot" && !errors.email ? "form-success" : "form-error"} role="status">{message}</div>}
    {devToken && <Link className="dev-reset" href={`/reset-password?token=${encodeURIComponent(devToken)}`}>Development only: open password reset <ArrowRight size={14} /></Link>}
    <button className="button button-dark auth-submit" type="submit" disabled={pending}>{pending ? <><LoaderCircle className="spin" size={17} /> Please wait</> : <>{details.submit} <ArrowRight size={16} /></>}</button>
  </form>{mode === "login" && <p className="auth-switch">New here? <Link href="/register">Create an account</Link></p>}{mode === "register" && <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>}{mode === "forgot" && <p className="auth-switch"><Link href="/login">Back to sign in</Link></p>}</div>;
}
