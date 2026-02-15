"use client";

import { useEffect, useState } from "react";

interface OddsDisplayProps {
    fixtureId?: string; // API-Sports fixture ID
    homeTeam: string;
    awayTeam: string;
    sportKey?: string;
    t: any;
}

interface OddsData {
    h2h?: {
        [key: string]: { price: number; bookmaker: string };
    };
    totals?: {
        [key: string]: { price: number; bookmaker: string; point?: number };
    };
}

export default function OddsDisplay({ fixtureId, homeTeam, awayTeam, sportKey = 'soccer_epl', t }: OddsDisplayProps) {
    const [odds, setOdds] = useState<OddsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOdds = async () => {
            if (!fixtureId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch from our internal API which now proxies to API-Sports
                const res = await fetch(`/api/odds?fixtureId=${fixtureId}`);
                const data = await res.json();

                if (data.success && data.odds) {
                    setOdds(data.odds);
                } else {
                    setError('No odds found');
                }
            } catch (err) {
                setError('Failed to load odds');
            } finally {
                setLoading(false);
            }
        };

        fetchOdds();
    }, [fixtureId]);

    if (loading) {
        return (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (!odds?.h2h) {
        return (
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">📊</span> {t.ui.bestOdds}
                </h3>
                <p className="text-slate-500 text-sm">{t.ui.oddsNotAvailable}</p>
            </div>
        );
    }

    // Reliable mapping strategy
    const entries = Object.entries(odds.h2h);

    // API-Sports typically returns keys: "Home", "Away", "Draw"
    let homeEntry = entries.find(([k]) => k === 'Home');
    let drawEntry = entries.find(([k]) => k === 'Draw');
    let awayEntry = entries.find(([k]) => k === 'Away');

    // Fallback: If keys are team names (legacy or other providers), try fuzzy match
    if (!homeEntry || !awayEntry) {
        const otherEntries = entries.filter(([k]) => k !== 'Draw');
        if (otherEntries.length >= 2) {
            const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
            const h = normalize(homeTeam);
            const a = normalize(awayTeam);

            const homeMatch = otherEntries.find(([k]) => normalize(k).includes(h) || h.includes(normalize(k)));
            const awayMatch = otherEntries.find(([k]) => normalize(k).includes(a) || a.includes(normalize(k)));

            if (homeMatch) homeEntry = homeMatch;
            if (awayMatch) awayEntry = awayMatch;

            // If still not found, just take first and second? risky but better than nothing
            if (!homeEntry) homeEntry = otherEntries[0];
            if (!awayEntry) awayEntry = otherEntries[1];
        }
    }

    const homeOdds = homeEntry ? homeEntry[1] : null;
    const drawOdds = drawEntry ? drawEntry[1] : null;
    const awayOdds = awayEntry ? awayEntry[1] : null;

    return (
        <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span> {t.ui.bestOdds} ({t.ui.market1x2})
            </h3>

            <div className="grid grid-cols-3 gap-4">
                <OddsCard
                    label="1"
                    team={homeTeam}
                    odds={homeOdds?.price}
                    bookmaker={homeOdds?.bookmaker}
                    highlight={Boolean(homeOdds?.price && (!drawOdds?.price || homeOdds.price < drawOdds.price) && (!awayOdds?.price || homeOdds.price < awayOdds.price))}
                />
                <OddsCard
                    label="X"
                    team="Draw"
                    odds={drawOdds?.price}
                    bookmaker={drawOdds?.bookmaker}
                />
                <OddsCard
                    label="2"
                    team={awayTeam}
                    odds={awayOdds?.price}
                    bookmaker={awayOdds?.bookmaker}
                    highlight={Boolean(awayOdds?.price && (!drawOdds?.price || awayOdds.price < drawOdds.price) && (!homeOdds?.price || awayOdds.price < homeOdds.price))}
                />
            </div>

            {odds.totals && Object.keys(odds.totals).length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-slate-600 dark:text-slate-400 mb-3">{t.ui.overUnder}</h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(odds.totals).slice(0, 4).map(([key, val]) => (
                            <div key={key} className="bg-white dark:bg-slate-700 px-3 py-2 rounded-lg text-sm">
                                <span className="font-bold text-slate-900 dark:text-white">{key}</span>
                                <span className="text-blue-600 font-black ml-2">{val.price?.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest">
                {t.appName} Smart Odds Analytics
            </p>
        </div>
    );
}

function OddsCard({ label, team, odds, bookmaker, highlight }: {
    label: string;
    team: string;
    odds?: number;
    bookmaker?: string;
    highlight?: boolean;
}) {
    return (
        <div className={`text-center p-4 rounded-xl transition-all ${highlight
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
            : 'bg-white dark:bg-slate-700'
            }`}>
            <div className={`text-xs font-black uppercase tracking-widest mb-1 ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>
                {label}
            </div>
            <div className={`text-2xl font-black ${highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {odds ? odds.toFixed(2) : '-'}
            </div>
            {bookmaker && (
                <div className={`text-[10px] mt-1 truncate ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>
                    {bookmaker}
                </div>
            )}
        </div>
    );
}
