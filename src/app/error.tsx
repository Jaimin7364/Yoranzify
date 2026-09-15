"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="state-page"><div><strong>Oops</strong><h1>Something came undone.</h1><p>We couldn&apos;t load this page. Please try once more.</p><button className="button button-dark" onClick={reset}>Try again</button></div></main>; }
