import { publicHomepageContent } from "@/lib/homepage-cms";
import { handleRoute, jsonOk } from "@/lib/route";
export async function GET() { return handleRoute(async () => jsonOk(await publicHomepageContent())); }
