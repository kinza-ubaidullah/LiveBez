"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function LanguageSwitcher({ currentLang, languages }: { currentLang: string, languages: any[] }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleLanguageChange = (newLang: string) => {
        const pathSegments = pathname.split('/').filter(Boolean);

        // If it's a deep page (e.g., /en/league/... or /en/match/...), redirect to new lang home
        // because slugs are different across languages and will 404.
        const isDeepPage = pathSegments.length > 2;

        let newPath = `/${newLang}`;

        if (!isDeepPage && pathSegments.length > 1) {
            // It's a shallow page like /en/leagues or /en/bookmakers, these usually have same slugs or handled by folders
            pathSegments[0] = newLang;
            newPath = '/' + pathSegments.join('/');
        }

        router.push(newPath);
        setIsOpen(false);
    };

    const activeLang = languages.find(l => l.code === currentLang) || { name: 'English', code: 'en' };

    const getFlag = (code: string) => {
        switch (code) {
            case 'en': return '🇺🇸';
            case 'fa': return '🇮🇷';
            case 'ar': return '🇸🇦';
            default: return '🌐';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-600/50 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 group shadow-sm active:scale-95 bg-slate-50/50 dark:bg-slate-900/50"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">{getFlag(activeLang.code)}</span>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors">
                        {activeLang.code}
                    </span>
                </div>
                <div className={`w-px h-3 bg-slate-200 dark:bg-slate-800 transition-colors group-hover:bg-blue-200`} />
                <svg className={`w-3 h-3 text-slate-300 transition-transform duration-500 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 ltr:right-0 rtl:left-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-200/50 dark:border-slate-800 py-3 z-[150] animate-fade-up">
                        <div className="px-6 py-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {activeLang.code === 'en' ? 'Select Region' :
                                    activeLang.code === 'fa' ? 'انتخاب منطقه' :
                                        activeLang.code === 'ar' ? 'اختر المنطقة' : 'Select Region'}
                            </span>
                        </div>
                        <div className="px-2 space-y-1">
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full text-start px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all flex items-center justify-between group/lang active:scale-[0.98] ${currentLang === lang.code ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-base grayscale group-hover/lang:grayscale-0 transition-all ${currentLang === lang.code ? 'grayscale-0' : ''}`}>{getFlag(lang.code)}</span>
                                        <span>
                                            {lang.code === 'en' ? 'English (US)' :
                                                lang.code === 'fa' ? 'Persian (IR)' :
                                                    lang.code === 'ar' ? 'Arabic (SA)' : lang.name}
                                        </span>
                                    </div>
                                    {currentLang === lang.code && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.8)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
