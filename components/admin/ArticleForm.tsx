"use client";

import { useState } from "react";
import { updateArticleAction, checkArticleSlugUniqueness } from "@/lib/actions/article-actions";
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
}

export default function ArticleForm({ article, languages, categories }: ArticleFormProps) {
    const router = useRouter();
    const [activeLang, setActiveLang] = useState(languages[0]?.code || 'en');
    const [categoryId, setCategoryId] = useState(article.categoryId);
    const [published, setPublished] = useState(article.published);
    const [featuredImage, setFeaturedImage] = useState(article.featuredImage || "");

    const [translations, setTranslations] = useState<Record<string, Translation>>(() => {
        const initial: Record<string, Translation> = {};
        languages.forEach(lang => {
            const existing = article.translations.find((t: any) => t.languageCode === lang.code);
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
        const { isUnique } = await checkArticleSlugUniqueness(slug, article.id);
        setSlugStatus(prev => ({ ...prev, [activeLang]: isUnique ? 'unique' : 'taken' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const result = await updateArticleAction(article.id, {
            categoryId,
            published,
            featuredImage,
            translations: Object.values(translations)
        });


        if (result.success) {
            setMessage({ type: 'success', text: "Article updated successfully!" });
            router.refresh();
        } else {
            setMessage({ type: 'error', text: result.error || "Failed to update article." });
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
                    <a
                        href={`/${activeLang}/blog/${currentTrans.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 text-slate-400 hover:text-blue-600 transition-all bg-slate-50 dark:bg-slate-800 rounded-xl shadow-sm"
                        title="Preview Page"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                </div>
            </div>

            {/* Language Tabs - Scrollable on mobile */}
            <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex space-x-2">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => setActiveLang(lang.code)}
                            className={`px-6 py-4 font-black text-xs transition-all border-b-2 uppercase tracking-widest whitespace-nowrap mb-[-2px] ${activeLang === lang.code
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 xl:gap-12">
                {/* Main Editor */}
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
                            {slugStatus[activeLang] === 'checking' && <span className="animate-pulse text-blue-500">Checking...</span>}
                            {slugStatus[activeLang] === 'unique' && <span className="text-emerald-500 font-black italic">✓ Unique</span>}
                        </div>
                        {slugStatus[activeLang] === 'taken' && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-2">Error: Slug already in use.</p>}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Article Body</label>
                            <span className="text-[8px] font-bold text-slate-300 uppercase">Interactive Editor</span>
                        </div>
                        <div className="min-h-[400px]">
                            <TipTapEditor
                                content={currentTrans.content}
                                onChange={(content) => handleTransChange('content', content)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Excerpt</label>
                        <textarea
                            value={currentTrans.excerpt}
                            onChange={(e) => handleTransChange('excerpt', e.target.value)}
                            className="w-full p-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] outline-none focus:border-blue-300 transition-all font-black text-sm italic text-slate-600 dark:text-slate-400 resize-none h-40 shadow-sm"
                            placeholder="Briefly describe what this article is about for previews..."
                        />
                    </div>
                </div>

                {/* Sidebar SEO */}
                <div className="space-y-8">
                    <div className="premium-card p-8 bg-slate-900 text-white border-none space-y-8 rounded-[2rem] shadow-2xl">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-blue-400">Search Preview</h3>
                                <div className="p-1.5 bg-green-500/20 text-green-400 rounded-lg text-[8px] font-black uppercase tracking-widest">Live Insight</div>
                            </div>
                            <div className="p-5 bg-white rounded-2xl text-slate-900 shadow-xl overflow-hidden">
                                <div className="text-blue-700 font-bold text-sm truncate">{currentTrans.seo.title || currentTrans.title || 'Page Title'}</div>
                                <div className="text-emerald-700 text-[10px] my-1 font-medium truncate">livebez.com › blog › ...</div>
                                <div className="text-slate-500 text-[10px] line-clamp-2 leading-relaxed">{currentTrans.seo.description || currentTrans.excerpt || 'Write a meta description to see how it looks here.'}</div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-slate-800">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">SEO Metadata Title</label>
                                <input
                                    type="text"
                                    value={currentTrans.seo.title}
                                    onChange={(e) => handleSeoChange('title', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Meta Title..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">H1 Header Override</label>
                                <input
                                    type="text"
                                    value={currentTrans.seo.h1}
                                    onChange={(e) => handleSeoChange('h1', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Leave empty to use title"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Meta Description</label>
                                <textarea
                                    value={currentTrans.seo.description}
                                    onChange={(e) => handleSeoChange('description', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none transition-all"
                                    placeholder="Detailed SEO description..."
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all disabled:opacity-50 shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Synchronizing...
                                        </>
                                    ) : (
                                        'Sync & Save Changes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured Media</h4>
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                        <ImageUpload
                            value={featuredImage}
                            onChange={(url) => setFeaturedImage(url)}
                        />
                    </div>

                    <div className="premium-card p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Indexing Suite</h4>
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Robot Indexing</span>
                            <div
                                onClick={() => handleSeoChange('noIndex', !currentTrans.seo.noIndex)}
                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${!currentTrans.seo.noIndex ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-lg transition-all ${!currentTrans.seo.noIndex ? 'right-1' : 'left-1'}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
