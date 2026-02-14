import Link from "next/link";
import { Search, Trophy, Star } from "lucide-react";
import SmartLogo from "./SmartLogo";

interface League {
    id: string;
    logoUrl?: string | null;
    translations: {
        name: string;
        slug: string;
    }[];
}

export default function LeaguesSidebar({ lang, leagues = [] }: { lang: string, leagues?: League[] }) {
    // If no leagues from DB, we can show some defaults but typically the Home page will pass real ones
    const displayLeagues = leagues.length > 0 ? leagues : [];

    return (
        <aside className="w-full space-y-8">
            <div className="portal-card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search League..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500 transition-all"
                    />
                </div>

                <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Explore Leagues</h3>

                    {displayLeagues.length > 0 ? (
                        displayLeagues.map((league) => (
                            <Link
                                key={league.id}
                                href={`/${lang}/league/${league.translations[0]?.slug}`}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-1.5 overflow-hidden">
                                    {/* Use a simple image or initial if SmartLogo fails */}
                                    {league.logoUrl ? (
                                        <img
                                            src={league.logoUrl}
                                            alt={league.translations[0]?.name || "League"}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                                        />
                                    ) : (
                                        <div className="text-[10px] font-black text-slate-400">{league.translations[0]?.name?.substring(0, 2)}</div>
                                    )}
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">
                                    {league.translations[0]?.name}
                                </span>
                            </Link>
                        ))
                    ) : (
                        <div className="text-[10px] font-bold text-slate-400 uppercase p-4 text-center italic">
                            Syncing leagues...
                        </div>
                    )}
                </div>

                <Link
                    href={`/${lang}/leagues`}
                    className="mt-6 w-full flex items-center justify-center py-4 bg-slate-50 dark:bg-slate-950 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-transparent hover:border-blue-600"
                >
                    View All Leagues
                </Link>
            </div>

            <div className="portal-card p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden group border-none shadow-xl shadow-blue-500/20">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                    <Star className="w-8 h-8 text-yellow-400 mb-4" />
                    <h4 className="text-xl font-black italic uppercase leading-tight mb-2">Premium Tips</h4>
                    <p className="text-[10px] font-medium text-blue-100 uppercase tracking-widest mb-6 leading-relaxed">Unlock detailed metrics and 85%+ win rate projections.</p>
                    <button className="w-full bg-white text-blue-600 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-2xl transition-all active:scale-95">
                        Upgrade to Pro
                    </button>
                </div>
            </div>
        </aside>
    );
}
