import { CategoryManager } from "@/components/category-manager";
import { getCategoryTree } from "@/lib/categories";
import { CategoryShippingRules } from "@/components/category-shipping-rules";

export default async function CategoriesPage() { const categories = await getCategoryTree(); return <main className="admin-main settings-page"><header className="admin-top"><div><p className="eyebrow">Catalogue architecture</p><h1>Categories</h1></div></header><p className="settings-lead">Shape how customers browse your collections. Build parent and child categories, control their order, and publish when ready.</p><CategoryManager initial={categories} /><CategoryShippingRules categories={categories} /></main>; }
