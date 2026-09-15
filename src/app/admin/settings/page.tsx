import { SettingsForm, type SettingsView } from "@/components/settings-form";
import { getSiteSettings, presentSettings } from "@/lib/settings";

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  if (!settings) throw new Error("Site settings are not initialized. Run the database seed.");
  const view = presentSettings(settings);
  return <main className="admin-main settings-page"><header className="admin-top"><div><p className="eyebrow">Store configuration</p><h1>Settings</h1></div><span className="settings-status"><i /> Live</span></header><p className="settings-lead">Manage your brand, customer contact details, shipping rules, and store availability.</p><SettingsForm initial={view as SettingsView} /></main>;
}
