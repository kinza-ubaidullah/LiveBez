"use client";

import { useState } from "react";
import { updateSiteSettings } from "@/lib/actions/settings-actions";

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
    const [settings, setSettings] = useState({
        siteName: initialSettings?.siteName || "LiveBaz",
        globalTitle: initialSettings?.globalTitle || "",
        globalDesc: initialSettings?.globalDesc || "",
        brandColor: initialSettings?.globalBrandColor || "#0052FF",
        headScripts: initialSettings?.headScripts || "",
        bodyScripts: initialSettings?.bodyScripts || "",
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const res = await updateSiteSettings(settings);
        if (res.success) {
            setStatus({ type: 'success', message: 'Settings saved successfully!' });
        } else {
            setStatus({ type: 'error', message: res.error || 'Failed to save settings.' });
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {status && (
                <div className={`p-4 rounded-xl font-bold text-sm ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Brand & Identity */}
                    <div className="premium-card p-10 bg-white border-none shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <div className="w-2 h-8 bg-blue-600 rounded-full" />
                            Site Identity
                        </h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Site Name</label>
                                    <input
                                        type="text"
                                        value={settings.siteName}
                                        onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                        placeholder="LiveBaz"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand Color (Primary)</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="color"
                                            value={settings.brandColor}
                                            onChange={e => setSettings({ ...settings, brandColor: e.target.value })}
                                            className="h-14 w-20 rounded-xl border border-slate-100 bg-slate-50 p-1 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={settings.brandColor}
                                            onChange={e => setSettings({ ...settings, brandColor: e.target.value })}
                                            className="flex-1 p-4 rounded-xl border border-slate-100 bg-slate-50 outline-none font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-50">
                                <h3 className="text-xs font-black uppercase tracking-widest text-blue-600">Global SEO Fallbacks</h3>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Meta Title</label>
                                    <input
                                        type="text"
                                        value={settings.globalTitle}
                                        onChange={e => setSettings({ ...settings, globalTitle: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white outline-none font-medium"
                                        placeholder="The Ultimate Sports Hub"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Meta Description</label>
                                    <textarea
                                        value={settings.globalDesc}
                                        onChange={e => setSettings({ ...settings, globalDesc: e.target.value })}
                                        className="w-full p-4 h-32 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white outline-none font-medium resize-none"
                                        placeholder="Live scores, predictions, and betting tips..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scripts & Integration */}
                    <div className="premium-card p-10 bg-slate-900 border-none">
                        <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                            Tracking & Custom Scripts
                        </h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Header Scripts (GTM, Analytics, Meta Pixel)</label>
                                <textarea
                                    value={settings.headScripts}
                                    onChange={e => setSettings({ ...settings, headScripts: e.target.value })}
                                    className="w-full p-6 h-48 rounded-xl bg-slate-950 border border-slate-800 text-emerald-500 font-mono text-xs focus:border-emerald-500 outline-none resize-none"
                                    placeholder="<script>...</script>"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Body Scripts (Chat Widgets, Pixels)</label>
                                <textarea
                                    value={settings.bodyScripts}
                                    onChange={e => setSettings({ ...settings, bodyScripts: e.target.value })}
                                    className="w-full p-6 h-48 rounded-xl bg-slate-950 border border-slate-800 text-emerald-500 font-mono text-xs focus:border-emerald-500 outline-none resize-none"
                                    placeholder="<script>...</script>"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status & Actions */}
                <div className="space-y-8">
                    <div className="premium-card p-8 bg-blue-600 text-white border-none shadow-2xl sticky top-36">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black">!</div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest">Global Deploy</h4>
                                <p className="text-[10px] text-blue-200">Updates affect all languages.</p>
                            </div>
                        </div>
                        <button
                            disabled={loading}
                            className="w-full bg-white text-blue-600 py-5 rounded-xl font-black uppercase tracking-widest hover:bg-blue-50 transition-all disabled:opacity-50 shadow-xl shadow-blue-900/30"
                        >
                            {loading ? "Propagating..." : "Save System Settings"}
                        </button>
                    </div>

                    <div className="premium-card p-8 bg-slate-900 text-white border-none space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Push Infrastructure
                        </h4>
                        <p className="text-[10px] text-slate-400">Force a test notification to all active browser subscriptions to verify functional connectivity.</p>
                        <button
                            type="button"
                            onClick={async () => {
                                const { sendTestNotification } = await import("@/lib/actions/notification-actions");
                                const res = await sendTestNotification();
                                if (res.success) alert(`Alert broadcasted to ${res.count} devices!`);
                                else alert("Broadcast failed: " + res.error);
                            }}
                            className="w-full bg-slate-800 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
                        >
                            Broadcast Real Goal Alert
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
