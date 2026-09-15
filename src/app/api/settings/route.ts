import { getSiteSettings, presentSettings } from "@/lib/settings";
import { handleRoute, jsonOk } from "@/lib/route";

export async function GET() {
  return handleRoute(async () => {
    const settings = await getSiteSettings();
    return jsonOk({ settings: settings ? presentSettings(settings) : null });
  });
}
