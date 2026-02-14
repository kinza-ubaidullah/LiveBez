"use client";

import { useState, useEffect } from "react";
import { updateStaticPage } from "@/lib/actions/static-page-actions";
import TipTapEditor from "./TipTapEditor";

export default function StaticPageForm({ page, languages }: { page: any, languages: any[] }) {
    const [activeLang, setActiveLang] = useState(languages[0]?.code || 'en');
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const initialData: any = {};
        languages.forEach(lang => {
            const trans = page.translations.find((t: any) => t.languageCode === lang.code);
            initialData[lang.code] = {
                title: trans?.title || "",
                content: trans?.content || "",
                seoTitle: trans?.seo?.title || "",
                seoDescription: trans?.seo?.description || "",
            };
        });
        setFormData(initialData);
    }, [page, languages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const res = await updateStaticPage(page.id, formData);
        if (res.success) {
            setStatus({ type: 'success', message: 'Page updated successfully!' });
        } else {
            setStatus({ type: 'error', message: res.error || 'Failed to update page.' });
        }
        setLoading(false);
    };

    const handleFieldChange = (langCode: string, field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [langCode]: {
                ...prev[langCode],
                [field]: value
            }
        }));
    };

    const currentData = formData[activeLang] || { title: "", content: "", seoTitle: "", seoDescription: "" };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {status && (
                <div className={`p-4 rounded-xl font-bold text-sm ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.message}
                </div>
            )}

            <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-2xl w-fit">
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        type="button"
                        onClick={() => setActiveLang(lang.code)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeLang === lang.code ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {lang.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <div className="premium-card p-10 bg-white border-none shadow-sm space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page Title ({activeLang})</label>
                            <input
                                type="text"
                                value={currentData.title}
                                onChange={e => handleFieldChange(activeLang, 'title', e.target.value)}
                                className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-2xl"
                                placeholder="Enter page title"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content ({activeLang})</label>
                            <TipTapEditor
                                content={currentData.content}
                                onChange={(content) => handleFieldChange(activeLang, 'content', content)}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="premium-card p-8 bg-slate-900 border-none shadow-xl text-white space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">SEO Management</h4>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Title</label>
                            <input
                                type="text"
                                value={currentData.seoTitle}
                                onChange={e => handleFieldChange(activeLang, 'seoTitle', e.target.value)}
                                className="w-full p-3 rounded-lg border border-slate-700 bg-slate-800 text-white outline-none focus:border-blue-500 transition-all text-xs font-bold"
                                placeholder="SEO Title"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Description</label>
                            <textarea
                                value={currentData.seoDescription}
                                onChange={e => handleFieldChange(activeLang, 'seoDescription', e.target.value)}
                                className="w-full p-3 h-32 rounded-lg border border-slate-700 bg-slate-800 text-white outline-none focus:border-blue-500 transition-all text-xs font-bold resize-none"
                                placeholder="Description for search engines..."
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>

                        <div className="pt-4 border-t border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase font-black">Route Slug</p>
                            <p className="text-sm font-mono text-blue-400">/{page.slug}</p>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

