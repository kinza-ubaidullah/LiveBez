"use client";

import Image from "next/image";

interface StatsTabProps {
    statsJson: string | null;
}

export default function StatsTab({ statsJson }: StatsTabProps) {
    if (!statsJson) {
        return (
            <div className="premium-card p-12 text-center bg-white dark:bg-slate-900 shadow-xl">
                <p className="text-slate-400 italic">Statistics are not yet available for this match.</p>
            </div>
        );
    }

    let stats: any[] = [];
    try {
        stats = JSON.parse(statsJson);
    } catch (e) {
        return <div className="p-4 text-red-500">Error loading statistics.</div>;
    }

    if (!stats || stats.length === 0) {
        return (
            <div className="premium-card p-12 text-center bg-white dark:bg-slate-900 shadow-xl">
                <p className="text-slate-400 italic">Statistics are not yet available for this match.</p>
            </div>
        );
    }

    const homeStats = stats[0]?.statistics || [];
    const awayStats = stats[1]?.statistics || [];

    const statsToDisplay = [
        "Expected Goals",
        "Ball Possession",
        "Total Shots",
        "Shots on Goal",
        "Corner Kicks",
        "Fouls",
        "Yellow Cards",
        "Red Cards",
        "Offsides",
        "Goalkeeper Saves",
        "Passes %",
        "Attacks",
        "Dangerous Attacks"
    ];

    const formatValue = (val: any) => {
        if (val === null || val === undefined) return "0";
        return val.toString();
    };

    const getStatValue = (statList: any[], type: string) => {
        return statList.find(s => s.type === type)?.value || 0;
    };

    return (
        <div className="premium-card p-8 md:p-12 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 relative bg-slate-50 rounded-xl p-2">
                        {stats[0]?.team?.logo && <Image src={stats[0].team.logo} alt={stats[0].team.name} fill className="object-contain p-2" />}
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest hidden md:block">{stats[0]?.team?.name}</span>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-black italic tracking-tighter">Live Metrics</h3>
                    <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Match Statistics</div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-black uppercase tracking-widest hidden md:block">{stats[1]?.team?.name}</span>
                    <div className="w-12 h-12 relative bg-slate-50 rounded-xl p-2">
                        {stats[1]?.team?.logo && <Image src={stats[1].team.logo} alt={stats[1].team.name} fill className="object-contain p-2" />}
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                {statsToDisplay.map((type) => {
                    const homeVal = getStatValue(homeStats, type);
                    const awayVal = getStatValue(awayStats, type);

                    // Parse values like "55%" to numbers
                    const parseVal = (v: any) => {
                        if (typeof v === 'string' && v.includes('%')) return parseInt(v);
                        return parseInt(v) || 0;
                    };

                    const hV = parseVal(homeVal);
                    const aV = parseVal(awayVal);
                    const total = hV + aV || 1;
                    const homePct = (hV / total) * 100;

                    return (
                        <div key={type} className="group">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{formatValue(homeVal)}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">{type}</span>
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{formatValue(awayVal)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-1000 ease-out border-r border-white/20"
                                    style={{ width: `${homePct}%` }}
                                />
                                <div
                                    className="h-full bg-slate-300 dark:bg-slate-600 transition-all duration-1000 ease-out"
                                    style={{ width: `${100 - homePct}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
