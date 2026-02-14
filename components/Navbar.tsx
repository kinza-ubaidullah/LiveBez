"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Menu, X, Search, ChevronDown, ChevronRight, Globe,
    LayoutDashboard, Target, Shield, Trophy, Activity, MessageSquare,
    Zap, Star, Newspaper, Crown, Moon, Sun, LogIn
} from "lucide-react";
import TopBar from "./TopBar";
import { useTheme } from "./ThemeProvider";
import { useRouter, usePathname } from "next/navigation";
import LoginModal from "./auth/LoginModal";
import RegisterModal from "./auth/RegisterModal";
import SmartLogo from "./SmartLogo";

interface NavbarProps {
    lang: string;
    t: any;
    languages: any[];
    leagues: any[];
    bookmakers: any[];
}

export default function Navbar({ lang, t, languages, leagues, bookmakers }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();

    const switchLanguage = (newLang: string) => {
        const segments = pathname.split('/');
        segments[1] = newLang;
        router.push(segments.join('/'));
        setIsMenuOpen(false);
    };

    // Auto-Sync Logic (Every 5 minutes for demonstration)
    useEffect(() => {
        const syncData = async () => {
            const lastSync = localStorage.getItem('last_odds_sync');
            const now = Date.now();
            if (!lastSync || now - parseInt(lastSync) > 5 * 60 * 1000) {
                try {
                    await fetch('/api/sync/matches');
                    localStorage.setItem('last_odds_sync', now.toString());
                } catch (e) {
                    console.error("Sync failed", e);
                }
            }
        };
        syncData();
    }, []);

    const navItems = [
        {
            name: t.nav?.predictions || "Predictions",
            href: `/${lang}/predictions`,
            icon: Target,
            hasDropdown: true,
            dropdownContent: (
                <div className="grid grid-cols-2 gap-8 w-[600px] p-6">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">By Market</h4>
                        <Link href={`/${lang}/predictions`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors italic uppercase tracking-tighter">AI Analysis</div>
                                <div className="text-[10px] text-slate-500 font-medium tracking-widest">Expert generated</div>
                            </div>
                        </Link>
                        <Link href={`/${lang}/predictions`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors italic uppercase tracking-tighter">Probabilities</div>
                                <div className="text-[10px] text-slate-500 font-medium tracking-widest">Algorithmic picks</div>
                            </div>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Featured</h4>
                        <Link href={`/${lang}/predictions`} className="block relative group overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-xl shadow-blue-600/20">
                            <div className="relative z-10">
                                <Star className="w-8 h-8 mb-3 text-yellow-400" />
                                <div className="font-black text-lg uppercase italic tracking-tighter mb-1 leading-none italic uppercase italic">Top Predictions</div>
                                <div className="text-[10px] font-medium opacity-80 uppercase tracking-widest">View latest tips</div>
                            </div>
                        </Link>
                    </div>
                </div>
            )
        },
        {
            name: t.leagues?.title || "Leagues",
            href: `/${lang}/leagues`,
            icon: Trophy,
            hasDropdown: true,
            dropdownContent: (
                <div className="w-[300px] p-6 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Popular Leagues</h4>
                    {leagues.length > 0 ? leagues.map((league) => (
                        <Link key={league.id} href={`/${lang}/league/${league.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group">
                            <SmartLogo
                                src={league.logoUrl}
                                alt={league.translations[0]?.name || "League"}
                                width={20}
                                height={20}
                                className="object-contain"
                            />
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-blue-600 transition-colors italic">
                                {league.translations[0]?.name || league.country}
                            </span>
                        </Link>
                    )) : (
                        <div className="text-[10px] font-bold text-slate-400 uppercase p-2">Syncing leagues...</div>
                    )}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Link href={`/${lang}/leagues`} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline px-2 italic">
                            View All Leagues →
                        </Link>
                    </div>
                </div>
            )
        },
        {
            name: t.ui?.bettingTips || "Bookies",
            href: `/${lang}/bookmakers`,
            icon: Zap,
            hasDropdown: true,
            dropdownContent: (
                <div className="w-[350px] p-6 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Top Partners</h4>
                    {bookmakers.map((bm) => (
                        <Link key={bm.id} href={`/${lang}/bookmakers`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                                    <SmartLogo src={bm.logoUrl} alt={bm.translations[0]?.name || "logo"} width={24} height={24} className="p-1" />
                                </div>
                                <div>
                                    <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{bm.translations[0]?.name}</div>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                                        <span className="text-[8px] font-black text-slate-400">{bm.rating}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded italic uppercase">
                                {bm.translations[0]?.bonusText?.slice(0, 15)}...
                            </div>
                        </Link>
                    ))}
                    <Link href={`/${lang}/bookmakers`} className="block pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline px-2 italic">
                        All Bookmakers Reviews →
                    </Link>
                </div>
            )
        },
        { name: t.nav?.articles || "Articles", href: `/${lang}/blog`, icon: Newspaper, hasDropdown: false },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-[110] shadow-xl">
            <TopBar lang={lang} languages={languages} />
            <div className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 h-16 xl:h-20 px-4 md:px-6">
                <div className="container mx-auto flex items-center justify-between h-full">
                    <div className="flex items-center gap-4 xl:gap-12 h-full">
                        <Link href={`/${lang}`} className="relative h-8 xl:h-10 w-32 xl:w-44 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300">
                            <Image src="/logo.png" alt="Logo" fill className="object-contain ltr:object-left rtl:object-right" priority />
                        </Link>

                        <nav className="hidden xl:flex items-center h-full gap-8">
                            {navItems.map((item) => (
                                <div
                                    key={item.name}
                                    className="relative group h-full flex items-center"
                                    onMouseEnter={() => setActiveDropdown(item.name)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link href={item.href} className="nav-link flex items-center gap-2 py-2">
                                        <span className="text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight text-[11px] font-black flex items-center gap-1 italic">
                                            {item.name}
                                            {item.hasDropdown && <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:rotate-180" />}
                                        </span>
                                    </Link>
                                    {item.hasDropdown && (
                                        <div className={`absolute top-[calc(100%-1px)] left-0 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-b-2xl overflow-hidden transition-all duration-300 origin-top-left ${activeDropdown === item.name ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                                            {item.dropdownContent}
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group hidden lg:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                            <input
                                type="text"
                                placeholder="Search..."
                                suppressHydrationWarning
                                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-12 pr-6 text-xs font-bold outline-none focus:border-blue-500 transition-all w-48 focus:w-64"
                            />
                        </div>
                        <button onClick={() => setIsMenuOpen(true)} className="xl:hidden p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[105] bg-slate-950/80 backdrop-blur-xl transition-all duration-500 xl:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className={`absolute inset-y-0 right-0 w-[85%] max-w-sm bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-500 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full p-6 pt-24 overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigation</span>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <X className="w-5 h-5 text-slate-900 dark:text-white" />
                            </button>
                        </div>
                        <nav className="flex flex-col gap-4">
                            {navItems.map((link) => (
                                <Link key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between group py-2">
                                    <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-blue-600 transition-colors italic">{link.name}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSwitchToRegister={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }} />
            <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} onSwitchToLogin={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }} />
        </header>
    );
}
