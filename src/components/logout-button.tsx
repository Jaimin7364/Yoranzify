"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter(); const [pending, setPending] = useState(false);
  return <button className="account-link danger" disabled={pending} onClick={async () => { setPending(true); await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }}><LogOut size={18} />{pending ? "Signing out…" : "Sign out"}</button>;
}
