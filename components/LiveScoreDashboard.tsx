"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Activity, Trophy, TrendingUp, Info, ChevronRight, Zap, Target, Timer } from "lucide-react";
import clsx from "clsx";

interface Match {
    id: string;
    homeTeam: string;
    homeTeamLogo: string;
    awayTeam: string;
    awayTeamLogo: string;
    homeScore: number;
    awayScore: number;
    time: string;
    status: string;
    leagueSlug?: string;
    matchSlug?: string;
    prediction?: {
        home: number;
        draw: number;
        away: number;
    } | null;
    liveTip?: string | null;
}

interface League {
    id: number;
    name: string;
    logo: string;
    country: string;
    matches: Match[];
}

export default function LiveScoreDashboard({ lang, t }: { lang: string, t: any }) {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLiveScores = async () => {
        try {
            const res = await fetch(`/api/live-scores?lang=${lang}`);
            const data = await res.json();
            if (data.success) {
                setLeagues(data.data);
            } else {
                setError("Failed to load live scores");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLiveScores();
        const interval = setInterval(fetchLiveScores, 10000); // Faster 10s refresh for live feel
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">{t.liveScore.scanning}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-center">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 font-bold uppercase text-xs tracking-widest">{error}</p>
            </div>
        );
    }

    if (leagues.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-8 shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 dark:to-white/5" />
                    <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">{t.liveScore.noLive}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-sm leading-relaxed">
                    {t.liveScore.noLiveDesc}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-12">
            {leagues.map((league) => (
                <div key={league.id} className="relative">
                    {/* League Header - Sticky & Glassmorphic */}
                    <div className="sticky top-[70px] z-30 mb-6 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-y border-slate-100 dark:border-slate-800 py-3 px-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 relative grayscale opacity-80">
                                <Image src={league.logo} alt={league.name} fill className="object-contain" unoptimized />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{league.name}</h4>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{league.country}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-900/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-[ping_1.5s_ease-in-out_infinite]" />
                            <span className="text-[8px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">{t.ui.live}</span>
                        </div>
                    </div>

                    {/* Matches Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4 md:px-0">
                        {league.matches.map((match) => (
                            <Link
                                href={`/${lang}/match/${match.matchSlug || match.id}`}
                                key={match.id}
                                className="group relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col"
                            >
                                {/* Active Live Indicator Bar */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Match Status Header */}
                                <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-2 text-red-500">
                                        <Timer className="w-3 h-3" />
                                        <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">{match.time}&apos;</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{match.status}</span>
                                </div>

                                {/* Scoreboard Area */}
                                <div className="p-6 flex-1 flex flex-col justify-center">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Home Team */}
                                        <div className="flex-1 text-center group/team">
                                            <div className="relative w-12 h-12 mx-auto mb-3 transition-transform group-hover/team:scale-110 duration-300">
                                                <Image src={match.homeTeamLogo} alt={match.homeTeam} fill className="object-contain" unoptimized />
                                            </div>
                                            <h5 className="text-[10px] md:text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate w-full">
                                                {match.homeTeam}
                                            </h5>
                                        </div>

                                        {/* Score Display */}
                                        <div className="flex flex-col items-center gap-1 min-w-[60px]">
                                            <div className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter tabular-nums leading-none">
                                                {match.homeScore}-{match.awayScore}
                                            </div>
                                            <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">VS</span>
                                        </div>

                                        {/* Away Team */}
                                        <div className="flex-1 text-center group/team">
                                            <div className="relative w-12 h-12 mx-auto mb-3 transition-transform group-hover/team:scale-110 duration-300">
                                                <Image src={match.awayTeamLogo} alt={match.awayTeam} fill className="object-contain" unoptimized />
                                            </div>
                                            <h5 className="text-[10px] md:text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate w-full">
                                                {match.awayTeam}
                                            </h5>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Analytics / Footer */}
                                <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-100 dark:border-slate-800">
                                    {match.prediction ? (
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                                    <TrendingUp className="w-3 h-3 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Calculated Probabilities</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-0.5 h-1.5 w-16">
                                                <div className="h-full bg-blue-500 rounded-l-full" style={{ width: `${match.prediction.home}%` }} />
                                                <div className="h-full bg-slate-300" style={{ width: `${match.prediction.draw}%` }} />
                                                <div className="h-full bg-blue-300 rounded-r-full" style={{ width: `${match.prediction.away}%` }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 py-1 opacity-50">
                                            <Target className="w-3 h-3 text-slate-400" />
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.liveScore.analyzing}</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function AlertTriangle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    )
}
