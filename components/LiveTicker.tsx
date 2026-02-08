"use client";

import { useEffect, useState } from "react";

interface LiveMatch {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    time: string;
    status: 'LIVE' | 'HALFTIME' | 'FINISHED' | 'SCHEDULED';
}

// Fallback mock data when API is unavailable
const mockLiveMatches: LiveMatch[] = [];

export default function LiveTicker({ lang, t }: { lang: string, t: any }) {
    const [matches, setMatches] = useState<LiveMatch[]>(mockLiveMatches);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        const fetchLiveScores = async () => {
            try {
                const res = await fetch('/api/live-scores', { next: { revalidate: 30 } });
                const data = await res.json();

                if (data.success && data.data?.length > 0) {
                    const liveMatches: LiveMatch[] = data.data.map((game: any) => ({
                        id: game.id,
                        homeTeam: game.homeTeam,
                        awayTeam: game.awayTeam,
                        homeScore: game.homeScore,
                        awayScore: game.awayScore,
                        time: game.time,
                        status: 'LIVE',
                    }));
                    setMatches(liveMatches);
                    setIsLive(true);
                } else {
                    setMatches([]);
                    setIsLive(false);
                }
            } catch (err) {
                console.warn('Failed to fetch live scores');
                setMatches([]);
                setIsLive(false);
            }
        };

        fetchLiveScores();
        const interval = setInterval(fetchLiveScores, 30000);
        return () => clearInterval(interval);
    }, [t.ui.finished, t.ui.live]);

    const translateTime = (match: LiveMatch) => {
        if (match.status === 'FINISHED') return t.ui.finished;
        if (match.status === 'HALFTIME') return t.ui.halftime;
        if (match.status === 'LIVE') {
            if (match.time.includes("'")) {
                const mins = match.time.replace("'", "");
                return `${mins}'`;
            }
            return t.ui.live;
        }
        return match.time;
    };

    if (matches.length === 0) return null;

    return (
        <div className="bg-slate-950 text-white w-full overflow-hidden border-b border-white/5 py-4 relative group">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10" />

            <div
                className="flex items-center gap-16 slow-ticker-animation whitespace-nowrap px-10 w-max"
                style={{ animationDuration: '600s' }}
            >
                {/* Double the list for seamless loop */}
                {[...matches, ...matches, ...matches].map((match, i) => (
                    <div key={i} className="flex items-center gap-6 group/item cursor-default transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${match.status === 'LIVE' ? 'bg-red-600/10 border-red-500/50 text-red-500 animate-pulse' :
                                match.status === 'HALFTIME' ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' :
                                    match.status === 'SCHEDULED' ? 'bg-blue-600/10 border-blue-500/50 text-blue-500' :
                                        'bg-slate-800 border-slate-700 text-slate-400'
                                }`}>
                                {match.status === 'SCHEDULED' ? 'Featured' : translateTime(match)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 font-black text-[13px] uppercase tracking-tight italic">
                            <span className="text-slate-100 group-hover/item:text-blue-400 transition-colors uppercase">{match.homeTeam}</span>
                            <div className="flex items-center bg-blue-600/20 px-3 py-1 rounded-xl border border-blue-500/30 text-blue-500 tabular-nums min-w-[3.5rem] justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                {match.homeScore} <span className="mx-1.5 opacity-40 text-[10px]">:</span> {match.awayScore}
                            </div>
                            <span className="text-slate-100 group-hover/item:text-blue-400 transition-colors uppercase">{match.awayTeam}</span>
                        </div>

                        {/* Separator Dot */}
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    </div>
                ))}
            </div>
        </div>
    );
}
