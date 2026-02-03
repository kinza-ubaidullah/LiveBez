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

interface NavbarProps {
    lang: string;
    t: any;
    languages: any[];
}

export default function Navbar({ lang, t, languages }: NavbarProps) {
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

    const currentLangName = languages.find(l => l.code === lang)?.name || "English";

    // Auto-Sync Logic (Run every 5 minutes)
    useEffect(() => {
        const syncData = async () => {
            const lastSync = localStorage.getItem('last_odds_sync');
            const now = Date.now();

            // Sync if never synced or > 5 minutes ago
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
            name: t.nav.predictions || "Predictions",
            href: `/${lang}/predictions`,
            icon: Target,
            hasDropdown: true,
            dropdownContent: (
                <div className="grid grid-cols-2 gap-8 w-[600px] p-6">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">By Market</h4>
                        <Link href={`/${lang}/predictions/1x2`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">1X2 Predictions</div>
                                <div className="text-[10px] text-slate-500 font-medium">Match Winner</div>
                            </div>
                        </Link>
                        <Link href={`/${lang}/predictions/btts`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">BTTS</div>
                                <div className="text-[10px] text-slate-500 font-medium">Both Teams To Score</div>
                            </div>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Featured</h4>
                        <Link href={`/${lang}/predictions`} className="block relative group overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
                            <div className="relative z-10">
                                <Star className="w-8 h-8 mb-3 text-yellow-400" />
                                <div className="font-black text-lg uppercase italic tracking-tighter mb-1">Banker of the Day</div>
                                <div className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Highest confidence pick</div>
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
                <div className="grid grid-cols-2 gap-8 w-[500px] p-6">
                    <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Popular Leagues</h4>
                        {[
                            { name: "Premier League", flag: "🇬🇧", id: "39" },
                            { name: "La Liga", flag: "🇪🇸", id: "140" },
                            { name: "Serie A", flag: "🇮🇹", id: "135" },
                            { name: "Bundesliga", flag: "🇩🇪", id: "78" },
                            { name: "Ligue 1", flag: "🇫🇷", id: "61" },
                        ].map(league => (
                            <Link key={league.id} href={`/${lang}/league/${league.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                                <span className="text-lg">{league.flag}</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight hover:text-blue-600">{league.name}</span>
                            </Link>
                        ))}
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Internationals</h4>
                        <div className="space-y-2">
                            <Link href={`/${lang}/league/2`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Champions League</span>
                            </Link>
                            <Link href={`/${lang}/league/3`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                                <Shield className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Europa League</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )
        },
        {
            name: t.ui?.bettingTips || "Betting Tips",
            href: `/${lang}/bookmakers`,
            icon: Zap,
            hasDropdown: true,
            dropdownContent: (
                <div className="w-[300px] p-6 space-y-4">
                    <Link href={`/${lang}/bookmakers`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Top Bookmakers</div>
                            <div className="text-[10px] text-slate-500">Rated & Reviewed</div>
                        </div>
                    </Link>
                    <Link href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group opacity-50 cursor-not-allowed">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                            <Crown className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Academy (Coming Soon)</div>
                            <div className="text-[10px] text-slate-500">Learn to bet like a pro</div>
                        </div>
                    </Link>
                </div>
            )
        },
        { name: t.nav.articles || "Articles", href: `/${lang}/blog`, icon: Newspaper, hasDropdown: false },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-[110] shadow-xl">
            {/* Top Bar Utilities */}
            <TopBar lang={lang} languages={languages} />

            {/* Main Navbar */}
            <div className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 h-16 xl:h-20 px-4 md:px-6">
                <div className="container mx-auto flex items-center justify-between h-full">
                    <div className="flex items-center gap-4 xl:gap-12 h-full">
                        {/* Logo */}
                        <Link href={`/${lang}`} className="relative h-8 xl:h-10 w-32 xl:w-44 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300">
                            <Image
                                src="/logo.png"
                                alt="LiveBaz Logo"
                                fill
                                sizes="(max-width: 768px) 128px, 176px"
                                className="object-contain ltr:object-left rtl:object-right"
                                priority
                            />
                        </Link>

                        {/* Desktop Nav - Mega Menu */}
                        <nav className="hidden xl:flex items-center h-full gap-8">
                            {navItems.map((item) => (
                                <div
                                    key={item.name}
                                    className="relative group h-full flex items-center"
                                    onMouseEnter={() => setActiveDropdown(item.name)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link
                                        href={item.href}
                                        className="nav-link flex items-center gap-2 py-2 hover:text-blue-600 transition-all duration-300"
                                    >
                                        <span className="text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight text-[11px] font-black flex items-center gap-1">
                                            {item.name}
                                            {item.hasDropdown && <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:rotate-180" />}
                                        </span>
                                    </Link>

                                    {/* Mega Menu Dropdown */}
                                    {item.hasDropdown && (
                                        <div
                                            className={`absolute top-[calc(100%-1px)] left-0 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-b-2xl overflow-hidden transition-all duration-300 origin-top-left ${activeDropdown === item.name
                                                ? 'opacity-100 visible translate-y-0'
                                                : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                                                }`}
                                        >
                                            {item.dropdownContent}
                                            {/* Design element */}
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <div className="relative group hidden lg:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                suppressHydrationWarning={true}
                                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-12 pr-6 text-xs font-bold outline-none focus:border-blue-500 transition-all w-48 focus:w-64"
                            />
                        </div>

                        <button
                            onClick={() => setIsMenuOpen(true)}
                            suppressHydrationWarning
                            className="xl:hidden p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
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
                            <button onClick={() => setIsMenuOpen(false)} suppressHydrationWarning className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <X className="w-5 h-5 text-slate-900 dark:text-white" />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-4">
                            {navItems.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between group py-2"
                                >
                                    <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-blue-600 transition-colors italic">
                                        {link.name}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-8 space-y-6">
                            <div className="flex flex-col gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferences</span>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={toggleTheme}
                                        suppressHydrationWarning
                                        className="flex items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300"
                                    >
                                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        {theme === 'dark' ? 'Light' : 'Dark'}
                                    </button>

                                    <div className="relative group">
                                        <button className="w-full flex items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                            <Globe className="w-4 h-4" />
                                            {lang.toUpperCase()}
                                        </button>
                                        <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl py-2 hidden group-hover:block z-[160]">
                                            {languages.map((l) => (
                                                <button
                                                    key={l.code}
                                                    onClick={() => switchLanguage(l.code)}
                                                    className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest ${lang === l.code ? 'text-blue-600' : 'text-slate-400'}`}
                                                >
                                                    {l.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                                <button
                                    onClick={() => { setIsMenuOpen(false); setIsLoginOpen(true); }}
                                    suppressHydrationWarning
                                    className="w-full bg-blue-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Account Login
                                </button>
                                <div className="flex items-center justify-between px-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New user?</span>
                                    <button
                                        onClick={() => { setIsMenuOpen(false); setIsRegisterOpen(true); }}
                                        className="text-blue-600 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Create Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onSwitchToRegister={() => {
                    setIsLoginOpen(false);
                    setIsRegisterOpen(true);
                }}
            />
            <RegisterModal
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                onSwitchToLogin={() => {
                    setIsRegisterOpen(false);
                    setIsLoginOpen(true);
                }}
            />
        </header>
    );
}
