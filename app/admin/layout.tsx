import "../globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
                <ThemeProvider>
                    <div className="flex min-h-screen">
                        {/* Sidebar */}
                        <aside className="w-72 bg-slate-900 text-white flex flex-col sticky top-0 h-screen shadow-2xl z-20">
                            <div className="p-8 flex items-center justify-between border-b border-slate-800">
                                <Link href="/admin/dashboard" className="text-xl font-black italic tracking-tighter">
                                    LIVE<span className="text-blue-500">BEZ</span> <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 block not-italic">CMS Suite</span>
                                </Link>
                            </div>

                            <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 px-3">Primary Content</div>
                                <Link href="/admin/leagues" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition group font-bold text-sm text-slate-300 hover:text-white">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                    Leagues
                                </Link>
                                <Link href="/admin/matches" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition group font-bold text-sm text-slate-300 hover:text-white">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                    Match Center
                                </Link>
                                <Link href="/admin/articles" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition group font-bold text-sm text-slate-300 hover:text-white">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                    Blog & Articles
                                </Link>

                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 px-3 pt-6">Partnership</div>
                                <Link href="/admin/bookmakers" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition group font-bold text-sm text-slate-300 hover:text-white">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                                    Bookmakers
                                </Link>

                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 px-3 pt-6">System Architecture</div>
                                <Link href="/admin/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition group font-bold text-sm text-slate-300 hover:text-white">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-all" />
                                    Global SEO Settings
                                </Link>
                                <Link href="/admin/languages" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition group font-bold text-sm text-slate-300 hover:text-white">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-all" />
                                    Multilingual Control
                                </Link>
                            </nav>

                            <div className="p-8 border-t border-slate-800 bg-slate-950/50">
                                <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-all">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                    Public Website
                                </Link>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 bg-white dark:bg-slate-950">
                            <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 h-24 flex items-center justify-between px-12">
                                <div className="flex items-center gap-4">
                                    <div className="text-[10px] font-black uppercase tracking-tighter bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-slate-400">Production Node</div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Site Live</span>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase tracking-widest dark:text-white">Platform Operator</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">admin@livebez.com</div>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-500/20">A</div>
                                </div>
                            </header>
                            <div className="p-12 overflow-y-auto">
                                {children}
                            </div>
                        </main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
