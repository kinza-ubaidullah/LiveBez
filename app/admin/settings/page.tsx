import prisma from "@/lib/db";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
    const settings = await prisma.siteSettings.findFirst();

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-12">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Platform Infrastructure</div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">Global Site Settings</h1>
                <p className="text-slate-500 text-sm mt-4 max-w-2xl">Configure global SEO defaults, social integration, and tracking scripts. These settings serve as the master configuration layer for the entire platform.</p>
            </div>

            <SettingsForm initialSettings={settings} />
        </div>
    );
}
