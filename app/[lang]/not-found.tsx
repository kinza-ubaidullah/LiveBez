"use client";

import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { useParams } from "next/navigation";

export default function NotFound() {
    const params = useParams();
    const lang = (params?.lang as string) || "en";
    const t = getDictionary(lang);

    return (
        <div className="container mx-auto px-4 py-32 text-center">
            <div className="relative mb-12">
                <div className="text-[180px] font-black text-slate-100 dark:text-slate-900 leading-none select-none">404</div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl">⚽</span>
                </div>
            </div>

            <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase italic">
                {t.ui?.pageNotFound || "Page Not Found"}
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-xl mx-auto font-medium">
                The match report you're looking for doesn't exist or has been moved to a different league.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                    href={`/${lang}`}
                    className="px-10 py-5 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
                >
                    Return to Field
                </Link>
                <Link
                    href={`/${lang}/blog`}
                    className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                    Read Latest News
                </Link>
            </div>
        </div>
    );
}
