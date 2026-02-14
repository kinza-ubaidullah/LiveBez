"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLanguage } from "@/lib/actions/language-actions";
import Link from "next/link";

export default function LanguageForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await createLanguage({ name, code, isVisible });

        if (res.success) {
            router.push("/admin/languages");
        } else {
            setError(res.error || "Failed to create language");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="premium-card bg-white p-8 max-w-2xl mx-auto space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Language Name</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="e.g. English"
                />
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ISO Code (2-letter)</label>
                <input
                    type="text"
                    required
                    maxLength={2}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toLowerCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="e.g. en"
                />
            </div>

            <div className="flex items-center gap-4 py-4">
                <div
                    onClick={() => setIsVisible(!isVisible)}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${isVisible ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                    <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all shadow-sm ${isVisible ? 'right-1' : 'left-1'}`} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Make visible on site immediately
                </span>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-100">
                <Link
                    href="/admin/languages"
                    className="flex-1 py-4 text-center rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 transition-all"
                >
                    Cancel
                </Link>
                <button
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Language"}
                </button>
            </div>
        </form>
    );
}
