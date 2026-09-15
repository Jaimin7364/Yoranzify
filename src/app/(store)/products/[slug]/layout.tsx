import type { ReactNode } from "react";

type ProductLayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function ProductLayout({ children, params }: ProductLayoutProps) {
  const { slug } = await params;
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const productUrl = new URL(`/products/${encodeURIComponent(slug)}`, origin).toString();
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: new URL("/", origin).toString(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: new URL("/shop", origin).toString(),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: slug
          .split("-")
          .filter(Boolean)
          .map((part) => part[0]?.toUpperCase() + part.slice(1))
          .join(" "),
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
