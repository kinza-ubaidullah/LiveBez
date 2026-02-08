"use client";

import { useState } from "react";
import { updateTeamAction, checkTeamSlugUniqueness } from "@/lib/actions/team-actions";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";

interface TeamFormProps {
    team: any;
    languages: any[];
}

export default function TeamForm({ team, languages }: TeamFormProps) {
    const router = useRouter();
    const [activeLang, setActiveLang] = useState(languages[0]?.code || 'en');
    const [country, setCountry] = useState(team.country || "");
    const [logoUrl, setLogoUrl] = useState(team.logoUrl || "");

    const [translations, setTranslations] = useState<Record<string, any>>(() => {
        const initial: Record<string, any> = {};
        languages.forEach(lang => {
            const existing = team.translations?.find((t: any) => t.languageCode === lang.code);
            initial[lang.code] = {
                languageCode: lang.code,
                name: existing?.name || "",
                slug: existing?.slug || "",
                description: existing?.description || "",
                seo: {
                    title: existing?.seo?.title || "",
                    description: existing?.seo?.description || "",
                    h1: existing?.seo?.h1 || "",
                    canonical: existing?.seo?.canonical || "",
                    ogTitle: existing?.seo?.ogTitle || "",
                    ogDescription: existing?.seo?.ogDescription || "",
                    ogImage: existing?.seo?.ogImage || "",
                    noIndex: existing?.seo?.noIndex || false,
                }
            };
        });
        return initial;
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleTransChange = (field: string, value: any) => {
        setTranslations(prev => ({
            ...prev,
            [activeLang]: { ...prev[activeLang], [field]: value }
        }));
    };

    const handleSeoChange = (field: string, value: any) => {
        setTranslations(prev => ({
            ...prev,
            [activeLang]: {
                ...prev[activeLang],
                seo: { ...prev[activeLang].seo, [field]: value }
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const result = await updateTeamAction(team.id, {
            country,
            logoUrl,
            translations: Object.values(translations)
        });

        if (result.success) {
            setMessage({ type: 'success', text: "Team updated successfully! Indexing refreshed." });
            router.refresh();
        } else {
            setMessage({ type: 'error', text: result.error || "Failed to save team data." });
        }
        setLoading(false);
    };

    const currentTrans = translations[activeLang];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {message && (
                <div className={`p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 shadow-xl shadow-green-500/10' : 'bg-red-100 text-red-700 shadow-xl shadow-red-500/10'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex space-x-2 border-b border-slate-100 pb-px">
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        type="button"
                        onClick={() => setActiveLang(lang.code)}
                        className={`px-8 py-4 font-black text-[10px] transition-all border-b-2 uppercase tracking-widest italic ${activeLang === lang.code ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        {lang.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-3 space-y-12">
                    <div className="premium-card p-10 bg-white border-none shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 italic">
                            <div className="w-2 h-8 bg-blue-600 rounded-full" />
                            Identity & Branding
                        </h2>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Full Team Name</label>
                                <input
                                    type="text"
                                    value={currentTrans.name}
                                    onChange={(e) => handleTransChange('name', e.target.value)}
                                    className="w-full text-3xl font-black text-slate-900 border-b-2 border-slate-100 focus:border-blue-600 outline-none transition-all py-2 placeholder:text-slate-200 uppercase tracking-tighter italic"
                                    placeholder="e.g. MANCHESTER UNITED"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">SEO Permalink (Slug)</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-slate-300">/team/</span>
                                        <input
                                            type="text"
                                            value={currentTrans.slug}
                                            onChange={(e) => handleTransChange('slug', e.target.value)}
                                            className="flex-1 p-4 rounded-xl border border-slate-100 bg-slate-50 font-mono text-xs outline-none focus:border-blue-200 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Country Foundation</label>
                                    <input
                                        type="text"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:border-blue-200 transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-10 bg-slate-50 border-none shadow-inner">
                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 italic">
                            <div className="w-2 h-8 bg-blue-500 rounded-full" />
                            Search Engine Visibility
                        </h2>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Meta Title Template</label>
                                <input
                                    type="text"
                                    value={currentTrans.seo.title}
                                    onChange={(e) => handleSeoChange('title', e.target.value)}
                                    className="w-full p-4 rounded-xl bg-white border border-slate-100 focus:border-blue-500 outline-none text-sm font-bold"
                                    placeholder="Default: [Name] Predictions & Stats"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Page H1 Heading</label>
                                <input
                                    type="text"
                                    value={currentTrans.seo.h1}
                                    onChange={(e) => handleSeoChange('h1', e.target.value)}
                                    className="w-full p-4 rounded-xl bg-white border border-slate-100 focus:border-blue-500 outline-none text-sm font-bold"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Meta Description</label>
                                <textarea
                                    value={currentTrans.seo.description}
                                    onChange={(e) => handleSeoChange('description', e.target.value)}
                                    className="w-full p-6 h-32 bg-white border border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-slate-600 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="premium-card p-8 bg-slate-900 border-none sticky top-36">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Club Crest</label>
                                <ImageUpload value={logoUrl} onChange={setLogoUrl} />
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white italic">Index Status</div>
                                    <div className="text-[8px] text-slate-500">Allow spiders to crawl</div>
                                </div>
                                <div
                                    onClick={() => handleSeoChange('noIndex', !currentTrans.seo.noIndex)}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${!currentTrans.seo.noIndex ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${!currentTrans.seo.noIndex ? 'right-1' : 'left-1'}`} />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest italic text-xs transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                            >
                                {loading ? "Saving Cluster..." : "Update Team SEO"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
