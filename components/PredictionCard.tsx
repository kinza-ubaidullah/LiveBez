"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Target, Info } from "lucide-react";

interface PredictionCardProps {
    lang: string;
    match: {
        id: string;
        homeTeam: string;
        awayTeam: string;
        homeTeamLogo?: string | null;
        awayTeamLogo?: string | null;
        date: Date | string;
        mainTip?: string | null;
        confidence?: number | null;
        league?: {
            translations: Array<{
                name: string;
                slug: string;
            }>;
        } | string | null;
        prediction?: {
            winProbHome: number;
            winProbDraw: number;
            winProbAway: number;
        } | null;
        translations: Array<{
            slug: string;
            name: string;
        }>;
    };
}

export default function PredictionCard({ lang, match }: PredictionCardProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const translation = match.translations[0];
    if (!translation) return null;

    const timeString = mounted
        ? new Date(match.date).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
        : "--:--";

    // Use the dynamic league slug from the match data
    const leagueSlug = (match as any).league?.translations[0]?.slug || "any";

    return (
        <div className="portal-card group relative">
            {/* Backdrop / Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 to-transparent pointer-events-none" />

            <div className="relative p-0 flex flex-col">
                {/* Top Section: Teamlogos Vs */}
                <div className="relative h-40 xl:h-40 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 overflow-hidden border-b border-slate-100 dark:border-slate-800">
                    {/* Abstract stadium background */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] grayscale shadow-inner" />

                    <div className="px-4 md:px-8 flex items-center justify-between gap-2 md:gap-4 relative z-10 w-full">
                        {/* Home Team */}
                        <div className="flex-1 flex flex-col items-center gap-2 md:gap-4 group/team min-w-0">
                            <div className="relative w-16 h-16 md:w-24 md:h-24 bg-white dark:bg-slate-950 rounded-2xl md:rounded-[2rem] shadow-xl md:shadow-2xl flex items-center justify-center p-2 md:p-4 border border-white/10 group-hover/team:scale-110 transition-transform duration-500">
                                {match.homeTeamLogo ? (
                                    <Image src={match.homeTeamLogo} alt={match.homeTeam} fill sizes="(max-width: 768px) 64px, 96px" className="object-contain p-2 md:p-4" unoptimized />
                                ) : <div className="text-2xl md:text-4xl font-black text-slate-200">?</div>}
                            </div>
                            <span className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center truncate w-full">{match.homeTeam}</span>
                        </div>

                        {/* VS Center */}
                        <div className="flex flex-col items-center gap-1 md:gap-2 px-2">
                            <div className="text-4xl md:text-7xl font-black italic tracking-tighter drop-shadow-sm text-transparent bg-clip-text bg-gradient-to-br from-slate-600 via-slate-800 to-black dark:from-slate-200 dark:via-slate-400 dark:to-slate-600" style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.15)' }}>VS</div>
                            <div className="px-2 md:px-3 py-0.5 md:py-1 bg-blue-600 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-600/20 whitespace-nowrap">
                                {timeString}
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex-1 flex flex-col items-center gap-2 md:gap-4 group/team min-w-0">
                            <div className="relative w-16 h-16 md:w-24 md:h-24 bg-white dark:bg-slate-950 rounded-2xl md:rounded-[2rem] shadow-xl md:shadow-2xl flex items-center justify-center p-2 md:p-4 border border-white/10 group-hover/team:scale-110 transition-transform duration-500">
                                {match.awayTeamLogo ? (
                                    <Image src={match.awayTeamLogo} alt={match.awayTeam} fill sizes="(max-width: 768px) 64px, 96px" className="object-contain p-2 md:p-4" unoptimized />
                                ) : <div className="text-2xl md:text-4xl font-black text-slate-200">?</div>}
                            </div>
                            <span className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center truncate w-full">{match.awayTeam}</span>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="p-6 md:p-8">
                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                        <span className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest">Football</span>
                        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-slate-300" />
                        <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                            {typeof match.league === 'object'
                                ? match.league?.translations[0]?.name
                                : match.league || "Premier League"}
                        </span>
                    </div>

                    <h3 className="text-base md:text-xl font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tighter mb-4 md:mb-6 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {match.homeTeam} vs {match.awayTeam} prediction: Match preview, betting odds and tips
                    </h3>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href={`/${lang}/league/${leagueSlug}/${translation.slug}`}
                            className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-6 md:px-8 py-3 md:py-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                        >
                            <Info className="w-4 h-4" />
                            Analysis
                        </Link>

                        {/* Odds / Probabilities Display */}
                        {match.prediction && (
                            <div className="flex items-center gap-2 md:gap-4 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col items-center px-2 md:px-3 border-r border-slate-200 dark:border-slate-800">
                                    <span className="text-[7px] font-black text-slate-400 uppercase">Home</span>
                                    <span className="text-[10px] md:text-xs font-black text-slate-900 dark:text-white">{Math.round(match.prediction.winProbHome)}%</span>
                                </div>
                                <div className="flex flex-col items-center px-2 md:px-3 border-r border-slate-200 dark:border-slate-800">
                                    <span className="text-[7px] font-black text-slate-400 uppercase">Draw</span>
                                    <span className="text-[10px] md:text-xs font-black text-slate-900 dark:text-white">{Math.round(match.prediction.winProbDraw)}%</span>
                                </div>
                                <div className="flex flex-col items-center px-2 md:px-3">
                                    <span className="text-[7px] font-black text-slate-400 uppercase">Away</span>
                                    <span className="text-[10px] md:text-xs font-black text-slate-900 dark:text-white">{Math.round(match.prediction.winProbAway)}%</span>
                                </div>
                            </div>
                        )}

                        <div className="ml-auto flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PICK</span>
                                <span className="text-xs md:text-sm font-black text-green-600 uppercase tracking-tighter">{match.mainTip || "Home Win"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
