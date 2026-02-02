"use client";

import { useState } from "react";
import { syncFixtures, syncLiveScores } from "@/lib/actions/sync-actions";
import { SOCCER_SPORTS } from "@/lib/odds-api";

export default function SyncDataButton() {
    const [loading, setLoading] = useState(false);
    const [liveLoading, setLiveLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [selectedSport, setSelectedSport] = useState(SOCCER_SPORTS.EPL);

    const handleSync = async () => {
        setLoading(true);
        setResult(null);

        try {
            const syncResult = await syncFixtures(selectedSport);
            setResult(syncResult);
        } catch (err: any) {
            setResult({ success: false, errors: [err.message] });
        } finally {
            setLoading(false);
        }
    };

    const handleLiveSync = async () => {
        setLiveLoading(true);
        setResult(null);

        try {
            const syncResult = await syncLiveScores();
            setResult(syncResult);
        } catch (err: any) {
            setResult({ success: false, errors: [err.message] });
        } finally {
            setLiveLoading(false);
        }
    };

    const sports = [
        { key: SOCCER_SPORTS.EPL, name: "Premier League" },
        { key: SOCCER_SPORTS.LA_LIGA, name: "La Liga" },
        { key: SOCCER_SPORTS.BUNDESLIGA, name: "Bundesliga" },
        { key: SOCCER_SPORTS.SERIE_A, name: "Serie A" },
        { key: SOCCER_SPORTS.LIGUE_1, name: "Ligue 1" },
        { key: SOCCER_SPORTS.CHAMPIONS_LEAGUE, name: "Champions League" },
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">🔄</span>
                Sync Live Data
            </h3>

            <div className="space-y-6">
                {/* Fixtures & Odds Sync */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500">Fixtures & Odds</h4>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">Select League</label>
                        <select
                            value={selectedSport}
                            onChange={(e) => setSelectedSport(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm bg-white"
                            disabled={loading || liveLoading}
                        >
                            {sports.map((sport) => (
                                <option key={sport.key} value={sport.key}>
                                    {sport.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={loading || liveLoading}
                        className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all text-sm ${loading
                            ? 'bg-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Syncing...
                            </span>
                        ) : (
                            '🚀 Fetch Fixtures & Odds'
                        )}
                    </button>
                    <p className="text-[10px] text-slate-400">Pulls data from The Odds API.</p>
                </div>

                {/* Live Scores Sync */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-100 space-y-4">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-green-700">Real-Time Scores</h4>
                    <button
                        onClick={handleLiveSync}
                        disabled={loading || liveLoading}
                        className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all text-sm ${liveLoading
                            ? 'bg-green-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        {liveLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Updating...
                            </span>
                        ) : (
                            '📡 Sync Live Scores (API-Sports)'
                        )}
                    </button>
                    <p className="text-[10px] text-green-600">Updates goal minutes & actual status from API-Sports.</p>
                </div>

                {result && (
                    <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-white border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        {result.success ? (
                            <div className="space-y-2">
                                <div className="text-green-700 font-bold flex items-center gap-2">
                                    <span>✅</span> Sync Complete!
                                </div>
                                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                                    <div>New Items: {result.created}</div>
                                    <div>Updated Items: {result.updated}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="text-red-700 font-bold">❌ Sync Failed</div>
                                {result.errors?.map((err: string, i: number) => (
                                    <div key={i} className="text-xs text-red-600">{err}</div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
