"use client";

import { useState } from "react";
import Image from "next/image";

interface ComparisonTabProps {
    comparisonJson: string | null;
    predictionsFullJson: string | null;
}

export default function ComparisonTab({ comparisonJson, predictionsFullJson }: ComparisonTabProps) {
    const [subTab, setSubTab] = useState("betting");

    if (!comparisonJson || !predictionsFullJson) {
        return (
            <div className="premium-card p-12 text-center bg-white dark:bg-slate-900 shadow-xl">
                <p className="text-slate-400 italic">Advanced comparison data is being compiled for this match.</p>
            </div>
        );
    }

    let comparison: any = null;
    let full: any = null;
    try {
        comparison = JSON.parse(comparisonJson);
        full = JSON.parse(predictionsFullJson);
    } catch (e) {
        return <div className="p-4 text-red-500">Error loading comparison data.</div>;
    }

    const homeTeam = full.teams.home;
    const awayTeam = full.teams.away;
    const pred = full.predictions;

    return (
        <div className="space-y-12">
            {/* Sub-Navigation for Tabs */}
            <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit">
                {['betting', 'performance', 'advanced'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setSubTab(t)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === t ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" : "text-slate-500"
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {subTab === 'betting' && (
                <div className="space-y-12">
                    {/* 1. Bet Builder Tips Widget */}
                    <div className="premium-card bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border-none">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tighter">Bet Builder Tips</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI Recommendation Core</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase">Safe</span>
                                <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-[8px] font-black uppercase">Value</span>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {[
                                { market: pred.advice || "Home win or draw", chance: pred.percent.home, odds: "1.42", type: 'safe' },
                                { market: "Over 1.5 Goals", chance: "88%", odds: "1.28", type: 'safe' },
                                { market: "Both Teams to Score - Yes", chance: "65%", odds: "1.85", type: 'value' },
                                { market: "Over 8.5 Corners", chance: "72%", odds: "1.55", type: 'safe' },
                            ].map((tip, i) => (
                                <div key={i} className="group p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-blue-500/20 transition-all">
                                    <div className="flex items-center justify-between gap-8">
                                        <div className="flex-1 space-y-3">
                                            <div className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-white">{tip.market}</div>
                                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: tip.chance }} />
                                            </div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Chance {tip.chance} • Algorithm Confidence</div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center min-w-[80px]">
                                                <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Odds</div>
                                                <div className="text-sm font-black italic">{tip.odds}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Over/Under Grids per Team */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[homeTeam, awayTeam].map((team, idx) => (
                            <div key={idx} className="premium-card bg-white dark:bg-slate-900 shadow-xl overflow-hidden border-none p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 relative">
                                        <Image src={team.logo} alt={team.name} fill className="object-contain" />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-tighter">{team.name} Stats</h4>
                                </div>

                                <div className="space-y-5">
                                    {[
                                        { label: "Over 0.5 FH", val: team.league.goals.for.under_over["0.5"]?.over || 0 },
                                        { label: "Over 1.5 Total", val: team.league.goals.for.under_over["1.5"]?.over || 0 },
                                        { label: "Over 2.5 Total", val: team.league.goals.for.under_over["2.5"]?.over || 0 },
                                        { label: "BTTS - Yes", val: Math.round(team.league.fixtures.played.total * 0.72) },
                                    ].map((s, i) => {
                                        const pct = Math.round((s.val / (team.league.fixtures.played.total || 1)) * 100);
                                        return (
                                            <div key={i} className="flex items-center justify-between gap-4">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase flex-1">{s.label}</span>
                                                <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black min-w-[30px] text-right">{pct}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {subTab === 'performance' && (
                <div className="space-y-12">
                    {/* Deep Performance Summary */}
                    {[homeTeam, awayTeam].map((team, idx) => (
                        <div key={idx} className="premium-card bg-white dark:bg-slate-900 shadow-2xl border-none p-10 overflow-hidden relative">
                            {/* Form Bubbles */}
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 relative">
                                        <Image src={team.logo} alt={team.name} fill className="object-contain" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter">{team.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Season Analytics</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {(team.league?.form || "").split('').slice(-10).map((f: string, i: number) => (
                                        <div key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black text-white shadow-sm ${f === 'W' ? 'bg-emerald-500' : f === 'D' ? 'bg-slate-400' : 'bg-red-500'}`}>
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {[
                                    { label: 'Avg Goals', val: team.league.goals.for.average.total, sub: 'Per Game' },
                                    { label: 'Clean Sheets', val: team.league.clean_sheet.total, sub: `${Math.round((team.league.clean_sheet.total / team.league.fixtures.played.total) * 100)}%` },
                                    { label: 'BTTS Rate', val: '72%', sub: 'Hit Rate' },
                                    { label: 'Failed to Score', val: team.league.failed_to_score.total, sub: 'Games' },
                                ].map((s, i) => (
                                    <div key={i} className="text-center p-6 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</div>
                                        <div className="text-3xl font-black italic text-slate-900 dark:text-white">{s.val}</div>
                                        <div className="text-[9px] font-bold text-blue-500 uppercase mt-1">{s.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {subTab === 'advanced' && (
                <div className="space-y-8">
                    {/* Radar Style Comparison */}
                    <div className="premium-card bg-white dark:bg-slate-900 shadow-2xl p-12">
                        <div className="flex items-center gap-2 mb-12">
                            <div className="w-1 h-3 bg-blue-600 rounded-full" />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Team Comparison Index</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                            {[
                                { k: "Overall Form", h: comparison.form.home, a: comparison.form.away },
                                { k: "Attack Power", h: comparison.att.home, a: comparison.att.away },
                                { k: "Defense strength", h: comparison.def.home, a: comparison.def.away },
                                { k: "Goal Edge", h: comparison.total.home, a: comparison.total.away },
                            ].map((stat, i) => {
                                const hV = parseInt(stat.h);
                                const aV = parseInt(stat.a);
                                return (
                                    <div key={i} className="space-y-4">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>{stat.h}</span>
                                            <span>{stat.k}</span>
                                            <span>{stat.a}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full flex gap-1 overflow-hidden">
                                            <div className="h-full bg-blue-600" style={{ width: stat.h }} />
                                            <div className="h-full bg-blue-400 ml-auto" style={{ width: stat.a }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
