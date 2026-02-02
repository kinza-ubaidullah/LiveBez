"use client";

import Link from "next/link";
import { Search, Trophy, Star } from "lucide-react";

const popularLeagues = [
    { name: "Premier League", id: "39", flag: "🇬🇧" },
    { name: "La Liga", id: "140", flag: "🇪🇸" },
    { name: "Serie A", id: "135", flag: "🇮🇹" },
    { name: "Bundesliga", id: "78", flag: "🇩🇪" },
    { name: "Ligue 1", id: "61", flag: "🇫🇷" },
    { name: "Champions League", id: "2", flag: "⚽" },
    { name: "Europa League", id: "3", flag: "🏆" },
];

export default function LeaguesSidebar({ lang }: { lang: string }) {
    return (
        <aside className="w-full space-y-8">
            <div className="portal-card p-6">
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search League..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500 transition-all"
                    />
                </div>

                <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Popular Leagues</h3>
                    {popularLeagues.map((league) => (
                        <Link
                            key={league.id}
                            href={`/${lang}/league/${league.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm grayscale group-hover:grayscale-0 transition-all">
                                {league.flag}
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                {league.name}
                            </span>
                        </Link>
                    ))}
                </div>

                <Link
                    href={`/${lang}/leagues`}
                    className="mt-6 w-full flex items-center justify-center py-3 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                >
                    View All Leagues
                </Link>
            </div>

            <div className="portal-card p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                    <Star className="w-8 h-8 text-yellow-400 mb-4" />
                    <h4 className="text-xl font-black italic uppercase leading-tight mb-2">Premium Tips</h4>
                    <p className="text-[10px] font-medium text-blue-100 uppercase tracking-widest mb-6">Win up to 85% accurately</p>
                    <button className="w-full bg-white text-blue-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl transition-all active:scale-95">
                        Try Now
                    </button>
                </div>
            </div>
        </aside>
    );
}
