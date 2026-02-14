"use client";
import { useState } from "react";
import { generateMissingAnalysisAction } from "@/lib/actions/sync-actions";
import { Sparkles, Loader2 } from "lucide-react";

export default function BulkAIButton() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleBulkAI = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await generateMissingAnalysisAction();
            if (res.success) {
                setMessage(`Generated analysis for ${res.count} matches!`);
            }
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                onClick={handleBulkAI}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-300" />}
                {loading ? "Processing AI Lab..." : "Auto-Generate Missing Analysis"}
            </button>
            {message && (
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{message}</div>
            )}
        </div>
    );
}
