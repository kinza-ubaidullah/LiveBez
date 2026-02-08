"use client";

import Image from "next/image";

interface LineupsTabProps {
    lineupsJson: string | null;
}

export default function LineupsTab({ lineupsJson }: LineupsTabProps) {
    if (!lineupsJson) {
        return (
            <div className="premium-card p-12 text-center bg-white dark:bg-slate-900 shadow-xl">
                <p className="text-slate-400 italic">Lineups are usually announced 60 minutes before kickoff.</p>
            </div>
        );
    }

    let lineups: any[] = [];
    try {
        lineups = JSON.parse(lineupsJson);
    } catch (e) {
        return <div className="p-4 text-red-500">Error loading lineups.</div>;
    }

    if (!lineups || lineups.length === 0) {
        return (
            <div className="premium-card p-12 text-center bg-white dark:bg-slate-900 shadow-xl">
                <p className="text-slate-400 italic">Starting elevens have not been confirmed yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {lineups.map((teamLineup, idx) => (
                <div key={teamLineup.team.id} className="premium-card bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 relative">
                                <Image src={teamLineup.team.logo} alt={teamLineup.team.name} fill className="object-contain" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic tracking-tighter uppercase">{teamLineup.team.name}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Formation: {teamLineup.formation}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Starting XI */}
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-b border-slate-50 dark:border-slate-800 pb-2">Starting Eleven</h4>
                            <div className="space-y-4">
                                {teamLineup.startXI.map((item: any) => (
                                    <div key={item.player.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                                                {item.player.number}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{item.player.name}</div>
                                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">{item.player.pos}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Substitutes */}
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-b border-slate-50 dark:border-slate-800 pb-2">Substitutes</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                {teamLineup.substitutes.map((item: any) => (
                                    <div key={item.player.id} className="flex items-center gap-3">
                                        <span className="text-[9px] font-black text-slate-400 w-4">{item.player.number}</span>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{item.player.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Coach */}
                        {teamLineup.coach && (
                            <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden relative">
                                        {teamLineup.coach.photo && <Image src={teamLineup.coach.photo} alt={teamLineup.coach.name} fill className="object-cover" />}
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Head Coach</div>
                                        <div className="text-xs font-black uppercase italic">{teamLineup.coach.name}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
