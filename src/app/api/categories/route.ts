import { getCategoryTree } from "@/lib/categories";
import { handleRoute, jsonOk } from "@/lib/route";
export async function GET() { return handleRoute(async () => jsonOk({ categories: await getCategoryTree(true) })); }
