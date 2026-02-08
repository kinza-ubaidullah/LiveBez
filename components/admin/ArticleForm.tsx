"use client";

import { useState } from "react";
import { updateArticleAction, createArticleAction, checkArticleSlugUniqueness } from "@/lib/actions/article-actions";
import { useRouter } from "next/navigation";
import TipTapEditor from "./TipTapEditor";
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
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    seo: SeoFields;
}

interface ArticleFormProps {
    article: any;
    languages: any[];
    categories: any[];
    leagues?: any[];
    matches?: any[];
}

export default function ArticleForm({ article, languages, categories, leagues = [], matches = [], isNew = false }: ArticleFormProps & { isNew?: boolean }) {
    const router = useRouter();
    const [activeLang, setActiveLang] = useState(languages[0]?.code || 'en');
    const [categoryId, setCategoryId] = useState(article?.categoryId || (categories.length > 0 ? categories[0].id : ""));
    const [leagueId, setLeagueId] = useState(article?.leagueId || "");
    const [matchId, setMatchId] = useState(article?.matchId || "");
    const [published, setPublished] = useState(article?.published || false);
    const [isFeatured, setIsFeatured] = useState(article?.isFeatured || false);
    const [featuredImage, setFeaturedImage] = useState(article?.featuredImage || "");

    const [translations, setTranslations] = useState<Record<string, Translation>>(() => {
        const initial: Record<string, Translation> = {};
        languages.forEach(lang => {
            const existing = article?.translations?.find((t: any) => t.languageCode === lang.code);
            initial[lang.code] = {
                languageCode: lang.code,
                title: existing?.title || "",
                slug: existing?.slug || "",
                content: existing?.content || "",
                excerpt: existing?.excerpt || "",
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
        const { isUnique } = await checkArticleSlugUniqueness(slug, article?.id);
        setSlugStatus(prev => ({ ...prev, [activeLang]: isUnique ? 'unique' : 'taken' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const payload = {
            categoryId,
            leagueId: leagueId === "" ? undefined : leagueId,
            matchId: matchId === "" ? undefined : matchId,
            published,
            isFeatured,
            featuredImage,
            translations: Object.values(translations)
        };

        const result = isNew
            ? await createArticleAction(payload)
            : await updateArticleAction(article.id, payload);

        if (result.success) {
            setMessage({ type: 'success', text: isNew ? "Article created successfully!" : "Article updated successfully!" });
            if (isNew && result.id) {
                router.push(`/admin/articles/${result.id}`);
            } else {
                router.refresh();
            }
        } else {
            setMessage({ type: 'error', text: result.error || "Failed to process article." });
        }
        setLoading(false);
    };

    const currentTrans = translations[activeLang];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {message && (
                <div className={`p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-red-100 dark:bg-red-900/30 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Header Settings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category Hierarchy</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="block w-full p-2 bg-transparent text-lg font-black outline-none border-b border-transparent focus:border-blue-600 transition-all cursor-pointer text-slate-900 dark:text-white"
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id} className="dark:bg-slate-900">
                                    {cat.translations[0]?.name || cat.key}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Featured:</span>
                            <button
                                type="button"
                                onClick={() => setIsFeatured(!isFeatured)}
                                className={`w-10 h-5 rounded-full relative transition-colors ${isFeatured ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isFeatured ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status:</span>
                            <button
                                type="button"
                                onClick={() => setPublished(!published)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${published ? 'bg-green-100 dark:bg-green-600/20 text-green-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    }`}
                            >
                                {published ? 'Published' : 'Draft'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Relations Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attach to Competition (League)</label>
                    <select
                        value={leagueId}
                        onChange={(e) => setLeagueId(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                    >
                        <option value="">None (General Article)</option>
                        {leagues.map(league => (
                            <option key={league.id} value={league.id}>
                                {league.translations[0]?.name || league.country}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attach to Specific Match</label>
                    <select
                        value={matchId}
                        onChange={(e) => setMatchId(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                    >
                        <option value="">None (Manual Placement)</option>
                        {matches.map(match => (
                            <option key={match.id} value={match.id}>
                                {match.homeTeam} vs {match.awayTeam} ({new Date(match.date).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Language Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
                <div className="flex space-x-2">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => setActiveLang(lang.code)}
                            className={`px-6 py-4 font-black text-xs transition-all border-b-2 uppercase tracking-widest whitespace-nowrap mb-[-2px] ${activeLang === lang.code
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 xl:gap-12">
                <div className="xl:col-span-3 space-y-12">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Editorial Title</label>
                        <input
                            type="text"
                            value={currentTrans.title}
                            onChange={(e) => handleTransChange('title', e.target.value)}
                            className="w-full text-3xl sm:text-5xl font-black text-slate-900 dark:text-white border-none outline-none placeholder:text-slate-200 dark:placeholder:text-slate-800 bg-transparent leading-tight"
                            placeholder="Enter Article Title..."
                        />
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-6">
                            <span>/{activeLang}/blog/</span>
                            <input
                                type="text"
                                value={currentTrans.slug}
                                onChange={(e) => handleTransChange('slug', e.target.value)}
                                onBlur={(e) => validateSlug(e.target.value)}
                                className={`bg-transparent outline-none border-b border-transparent focus:border-blue-300 px-1 font-bold ${slugStatus[activeLang] === 'taken' ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'
                                    }`}
                                placeholder="slug-here"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <TipTapEditor
                            content={currentTrans.content}
                            onChange={(content) => handleTransChange('content', content)}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Excerpt</label>
                        <textarea
                            value={currentTrans.excerpt}
                            onChange={(e) => handleTransChange('excerpt', e.target.value)}
                            className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] outline-none focus:border-blue-300 transition-all font-black text-sm italic text-slate-600 dark:text-slate-400 resize-none h-40 shadow-sm"
                            placeholder="Briefly describe what this article is about..."
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="premium-card p-8 bg-slate-900 text-white border-none space-y-8 rounded-[2rem] shadow-2xl">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">SEO Title</label>
                                <input
                                    type="text"
                                    value={currentTrans.seo.title}
                                    onChange={(e) => handleSeoChange('title', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Meta Description</label>
                                <textarea
                                    value={currentTrans.seo.description}
                                    onChange={(e) => handleSeoChange('description', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary h-32 resize-none transition-all"
                                />
                            </div>
                            <button
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
                            >
                                {loading ? 'Saving...' : 'Sync & Save'}
                            </button>
                        </div>
                    </div>

                    <div className="premium-card p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured Image</h4>
                        <ImageUpload
                            value={featuredImage}
                            onChange={(url) => setFeaturedImage(url)}
                        />
                    </div>
                </div>
            </div>
        </form>
    );
}
