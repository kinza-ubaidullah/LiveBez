"use client";

import { generateAIAnalysisAction } from "@/lib/actions/match-actions";
import { useState } from "react";

export default function GenerateAnalysisButton({ matchId, lang }: { matchId: string, lang: string }) {
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!confirm("Generate AI analysis for this match? It will be saved as a Draft.")) return;

        setLoading(true);
        try {
            const res = await generateAIAnalysisAction(matchId, lang);
            if (res.success) {
                alert("Analysis generated successfully and saved as Draft.");
            } else {
                alert("Error: " + res.error);
            }
        } catch (error) {
            alert("Unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleGenerate}
            disabled={loading}
            className={`inline-flex items-center justify-center h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${loading
                    ? "bg-slate-200 text-slate-400 cursor-wait"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                }`}
        >
            {loading ? "Generating..." : "Generate AI Analysis"}
        </button>
    );
}
