"use client";

import "../globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useState } from "react";
import { Menu, X, LayoutDashboard, Trophy, Target, FileText, Share2, Settings, Globe, LogOut, ExternalLink } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { label: "Leagues", href: "/admin/leagues", icon: Trophy, color: "text-blue-500" },
        { label: "Match Center", href: "/admin/matches", icon: Target, color: "text-blue-500" },
        { label: "Blog & Articles", href: "/admin/articles", icon: FileText, color: "text-blue-500" },
        { label: "Bookmakers", href: "/admin/bookmakers", icon: Share2, color: "text-emerald-500", group: "Partnership" },
        { label: "Global SEO", href: "/admin/settings", icon: Settings, color: "text-orange-500", group: "System Architecture" },
        { label: "Multilingual", href: "/admin/languages", icon: Globe, color: "text-purple-500" },
    ];

    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
                <ThemeProvider>
                    <div className="flex min-h-screen relative">
                        {/* Mobile Sidebar Overlay */}
                        {isSidebarOpen && (
                            <div
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                                onClick={() => setSidebarOpen(false)}
                            />
                        )}

                        {/* Sidebar */}
                        <aside className={`
                            fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 transform
                            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
                        `}>
                            <div className="p-6 flex items-center justify-between border-b border-slate-800">
                                <Link href="/admin/dashboard" className="text-xl font-black italic tracking-tighter" onClick={() => setSidebarOpen(false)}>
                                    LIVE<span className="text-blue-500">BEZ</span> <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 block not-italic">CMS Suite</span>
                                </Link>
                                <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg" onClick={() => setSidebarOpen(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                                {navItems.map((item, idx) => (
                                    <div key={item.href}>
                                        {item.group && (
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-6 mb-4 px-3">{item.group}</div>
                                        )}
                                        {!item.group && idx === 0 && (
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 px-3">Primary Content</div>
                                        )}
                                        <Link
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition group font-bold text-sm text-slate-300 hover:text-white"
                                        >
                                            <item.icon className={`w-4 h-4 ${item.color}`} />
                                            {item.label}
                                        </Link>
                                    </div>
                                ))}
                            </nav>

                            <div className="p-6 border-t border-slate-800 bg-slate-950/20">
                                <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-all">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Public Website
                                </Link>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col min-w-0">
                            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 h-16 lg:h-20 flex items-center justify-between px-4 lg:px-12">
                                <div className="flex items-center gap-4">
                                    <button
                                        className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
                                        onClick={() => setSidebarOpen(true)}
                                    >
                                        <Menu className="w-6 h-6" />
                                    </button>
                                    <div className="hidden sm:flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Production Node</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 lg:gap-6">
                                    <div className="hidden sm:block text-right">
                                        <div className="text-[10px] font-black uppercase tracking-widest dark:text-white">Operator</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">admin@livebaz.com</div>
                                    </div>
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
                                        A
                                    </div>
                                </div>
                            </header>

                            <main className="flex-1 p-4 sm:p-6 lg:p-12 overflow-x-hidden">
                                {children}
                            </main>
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}

