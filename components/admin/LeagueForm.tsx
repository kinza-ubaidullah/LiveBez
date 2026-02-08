"use client";

import { useState } from "react";
import { updateLeagueAction, checkSlugUniqueness } from "@/lib/actions/league-actions";
import { createLeagueAction } from "@/lib/actions/league-create-action";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";

interface SeoFields {
    title: string;
    description: string;
    h1: string;
    canonical: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    noIndex: boolean;
}

interface Translation {
    languageCode: string;
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
    seo: SeoFields;
}

interface LeagueFormProps {
    league: any;
    languages: any[];
    isNew?: boolean;
}

export default function LeagueForm({ league, languages, isNew = false }: LeagueFormProps) {
    const router = useRouter();
    const [activeLang, setActiveLang] = useState(languages[0]?.code || 'en');
    const [country, setCountry] = useState(league.country || "");
    const [logoUrl, setLogoUrl] = useState(league.logoUrl || "");

    const [translations, setTranslations] = useState<Record<string, Translation>>(() => {
        const initial: Record<string, Translation> = {};
        languages.forEach(lang => {
            const existing = league.translations?.find((t: any) => t.languageCode === lang.code);
            initial[lang.code] = {
                languageCode: lang.code,
                name: existing?.name || "",
                slug: existing?.slug || "",
                description: existing?.description || "",
                isActive: existing?.isActive ?? true,
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
    const [slugStatus, setSlugStatus] = useState<Record<string, 'idle' | 'checking' | 'unique' | 'taken'>>({});

    const handleTransChange = (field: string, value: any) => {
        setTranslations(prev => ({
            ...prev,
            [activeLang]: {
                ...prev[activeLang],
                [field]: value
            }
        }));
    };

    const handleSeoChange = (field: string, value: any) => {
        setTranslations(prev => ({
            ...prev,
            [activeLang]: {
                ...prev[activeLang],
                seo: {
                    ...prev[activeLang].seo,
                    [field]: value
                }
            }
        }));
    };

    const validateSlug = async (slug: string) => {
        if (!slug) return;
        setSlugStatus(prev => ({ ...prev, [activeLang]: 'checking' }));
        const { isUnique } = await checkSlugUniqueness(slug, league.id || "");
        setSlugStatus(prev => ({ ...prev, [activeLang]: isUnique ? 'unique' : 'taken' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        let result;
        if (isNew) {
            result = await createLeagueAction({
                country,
                logoUrl,
                translations: Object.values(translations)
            });
        } else {
            result = await updateLeagueAction(league.id, {
                country,
                logoUrl,
                translations: Object.values(translations)
            });
        }

        if (result.success) {
            setMessage({ type: 'success', text: isNew ? "League created successfully!" : "League updated successfully!" });
            if (isNew) {
                router.push("/admin/leagues");
            } else {
                router.refresh();
            }
        } else {
            setMessage({ type: 'error', text: (result as any).error || "Failed to process league." });
        }
        setLoading(false);
    };

    const currentTrans = translations[activeLang];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {message && (
                <div className={`p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 shadow-lg shadow-green-500/10' : 'bg-red-100 text-red-700 shadow-lg shadow-red-500/10'}`}>
                    {message.text}
                </div>
            )}

            {/* Language Tabs */}
            <div className="flex space-x-2 border-b border-slate-100 pb-px">
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        type="button"
                        onClick={() => setActiveLang(lang.code)}
                        className={`px-8 py-4 font-black text-[10px] transition-all border-b-2 uppercase tracking-widest italic ${activeLang === lang.code
                            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {lang.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-3 space-y-12">
                    <div className="premium-card p-10 bg-white border-none shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <div className="w-2 h-8 bg-blue-600 rounded-full" />
                            General Information
                        </h2>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">League Name (Local)</label>
                                <input
                                    type="text"
                                    value={currentTrans.name}
                                    onChange={(e) => handleTransChange('name', e.target.value)}
                                    className="w-full text-3xl font-black text-slate-900 border-b-2 border-slate-100 focus:border-blue-600 outline-none transition-all py-2 placeholder:text-slate-200"
                                    placeholder="e.g. English Premier League"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Slug / URL Key</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-slate-300">/league/</span>
                                        <input
                                            type="text"
                                            value={currentTrans.slug}
                                            onChange={(e) => handleTransChange('slug', e.target.value)}
                                            onBlur={(e) => validateSlug(e.target.value)}
                                            className={`flex-1 p-4 rounded-xl border bg-slate-50 font-mono text-xs outline-none transition-all ${slugStatus[activeLang] === 'unique' ? 'border-green-500 bg-green-50' :
                                                slugStatus[activeLang] === 'taken' ? 'border-red-500 bg-red-50' :
                                                    'border-slate-100 focus:border-blue-200'
                                                }`}
                                            placeholder="premier-league"
                                        />
                                    </div>
                                    {slugStatus[activeLang] === 'taken' && <p className="text-[8px] text-red-500 font-black uppercase">Collision! URL already taken.</p>}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Country Foundation</label>
                                    <input
                                        type="text"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:border-blue-200 transition-all font-bold"
                                        placeholder="e.g. England"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Internal Description</label>
                                <textarea
                                    value={currentTrans.description}
                                    onChange={(e) => handleTransChange('description', e.target.value)}
                                    className="w-full p-6 h-40 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 transition-all font-medium italic text-slate-600 resize-none"
                                    placeholder="Admin notes or optional frontend bio..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-10 bg-slate-50 border-none shadow-inner">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                SEO Matrix
                            </h2>
                            <div className="px-3 py-1 bg-white rounded-full text-[8px] font-black uppercase tracking-widest text-blue-600 border border-blue-100 shadow-sm">Overridable</div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Meta Title Override</label>
                                <input
                                    type="text"
                                    value={currentTrans.seo.title}
                                    onChange={(e) => handleSeoChange('title', e.target.value)}
                                    className="w-full p-4 rounded-xl bg-white border border-slate-100 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                                    placeholder="Default: [Name] - [Country]"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">SEO H1 Heading</label>
                                <input
                                    type="text"
                                    value={currentTrans.seo.h1}
                                    onChange={(e) => handleSeoChange('h1', e.target.value)}
                                    className="w-full p-4 rounded-xl bg-white border border-slate-100 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                                    placeholder="Custom H1 for the page"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Meta Description</label>
                                <textarea
                                    value={currentTrans.seo.description}
                                    onChange={(e) => handleSeoChange('description', e.target.value)}
                                    className="w-full p-6 h-32 bg-white border border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-slate-600 resize-none"
                                    placeholder="Craft a compelling search result..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Social Title (OG)</label>
                                    <input
                                        type="text"
                                        value={currentTrans.seo.ogTitle}
                                        onChange={(e) => handleSeoChange('ogTitle', e.target.value)}
                                        className="w-full p-4 rounded-xl bg-white border border-slate-100 focus:border-blue-500 outline-none text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Social Image URL</label>
                                    <input
                                        type="text"
                                        value={currentTrans.seo.ogImage}
                                        onChange={(e) => handleSeoChange('ogImage', e.target.value)}
                                        className="w-full p-4 rounded-xl bg-white border border-slate-100 focus:border-blue-500 outline-none text-[10px] font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="premium-card p-10 bg-slate-900 border-none sticky top-36 shadow-2xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-6 bg-blue-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Publishing Control</h4>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Official Logo</label>
                                <ImageUpload value={logoUrl} onChange={setLogoUrl} />
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white">Search Index</div>
                                    <div className="text-[8px] text-slate-500">Allow Google bot access</div>
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
                                {loading ? "Syncing Logic..." : isNew ? "Create Competition" : "Finalize Changes"}
                            </button>
                        </div>
                    </div>

                    <div className="premium-card p-8 bg-blue-50 border-none">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Advanced Canonicals</h4>
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={currentTrans.seo.canonical}
                                onChange={(e) => handleSeoChange('canonical', e.target.value)}
                                className="w-full p-4 bg-white/50 border border-blue-100 rounded-xl text-[10px] font-mono focus:bg-white outline-none"
                                placeholder="https://external-source.com/..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
