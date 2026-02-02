"use client";

import { User, Crown, Bell, Settings, Star, TrendingUp, History, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function UserDashboard({ params }: { params: { lang: string } }) {
    const { lang } = params;

    const stats = [
        { label: "Tips Followed", value: "128", icon: TrendingUp, color: "text-blue-500" },
        { label: "Win Rate", value: "72%", icon: Star, color: "text-amber-500" },
        { label: "Profit", value: "+14.5u", icon: Crown, color: "text-emerald-500" },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 overflow-hidden group">
                                <User className="w-12 h-12 group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <ShieldCheck className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Welcome Back, Alex</h1>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Premium Member</span>
                                <span className="text-xs text-slate-400 font-medium italic">Member since Jan 2026</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-600/50 transition-all group active:scale-95">
                            <Bell className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                        </button>
                        <button className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-600/50 transition-all group active:scale-95">
                            <Settings className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {stats.map((stat) => (
                        <div key={stat.label} className="premium-card p-8 group">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 group-hover:bg-blue-600 transition-all duration-500 ${stat.color} group-hover:text-white`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">30 Day Report</span>
                            </div>
                            <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                    <History className="w-5 h-5 text-blue-600" /> Recent Predictions
                                </h2>
                                <Link href="#" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</Link>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="premium-card p-6 flex items-center justify-between gap-6 hover:scale-[1.01]">
                                        <div className="flex items-center gap-6">
                                            <div className="text-center min-w-[60px]">
                                                <div className="text-xs font-black text-slate-900 dark:text-white uppercase">2 Feb</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">21:00</div>
                                            </div>
                                            <div className="h-10 w-px bg-slate-100 dark:bg-slate-800" />
                                            <div>
                                                <div className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight italic">Arsenal vs Chelsea</div>
                                                <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Premier League</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Home Win</div>
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
                            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-150 transition-transform duration-1000">
                                <Crown className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">Membership Status</div>
                                <h3 className="text-3xl font-black mb-6 leading-tight italic">GO PRO FOR<br />EXPERT PICKS</h3>
                                <button className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black uppercase tracking-[0.1em] text-xs hover:bg-slate-50 transition-all active:scale-95 shadow-xl">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>

                        <div className="premium-card p-8">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Expert Performance</h4>
                            <div className="space-y-6">
                                {[
                                    { name: "Global Master", rate: "84%", trend: "up" },
                                    { name: "Value Finder", rate: "79%", trend: "down" },
                                    { name: "BTTS King", rate: "81%", trend: "up" }
                                ].map((expert) => (
                                    <div key={expert.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black">{expert.name[0]}</div>
                                            <span className="text-xs font-black uppercase tracking-tight">{expert.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-slate-900 dark:text-white">{expert.rate}</span>
                                            <div className={`w-1.5 h-1.5 rounded-full ${expert.trend === 'up' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
