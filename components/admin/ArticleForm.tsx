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
                <div className={`p-4 rounded-lg font-bold text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Header Settings */}
            <div className="flex items-center justify-between border-b pb-8">
                <div className="flex items-center space-x-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="block w-full p-2 bg-transparent text-lg font-bold outline-none border-b border-transparent focus:border-blue-600 transition-all cursor-pointer"
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.translations[0]?.name || cat.key}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Status:</span>
                        <button
                            type="button"
                            onClick={() => setPublished(!published)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                                }`}
                        >
                            {published ? 'Published' : 'Draft'}
                        </button>
                        <a
                            href={`/${activeLang}/blog/${currentTrans.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Preview Page"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                    </div>
                </div>
            </div>

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
                        {lang.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Main Editor */}
                <div className="lg:col-span-3 space-y-10">
                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Main Title</label>
                        <input
                            type="text"
                            value={currentTrans.title}
                            onChange={(e) => handleTransChange('title', e.target.value)}
                            className="w-full text-4xl font-black text-slate-900 border-none outline-none placeholder:text-slate-200"
                            placeholder="Enter Article Title..."
                        />
                        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 border-b pb-4">
                            <span>/{activeLang}/blog/</span>
                            <input
                                type="text"
                                value={currentTrans.slug}
                                onChange={(e) => handleTransChange('slug', e.target.value)}
                                onBlur={(e) => validateSlug(e.target.value)}
                                className={`bg-transparent outline-none border-b border-transparent focus:border-blue-300 px-1 ${slugStatus[activeLang] === 'taken' ? 'text-red-500' : 'text-slate-500'
                                    }`}
                                placeholder="slug-here"
                            />
                        </div>
                        {slugStatus[activeLang] === 'taken' && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">Slug already taken!</p>}
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Article Body</label>
                        <TipTapEditor
                            content={currentTrans.content}
                            onChange={(content) => handleTransChange('content', content)}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Excerpt</label>
                        <textarea
                            value={currentTrans.excerpt}
                            onChange={(e) => handleTransChange('excerpt', e.target.value)}
                            className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 transition-all font-medium italic text-slate-600 resize-none h-32"
                            placeholder="Briefly describe what this article is about for previews..."
                        />
                    </div>
                </div>

                {/* Sidebar SEO */}
                <div className="space-y-8">
                    <div className="premium-card p-8 bg-slate-900 text-white border-none space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-lg font-black uppercase tracking-tighter italic">Search Preview</h3>
                            <div className="p-3 bg-white rounded-lg text-slate-900">
                                <div className="text-blue-700 font-medium text-sm line-clamp-1">{currentTrans.seo.title || currentTrans.title || 'Page Title'}</div>
                                <div className="text-green-700 text-[10px] my-1">livebaz.com › blog › ...</div>
                                <div className="text-slate-500 text-[10px] line-clamp-2">{currentTrans.seo.description || currentTrans.excerpt || 'Write a meta description to see how it looks here.'}</div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-slate-800">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">SEO Title</label>
                                <input
                                    type="text"
                                    value={currentTrans.seo.title}
                                    onChange={(e) => handleSeoChange('title', e.target.value)}
                                    className="w-full bg-slate-800 border-none rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">SEO H1 Override</label>
                                <input
                                    type="text"
                                    value={currentTrans.seo.h1}
                                    onChange={(e) => handleSeoChange('h1', e.target.value)}
                                    className="w-full bg-slate-800 border-none rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Leave empty to use main title"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">SEO Description</label>
                                <textarea
                                    value={currentTrans.seo.description}
                                    onChange={(e) => handleSeoChange('description', e.target.value)}
                                    className="w-full bg-slate-800 border-none rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-blue-500 h-24 resize-none"
                                />
                            </div>
                            <div className="pt-6">
                                <button
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Sync & Save'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-8 space-y-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Featured Image</h4>
                        <ImageUpload
                            value={featuredImage}
                            onChange={(url) => setFeaturedImage(url)}
                        />
                    </div>

                    <div className="premium-card p-8 space-y-6">

                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Advanced SEO</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Search Engine Index</span>
                            <div
                                onClick={() => handleSeoChange('noIndex', !currentTrans.seo.noIndex)}
                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${!currentTrans.seo.noIndex ? 'bg-green-500' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${!currentTrans.seo.noIndex ? 'right-1' : 'left-1'}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
