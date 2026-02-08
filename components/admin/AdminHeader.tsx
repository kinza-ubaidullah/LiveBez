"use client";

import { Menu, Bell, Search, Command } from "lucide-react";

export default function AdminHeader() {
    const handleToggleSidebar = () => {
        window.dispatchEvent(new CustomEvent('toggle-admin-sidebar'));
    };

    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 h-16 lg:h-24 flex items-center justify-between px-6 lg:px-12 transition-all">
            <div className="flex items-center gap-6 flex-1">
                <button
                    className="lg:hidden p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 transition-colors"
                    onClick={handleToggleSidebar}
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="hidden md:flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 px-5 py-2.5 rounded-2xl max-w-md w-full focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all group">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search system nodes..."
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 dark:text-slate-300 w-full placeholder:text-slate-400"
                    />
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-md shadow-sm">
                        <Command className="w-2.5 h-2.5 text-slate-400" />
                        <span className="text-[8px] font-black text-slate-400">K</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 lg:gap-8">
                <div className="hidden lg:flex flex-col items-end">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Active Node</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PROD_ENV_USW2</span>
                </div>

                <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden lg:block" />

                <div className="flex items-center gap-3 lg:gap-6">
                    <button className="relative p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500">
                        <Bell className="w-5 h-5" />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950" />
                    </button>

                    <div className="flex items-center gap-4 pl-2 border-l border-slate-100 dark:border-slate-800">
                        <div className="hidden sm:block text-right">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none mb-1">Root Admin</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">admin@livebez.com</div>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-500/20 cursor-pointer hover:scale-105 active:scale-95 transition-all text-lg tracking-tighter italic">
                            A
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
