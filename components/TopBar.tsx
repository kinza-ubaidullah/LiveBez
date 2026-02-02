"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Gift, Globe, ChevronDown, User, Settings, LogIn, Moon, Sun } from "lucide-react";
import LoginModal from "./auth/LoginModal";
import RegisterModal from "./auth/RegisterModal";
import { useTheme } from "./ThemeProvider";
import { useRouter, usePathname } from "next/navigation";

interface TopBarProps {
    lang: string;
    languages: any[];
}

export default function TopBar({ lang, languages }: TopBarProps) {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();

    const switchLanguage = (newLang: string) => {
        const segments = pathname.split('/');
        segments[1] = newLang;
        router.push(segments.join('/'));
    };

    const currentLangName = languages.find(l => l.code === lang)?.name || "English";

    return (
        <>
            <div className="bg-[#0f172a] text-white/60 border-b border-white/5 py-2 px-6 hidden lg:block">
                <div className="container mx-auto flex items-center justify-between">
                    {/* Left: Socials */}
                    {/* Left: Socials - Empty for now to declutter */}
                    <div className="flex items-center gap-8">
                    </div>

                    {/* Right: Utilities */}
                    <div className="flex items-center gap-8">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-2 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest"
                        >
                            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                        </button>

                        {/* Language switcher */}
                        <div className="relative group py-1">
                            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                                <Globe className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{currentLangName}</span>
                                <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                            </div>

                            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[150]">
                                {languages.map((l) => (
                                    <button
                                        key={l.code}
                                        onClick={() => switchLanguage(l.code)}
                                        className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors ${lang === l.code ? 'text-blue-400' : 'text-white/60'}`}
                                    >
                                        {l.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Login */}
                        <button
                            onClick={() => setIsLoginOpen(true)}
                            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Log in</span>
                        </button>
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
        </>
    );
}
