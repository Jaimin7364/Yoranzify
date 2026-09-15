import Link from "next/link";
export default function UnauthorizedPage() { return <main className="state-page"><div><strong>401</strong><h1>This space is private.</h1><p>Sign in with the right account to continue.</p><Link className="button button-dark" href="/">Return home</Link></div></main>; }
