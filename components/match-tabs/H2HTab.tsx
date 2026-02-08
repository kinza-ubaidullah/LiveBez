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

    return (
        <div className="premium-card bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black italic tracking-tighter">Historical Clashes</h3>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Last {results.length} Meetings</p>
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
                                    <span className={`text-xs md:text-sm font-black uppercase tracking-tight ${res.teams.home.winner ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>
                                        {res.teams.home.name}
                                    </span>
                                    <div className="w-8 h-8 relative shrink-0">
                                        <Image src={res.teams.home.logo} alt={res.teams.home.name} fill className="object-contain" />
                                    </div>
                                </div>

                                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl min-w-[80px] text-center font-black text-lg tabular-nums tracking-tighter shadow-inner group-hover:bg-primary group-hover:text-white transition-colors">
                                    {res.goals.home} - {res.goals.away}
                                </div>

                                <div className="flex-1 flex items-center justify-start gap-3">
                                    <div className="w-8 h-8 relative shrink-0">
                                        <Image src={res.teams.away.logo} alt={res.teams.away.name} fill className="object-contain" />
                                    </div>
                                    <span className={`text-xs md:text-sm font-black uppercase tracking-tight ${res.teams.away.winner ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>
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
    );
}
