"use client";

import Image from "next/image";
import { format } from "date-fns";

interface H2HTabProps {
    h2hJson: string | null;
}

export default function H2HTab({ h2hJson }: H2HTabProps) {
    if (!h2hJson) {
        return (
            <div className="premium-card p-12 text-center bg-white dark:bg-slate-900 shadow-xl">
                <p className="text-slate-400 italic">Head-to-head records are not yet compiled for this matchup.</p>
            </div>
        );
    }

    let results: any[] = [];
    try {
        results = JSON.parse(h2hJson);
    } catch (e) {
        return <div className="p-4 text-red-500">Error loading H2H history.</div>;
    }

    if (!results || results.length === 0) {
        return (
            <div className="premium-card p-12 text-center bg-white dark:bg-slate-900 shadow-xl">
                <p className="text-slate-400 italic">No historical meetings found for these teams.</p>
            </div>
        );
    }

    // --- Stats Calculations ---
    const total = results.length;
    const homeTeam = results[0].teams.home;
    const awayTeam = results[0].teams.away;

    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    let over15 = 0;
    let over25 = 0;
    let over35 = 0;
    let btts = 0;
    let cleanSheetHome = 0;
    let cleanSheetAway = 0;

    results.forEach(res => {
        const hG = res.goals.home || 0;
        const aG = res.goals.away || 0;
        const totalGoals = hG + aG;

        if (hG > aG) homeWins++;
        else if (aG > hG) awayWins++;
        else draws++;

        if (totalGoals > 1.5) over15++;
        if (totalGoals > 2.5) over25++;
        if (totalGoals > 3.5) over35++;
        if (hG > 0 && aG > 0) btts++;
        if (aG === 0) cleanSheetHome++;
        if (hG === 0) cleanSheetAway++;
    });

    const getPct = (val: number) => Math.round((val / total) * 100);

    return (
        <div className="space-y-8">
            {/* High-Fidelity H2H Summary Widget */}
            <div className="premium-card bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border-none">
                <div className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-3 bg-blue-600 rounded-full" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white">Head to Head History</h3>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Meetings - {total}</p>
                </div>

                <div className="p-8 md:p-12 space-y-12">
                    {/* Win Comparison Bar */}
                    <div className="flex items-center justify-between gap-4 md:gap-12">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 relative">
                                <Image src={homeTeam.logo} alt={homeTeam.name} fill className="object-contain" />
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">{homeTeam.name}</span>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                <div className="text-center">
                                    <div className="text-lg italic text-slate-900 dark:text-white">{homeWins}</div>
                                    <div className="text-slate-400">Wins</div>
                                    <div className="mt-1 px-2 py-0.5 bg-yellow-400 text-black rounded text-[8px]">{getPct(homeWins)}%</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg italic text-slate-900 dark:text-white">{draws}</div>
                                    <div className="text-slate-400">Draws</div>
                                    <div className="mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[8px]">{getPct(draws)}%</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg italic text-slate-900 dark:text-white">{awayWins}</div>
                                    <div className="text-slate-400">Wins</div>
                                    <div className="mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[8px]">{getPct(awayWins)}%</div>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden">
                                <div className="h-full bg-blue-600" style={{ width: `${getPct(homeWins)}%` }} />
                                <div className="h-full bg-slate-300 dark:bg-slate-600" style={{ width: `${getPct(draws)}%` }} />
                                <div className="h-full bg-blue-400" style={{ width: `${getPct(awayWins)}%` }} />
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 relative">
                                <Image src={awayTeam.logo} alt={awayTeam.name} fill className="object-contain" />
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">{awayTeam.name}</span>
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium text-center italic">
                        In the last {total} encounter(s), {homeTeam.name} won {homeWins} time(s), {awayTeam.name} have {awayWins} win(s), and {draws} ended in a draw.
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Over 1.5', val: getPct(over15), count: `${over15}/${total}` },
                            { label: 'Over 2.5', val: getPct(over25), count: `${over25}/${total}` },
                            { label: 'Over 3.5', val: getPct(over35), count: `${over35}/${total}` },
                            { label: 'BTTS', val: getPct(btts), count: `${btts}/${total}` },
                            { label: `Clean Sheets (${homeTeam.name})`, val: getPct(cleanSheetHome), count: `${cleanSheetHome}/${total}` },
                            { label: `Clean Sheets (${awayTeam.name})`, val: getPct(cleanSheetAway), count: `${cleanSheetAway}/${total}` },
                        ].map((s, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-700/50">
                                <div className="flex justify-between items-end">
                                    <div className="text-[9px] font-black uppercase tracking-tight text-slate-500">{s.label}</div>
                                    <div className="text-[8px] font-bold text-slate-400">{s.count}</div>
                                </div>
                                <div className="text-xl font-black italic text-slate-900 dark:text-white">{s.val}%</div>
                                <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600" style={{ width: `${s.val}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* List of Meetings */}
            <div className="premium-card bg-white dark:bg-slate-900 shadow-xl overflow-hidden border-none text-slate-900 dark:text-white">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-black italic tracking-tighter">Detailed History</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Match by match results</p>
                </div>

                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {results.map((res: any, idx) => (
                        <div key={res.fixture.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[120px]">
                                    {format(new Date(res.fixture.date), "dd MMM yyyy")}
                                </div>

                                <div className="flex-1 flex items-center justify-center gap-4 md:gap-8">
                                    <div className="flex-1 flex items-center justify-end gap-3 text-right">
                                        <span className={`text-[10px] md:text-xs font-black uppercase tracking-tight ${res.teams.home.winner ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {res.teams.home.name}
                                        </span>
                                        <div className="w-8 h-8 relative shrink-0">
                                            <Image src={res.teams.home.logo} alt={res.teams.home.name} fill className="object-contain" />
                                        </div>
                                    </div>

                                    <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl min-w-[80px] text-center font-black text-lg tabular-nums tracking-tighter shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {res.goals.home} - {res.goals.away}
                                    </div>

                                    <div className="flex-1 flex items-center justify-start gap-3">
                                        <div className="w-8 h-8 relative shrink-0">
                                            <Image src={res.teams.away.logo} alt={res.teams.away.name} fill className="object-contain" />
                                        </div>
                                        <span className={`text-[10px] md:text-xs font-black uppercase tracking-tight ${res.teams.away.winner ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {res.teams.away.name}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-right min-w-[100px]">
                                    {res.league.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

