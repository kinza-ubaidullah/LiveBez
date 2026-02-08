"use client";

import { useState } from "react";
import StatsTab from "@/components/match-tabs/StatsTab";
import H2HTab from "@/components/match-tabs/H2HTab";
import LineupsTab from "@/components/match-tabs/LineupsTab";
import AnalysisTab from "@/components/match-tabs/AnalysisTab";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
    return twMerge(clsx(inputs));
}

interface MatchTabsProps {
    stats: string | null;
    lineups: string | null;
    h2h: string | null;
    analysis: string | null;
    lang: string;
    t: any;
}

export default function MatchTabs({ stats, lineups, h2h, analysis, lang, t }: MatchTabsProps) {
    const [activeTab, setActiveTab] = useState("analysis");

    const hasLineups = !!lineups && lineups !== "null" && lineups !== "[]";
    const hasStats = !!stats && stats !== "null" && stats !== "[]";
    const hasH2H = !!h2h && h2h !== "null" && h2h !== "[]";

    const allTabs = [
        { id: "analysis", label: t.match.expertAnalysis || "Analysis", show: !!analysis },
        { id: "stats", label: t.match.stats || "Stats", show: hasStats },
        { id: "h2h", label: "H2H", show: hasH2H },
        { id: "lineups", label: t.match.lineups || "Lineups", show: hasLineups },
    ];

    const activeTabs = allTabs.filter(t => t.show);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit overflow-x-auto max-w-full no-scrollbar">
                {activeTabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-white dark:bg-slate-800 text-primary shadow-lg shadow-primary/5"
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {/* 
                  SE0 REFACTOR: We render all tab contents in the DOM but control visibility via CSS.
                  This ensures search engines can index all the data while maintaining a clean UI.
                */}
                <div className={activeTab === "analysis" ? "block" : "hidden"}>
                    <AnalysisTab content={analysis} />
                </div>
                <div className={activeTab === "stats" ? "block" : "hidden"}>
                    <StatsTab statsJson={stats} />
                </div>
                <div className={activeTab === "h2h" ? "block" : "hidden"}>
                    <H2HTab h2hJson={h2h} />
                </div>
                <div className={activeTab === "lineups" ? "block" : "hidden"}>
                    <LineupsTab lineupsJson={lineups} />
                </div>
            </div>
        </div>
    );
}
