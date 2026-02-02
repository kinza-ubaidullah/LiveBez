"use client";

import { useState, useEffect } from "react";
import { updateLeagueAction, checkSlugUniqueness } from "@/lib/actions/league-actions";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";


interface SeoFields {
    title: string;
    description: string;
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
    seo: SeoFields;
}

interface LeagueFormProps {
    league: any;
    languages: any[];
}

export default function LeagueForm({ league, languages }: LeagueFormProps) {
    const router = useRouter();
    const [activeLang, setActiveLang] = useState(languages[0]?.code || 'en');
    const [country, setCountry] = useState(league.country);
    const [logoUrl, setLogoUrl] = useState(league.logoUrl || "");


    const [translations, setTranslations] = useState<Record<string, Translation>>(() => {
        const initial: Record<string, Translation> = {};
        languages.forEach(lang => {
            const existing = league.translations.find((t: any) => t.languageCode === lang.code);
            initial[lang.code] = {
                languageCode: lang.code,
                name: existing?.name || "",
                slug: existing?.slug || "",
                description: existing?.description || "",
                seo: {
                    title: existing?.seo?.title || "",
                    description: existing?.seo?.description || "",
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
        const { isUnique } = await checkSlugUniqueness(slug, league.id);
        setSlugStatus(prev => ({ ...prev, [activeLang]: isUnique ? 'unique' : 'taken' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const result = await updateLeagueAction(league.id, {
            country,
            logoUrl,
            translations: Object.values(translations)
        });


        if (result.success) {
            setMessage({ type: 'success', text: "League updated successfully!" });
            router.refresh();
        } else {
            setMessage({ type: 'error', text: result.error || "Failed to update league." });
        }
        setLoading(false);
    };

    const currentTrans = translations[activeLang];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {message && (
                <div className={`p-4 rounded-lg font-bold text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Language Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 pb-px">
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        type="button"
                        onClick={() => setActiveLang(lang.code)}
                        className={`px-6 py-3 font-bold text-sm transition-all border-b-2 uppercase tracking-wide ${activeLang === lang.code
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {lang.name} ({lang.code})
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="premium-card p-8 space-y-6">
                        <h2 className="text-xl font-black text-slate-900 border-b pb-4">General Content</h2>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">League Name</label>
                                <input
                                    type="text"
                                    value={currentTrans.name}
                                    onChange={(e) => handleTransChange('name', e.target.value)}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                    placeholder="e.g. Premier League"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Slug (URL Segment)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={currentTrans.slug}
                                            onChange={(e) => handleTransChange('slug', e.target.value)}
                                            onBlur={(e) => validateSlug(e.target.value)}
                                            className={`w-full p-4 rounded-xl border outline-none transition-all font-mono text-sm ${slugStatus[activeLang] === 'unique' ? 'border-green-500 ring-4 ring-green-500/10' :
                                                slugStatus[activeLang] === 'taken' ? 'border-red-500 ring-4 ring-red-500/10' :
                                                    'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                                }`}
                                            placeholder="premier-league"
                                        />
                                        {slugStatus[activeLang] === 'checking' && <div className="absolute right-4 top-4 text-xs text-slate-400 animate-pulse">Checking...</div>}
                                    </div>
                                    {slugStatus[activeLang] === 'taken' && <p className="text-xs text-red-500 font-bold">This slug is already in use.</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Country</label>
                                    <input
                                        type="text"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                        placeholder="e.g. England"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description (Internal/Display)</label>
                                <textarea
                                    value={currentTrans.description}
                                    onChange={(e) => handleTransChange('description', e.target.value)}
                                    className="w-full p-4 h-32 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none"
                                    placeholder="Brief description of the league..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Full SEO Panel */}
                    <div className="premium-card p-8 space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-xl font-black text-slate-900 flex items-center">
                                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                SEO & Metadata Override
                            </h2>
                            <button type="button" className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Manual Control</button>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">SEO Meta Title</label>
                                <input
                                    type="text"
                                    value={currentTrans.seo.title}
                                    onChange={(e) => handleSeoChange('title', e.target.value)}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                    placeholder="Search engine optimized title..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Meta Description</label>
                                <textarea
                                    value={currentTrans.seo.description}
                                    onChange={(e) => handleSeoChange('description', e.target.value)}
                                    className="w-full p-4 h-24 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none text-sm"
                                    placeholder="Compelling search result description..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">OG Title (Social)</label>
                                    <input
                                        type="text"
                                        value={currentTrans.seo.ogTitle}
                                        onChange={(e) => handleSeoChange('ogTitle', e.target.value)}
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">OG Image URL</label>
                                    <input
                                        type="text"
                                        value={currentTrans.seo.ogImage}
                                        onChange={(e) => handleSeoChange('ogImage', e.target.value)}
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all text-sm font-mono"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    <div className="premium-card p-8 bg-white space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">League Logo</h4>
                        <ImageUpload
                            value={logoUrl}
                            onChange={(url) => setLogoUrl(url)}
                        />
                    </div>

                    <div className="premium-card p-8 bg-blue-600 text-white">

                        <h3 className="text-lg font-black uppercase tracking-widest mb-4">Publish Settings</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Index in Search</span>
                                <input
                                    type="checkbox"
                                    checked={!currentTrans.seo.noIndex}
                                    onChange={(e) => handleSeoChange('noIndex', !e.target.checked)}
                                    className="w-6 h-6 rounded-lg text-white bg-blue-700 border-none focus:ring-0 checked:bg-green-400"
                                />
                            </div>
                            <div className="pt-6 border-t border-blue-500/50">
                                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-4 italic">Unsaved changes detected</p>
                                <button
                                    disabled={loading}
                                    className="w-full bg-white text-blue-600 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save All Changes'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-8 space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Advanced</h4>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Canonical URL Override</label>
                            <input
                                type="text"
                                value={currentTrans.seo.canonical}
                                onChange={(e) => handleSeoChange('canonical', e.target.value)}
                                className="w-full p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
