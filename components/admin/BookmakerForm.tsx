"use client";

import { useState } from "react";
import { updateBookmakerAction } from "@/lib/actions/bookmaker-actions";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";

interface BookmakerFormProps {
    bookmaker: any;
    languages: any[];
}

export default function BookmakerForm({ bookmaker, languages }: BookmakerFormProps) {
    const router = useRouter();
    const [activeLang, setActiveLang] = useState(languages[0]?.code || 'en');

    const [logoUrl, setLogoUrl] = useState(bookmaker?.logoUrl || "");
    const [rating, setRating] = useState(bookmaker?.rating || 5.0);
    const [isDoFollow, setIsDoFollow] = useState(bookmaker?.isDoFollow || false);
    const [isActive, setIsActive] = useState(bookmaker?.isActive ?? true);

    const [translations, setTranslations] = useState<Record<string, any>>(() => {
        const initial: Record<string, any> = {};
        languages.forEach(lang => {
            const existing = bookmaker?.translations?.find((t: any) => t.languageCode === lang.code);
            initial[lang.code] = {
                languageCode: lang.code,
                name: existing?.name || "",
                bonusText: existing?.bonusText || "",
                affiliateUrl: existing?.affiliateUrl || "",
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = await updateBookmakerAction(bookmaker?.id || null, {
            logoUrl,
            rating: Number(rating),
            isDoFollow,
            isActive,
            translations: Object.values(translations)
        });

        if (result.success) {
            setMessage({ type: 'success', text: "Partner data synchronized!" });
            if (!bookmaker?.id) router.push('/admin/bookmakers');
            else router.refresh();
        } else {
            setMessage({ type: 'error', text: result.error });
        }
        setLoading(false);
    };

    const currentTrans = translations[activeLang];

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            {message && (
                <div className={`p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex space-x-2 border-b border-slate-100 pb-px">
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        type="button"
                        onClick={() => setActiveLang(lang.code)}
                        className={`px-8 py-4 font-black text-[10px] uppercase tracking-widest transition-all border-b-2 ${activeLang === lang.code ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-300'}`}
                    >
                        {lang.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-3 space-y-12">
                    <div className="premium-card p-10 bg-white border-none shadow-sm space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Brand Identity</label>
                            <input
                                type="text"
                                value={currentTrans.name}
                                onChange={(e) => handleTransChange('name', e.target.value)}
                                className="w-full text-4xl font-black text-slate-900 border-none outline-none placeholder:text-slate-100 uppercase italic tracking-tighter"
                                placeholder="e.g. 1XBET"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Welcome Bonus Package</label>
                            <input
                                type="text"
                                value={currentTrans.bonusText}
                                onChange={(e) => handleTransChange('bonusText', e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-600 outline-none focus:border-emerald-500"
                                placeholder="100% Up to $1000 + 50 Free Spins"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Deep Link (Affiliate URL)</label>
                            <input
                                type="text"
                                value={currentTrans.affiliateUrl}
                                onChange={(e) => handleTransChange('affiliateUrl', e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs text-blue-600 outline-none focus:border-emerald-500"
                                placeholder="https://tracking.partner.com/click?ai=..."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="premium-card p-8 bg-slate-900 border-none text-white space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Corporate Logo</label>
                            <ImageUpload value={logoUrl} onChange={setLogoUrl} />
                        </div>

                        <div className="space-y-4 border-t border-slate-800 pt-6">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Global Rating</label>
                                <span className="text-xl font-black text-emerald-400 italic">★ {rating}</span>
                            </div>
                            <input
                                type="range" min="1" max="5" step="0.1" value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>

                        <div className="space-y-4 border-t border-slate-800 pt-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">SEO Integrity</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[8px] font-black uppercase ${isDoFollow ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {isDoFollow ? 'DoFollow' : 'NoFollow'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsDoFollow(!isDoFollow)}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${isDoFollow ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDoFollow ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black uppercase tracking-widest italic text-xs transition-all shadow-xl shadow-emerald-900/40 disabled:opacity-50"
                        >
                            {loading ? 'DEPLOYING...' : 'Save Partner Profile'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
