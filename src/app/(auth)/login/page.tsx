import { AuthForm } from "@/components/auth-form";
import { validateNextPath } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return <AuthForm mode="login" nextPath={validateNextPath(params.next)} />;
}
