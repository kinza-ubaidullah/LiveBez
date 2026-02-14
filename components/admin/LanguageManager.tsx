"use client";

import { useState } from "react";
import { toggleLanguageVisibility } from "@/lib/actions/language-actions";

export default function LanguageManager({ initialLanguages }: { initialLanguages: any[] }) {
    const [langs, setLangs] = useState(initialLanguages);
    const [loading, setLoading] = useState<string | null>(null);

    const handleToggle = async (code: string, currentVisible: boolean) => {
        setLoading(code);
        const res = await toggleLanguageVisibility(code, !currentVisible);
        if (res.success) {
            setLangs(langs.map(l => l.code === code ? { ...l, isVisible: !currentVisible } : l));
        }
        setLoading(null);
    };

    return (
        <div className="premium-card bg-white border-none shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 italic">
                    <tr>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Language</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Code</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Public Visibility</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {langs.map((lang) => (
                        <tr key={lang.code} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-8 py-6">
                                <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase italic tracking-tighter">{lang.name}</span>
                            </td>
                            <td className="px-8 py-6">
                                <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">{lang.code}</span>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${lang.isVisible ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${lang.isVisible ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {lang.isVisible ? 'Visible' : 'Hidden'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <button
                                    onClick={() => handleToggle(lang.code, lang.isVisible)}
                                    disabled={loading === lang.code}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${lang.isVisible
                                        ? 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                                        }`}
                                >
                                    {loading === lang.code ? 'Processing...' : lang.isVisible ? 'Hide Version' : 'Go Public'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
