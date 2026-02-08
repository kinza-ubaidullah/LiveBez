"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Menu, X, LayoutDashboard, Trophy, Target, FileText,
    Share2, Settings, Globe, LogOut, ExternalLink,
    CheckSquare, Database, Bell, Briefcase
} from "lucide-react";

export default function AdminSidebar() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Listen for custom events to toggle sidebar from header
    useEffect(() => {
        const toggleSidebar = () => setSidebarOpen(prev => !prev);
        window.addEventListener('toggle-admin-sidebar', toggleSidebar);
        return () => window.removeEventListener('toggle-admin-sidebar', toggleSidebar);
    }, []);

    const navItems = [
        { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard, color: "text-blue-500" },
        { label: "Leagues", href: "/admin/leagues", icon: Trophy, color: "text-amber-500", group: "Sports Engine" },
        { label: "Teams Profile", href: "/admin/teams", icon: Globe, color: "text-emerald-500" },
        { label: "Match Center", href: "/admin/matches", icon: Target, color: "text-rose-500" },
        { label: "Analysis Lab", href: "/admin/analysis", icon: CheckSquare, color: "text-purple-500", group: "Editorial Control" },
        { label: "Match Predictions", href: "/admin/predictions", icon: Briefcase, color: "text-orange-500" },
        { label: "Blog & Articles", href: "/admin/articles", icon: FileText, color: "text-sky-500" },
        { label: "Partners & Bookies", href: "/admin/bookmakers", icon: Share2, color: "text-indigo-500", group: "System Hub" },
        { label: "Main Settings", href: "/admin/settings", icon: Settings, color: "text-slate-500" },
        { label: "Multilingual", href: "/admin/languages", icon: Globe, color: "text-emerald-500" },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Shell */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white flex flex-col shadow-2xl transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0
            `}>
                <div className="p-8 flex items-center justify-between">
                    <Link href="/admin/dashboard" className="text-2xl font-black italic tracking-tighter group flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center not-italic shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">L</div>
                        <span>LIVE<span className="text-blue-500">BEZ</span></span>
                    </Link>
                    <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar pt-2">
                    {navItems.map((item, idx) => (
                        <div key={item.href}>
                            {item.group && (
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mt-8 mb-4 px-3 unselectable">{item.group}</div>
                            )}
                            <Link
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center justify-between p-3.5 rounded-2xl transition-all group font-bold text-sm
                                    ${isActive(item.href)
                                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-4 h-4 ${isActive(item.href) ? 'text-white' : item.color}`} />
                                    {item.label}
                                </div>
                                {isActive(item.href) && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-glow" />
                                )}
                            </Link>
                        </div>
                    ))}
                </nav>

                <div className="p-6 mt-auto">
                    <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 space-y-4">
                        <Link href="/" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-all group">
                            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            Launch Website
                        </Link>
                        <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-all">
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out System
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
