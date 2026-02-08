"use client";

import { useState, useEffect } from "react";
import { updateStaticPage } from "@/lib/actions/static-page-actions";

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="premium-card p-10 bg-white border-none shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page Title ({activeLang})</label>
                            <input
                                type="text"
                                value={formData[activeLang]?.title || ""}
                                onChange={e => handleFieldChange(activeLang, 'title', e.target.value)}
                                className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                placeholder="Enter page title"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content ({activeLang})</label>
                            <textarea
                                value={formData[activeLang]?.content || ""}
                                onChange={e => handleFieldChange(activeLang, 'content', e.target.value)}
                                className="w-full p-6 h-[500px] rounded-xl border border-slate-100 bg-slate-50 focus:bg-white outline-none font-medium resize-none"
                                placeholder="Enter page content (HTML or Markdown supported depending on implementation)"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="premium-card p-8 bg-blue-600 text-white border-none shadow-2xl sticky top-36">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black italic">i</div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest">Publish Page</h4>
                                <p className="text-[10px] text-blue-200">Slug: /{page.slug}</p>
                            </div>
                        </div>
                        <button
                            disabled={loading}
                            className="w-full bg-white text-blue-600 py-5 rounded-xl font-black uppercase tracking-widest hover:bg-blue-50 transition-all disabled:opacity-50 shadow-xl shadow-blue-900/30"
                        >
                            {loading ? "Updating..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
