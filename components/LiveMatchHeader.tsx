"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";

interface LiveMatchHeaderProps {
    matchId: string;
    initialData: {
        status: string;
        homeScore: number | null;
        awayScore: number | null;
        minute: number | null;
        date: Date;
        homeTeam: string;
        awayTeam: string;
        homeTeamLogo: string | null;
        awayTeamLogo: string | null;
        prediction?: any;
    };
    lang: string;
    t: any;
}

export default function LiveMatchHeader({ matchId, initialData, lang, t }: LiveMatchHeaderProps) {
    const [match, setMatch] = useState(initialData);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        // Check if match is live or starting soon to enable polling
        const matchTime = new Date(match.date).getTime();
        const now = Date.now();
        const isLiveOrSoon = (now >= matchTime - 3600000) && (match.status !== 'FINISHED' && match.status !== 'FT'); // 1 hour before

        setIsLive(isLiveOrSoon);

        if (isLiveOrSoon) {
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/match/${matchId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setMatch(prev => ({ ...prev, ...data }));
                    }
                } catch (error) {
                    console.error("Polling error", error);
                }
            }, 30000); // Poll every 30 seconds

            return () => clearInterval(interval);
        }
    }, [matchId, match.date, match.status]);

    const isMatchLive = match.status === 'LIVE' || match.status === '1H' || match.status === '2H' || match.status === 'HT' || !!match.minute;

    const probHome = match.prediction?.winProbHome || 33;
    const probDraw = match.prediction?.winProbDraw || 34;
    const probAway = match.prediction?.winProbAway || 33;

    return (
        <div className="premium-card p-6 md:p-12 bg-white text-slate-900 overflow-hidden relative border-t-8 border-blue-600 shadow-2xl">
            <div className="absolute top-0 end-0 w-64 md:w-96 h-64 md:h-96 bg-blue-50 blur-[80px] md:blur-[120px] -me-32 md:-me-48 -mt-32 md:-mt-48 rounded-full" />

            {/* Live Indicator Pulse */}
            {isMatchLive && (
                <div className="absolute top-2 md:top-4 right-2 md:right-4 flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-0.5 md:py-1 bg-red-50 rounded-full border border-red-100 animate-pulse">
                    <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-red-500 rounded-full" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase text-red-500">Live Grid</span>
                </div>
            )}

            <div className="relative z-10 flex flex-col gap-8 md:gap-12">
                <div className="flex items-center justify-between gap-2 md:gap-8 text-center">
                    <div className="flex-1 space-y-2 md:space-y-4 min-w-0">
                        <div className="relative w-12 h-12 md:w-24 md:h-24 bg-slate-50 rounded-2xl md:rounded-3xl mx-auto flex items-center justify-center text-xl md:text-3xl font-black border border-slate-100 overflow-hidden group shadow-sm">
                            {match.homeTeamLogo ? (
                                <Image
                                    src={match.homeTeamLogo}
                                    alt={match.homeTeam}
                                    fill
                                    sizes="(max-width: 768px) 48px, 96px"
                                    className="object-contain p-2 md:p-4 transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <span className="text-blue-600">{match.homeTeam.substring(0, 1)}</span>
                            )}
                        </div>
                        <h2 className="text-xs md:text-2xl font-black tracking-tighter uppercase truncate text-slate-900">{match.homeTeam}</h2>
                    </div>

                    <div className="flex-[1.5] space-y-2 md:space-y-4">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-4">
                                {isMatchLive ? (
                                    <div className="px-2 py-0.5 md:px-4 md:py-1.5 bg-red-600 text-white rounded-lg text-[7px] md:text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-red-200">
                                        {t.ui?.live || "LIVE"}
                                    </div>
                                ) : (
                                    <div className="px-2 py-0.5 md:px-4 md:py-1.5 bg-slate-100 rounded-lg text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                                        {match.status}
                                    </div>
                                )}

                                {match.minute && (
                                    <div className="text-blue-600 text-[10px] md:text-sm font-black tabular-nums bg-blue-50 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-blue-100">
                                        {match.minute}&apos;
                                    </div>
                                )}
                            </div>
                            <div className="text-4xl md:text-8xl font-black tracking-tighter tabular-nums flex items-center justify-center gap-2 md:gap-8">
                                <span className="text-slate-900 drop-shadow-sm">{match.homeScore ?? '0'}</span>
                                <span className="text-xs md:text-3xl text-slate-200 font-light">—</span>
                                <span className="text-slate-900 drop-shadow-sm">{match.awayScore ?? '0'}</span>
                            </div>

                            {/* Predicted Score Badge */}
                            {!isMatchLive && match.prediction?.advice && (
                                <div className="mt-4 flex flex-col items-center gap-1">
                                    <div className="px-4 py-1.5 bg-slate-900 dark:bg-blue-600 rounded-full text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                        <span>Predicted: {match.prediction.advice}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="text-[7px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest md:tracking-[0.4em] whitespace-nowrap bg-slate-50 px-3 py-1 md:px-6 md:py-2 rounded-full inline-block">
                            {new Date(match.date).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })} • {new Date(match.date).toLocaleDateString(lang, { day: '2-digit', month: 'short' })}
                        </div>
                    </div>

                    <div className="flex-1 space-y-2 md:space-y-4 min-w-0">
                        <div className="relative w-12 h-12 md:w-24 md:h-24 bg-slate-50 rounded-2xl md:rounded-3xl mx-auto flex items-center justify-center text-xl md:text-3xl font-black border border-slate-100 overflow-hidden group shadow-sm">
                            {match.awayTeamLogo ? (
                                <Image
                                    src={match.awayTeamLogo}
                                    alt={match.awayTeam}
                                    fill
                                    sizes="(max-width: 768px) 48px, 96px"
                                    className="object-contain p-2 md:p-4 transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <span className="text-blue-600">{match.awayTeam.substring(0, 1)}</span>
                            )}
                        </div>
                        <h2 className="text-xs md:text-2xl font-black tracking-tighter uppercase truncate text-slate-900">{match.awayTeam}</h2>
                    </div>
                </div>

                {/* Win Probabilities Bar */}
                <div className="max-w-2xl mx-auto w-full pt-6 md:pt-0">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[8px] md:text-[10px] font-black uppercase text-blue-600 tracking-wider">Home {probHome}%</span>
                        <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-wider">Draw {probDraw}%</span>
                        <span className="text-[8px] md:text-[10px] font-black uppercase text-red-500 tracking-wider">Away {probAway}%</span>
                    </div>
                    <div className="h-2 md:h-2.5 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
                        <div className="h-full bg-blue-600 transition-all duration-1000 ease-out" style={{ width: `${probHome}%` }} />
                        <div className="h-full bg-slate-200 transition-all duration-1000 ease-out" style={{ width: `${probDraw}%` }} />
                        <div className="h-full bg-red-500 transition-all duration-1000 ease-out" style={{ width: `${probAway}%` }} />
                    </div>
                    <div className="mt-2 text-center">
                        <span className="text-[7px] md:text-[9px] font-black uppercase text-slate-300 tracking-[0.2em]">Win Probability Algorithm v2.4</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
