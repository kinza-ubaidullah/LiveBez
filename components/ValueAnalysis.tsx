
"use client";

import { CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

interface ValueAnalysisProps {
    modelPredictions: any; // API-Sports JSON
    marketPredictions: any; // Database Prediction Model (Odds API derived)
}

export default function ValueAnalysis({ modelPredictions, marketPredictions }: ValueAnalysisProps) {
    if (!modelPredictions || !marketPredictions) return null;

    // Parse API-Sports model data
    let model = { home: 0, draw: 0, away: 0 };
    try {
        const parsed = typeof modelPredictions === 'string' ? JSON.parse(modelPredictions) : modelPredictions;
        // Handle array or object response structure
        const p = Array.isArray(parsed) ? parsed[0]?.predictions : parsed?.predictions;

        if (p && p.percent) {
            model = {
                home: parseInt(p.percent.home) || 0,
                draw: parseInt(p.percent.draw) || 0,
                away: parseInt(p.percent.away) || 0
            };
        }
    } catch (e) {
        return null;
    }

    // Market data (Odds API)
    const market = {
        home: marketPredictions.winProbHome || 0,
        draw: marketPredictions.winProbDraw || 0,
        away: marketPredictions.winProbAway || 0
    };

    if (model.home === 0 && market.home === 0) return null;

    // Calculate Value (Edge)
    // Edge = Model Probability - Market Probability
    const homeEdge = model.home - market.home;
    const drawEdge = model.draw - market.draw;
    const awayEdge = model.away - market.away;

    const getValueColor = (edge: number) => {
        if (edge >= 10) return "text-emerald-500";
        if (edge >= 5) return "text-green-500";
        if (edge <= -5) return "text-red-500";
        return "text-slate-500";
    };

    const getValueLabel = (edge: number) => {
        if (edge >= 10) return "MASSIVE VALUE";
        if (edge >= 5) return "GOOD VALUE";
        if (edge > 0) return "SLIGHT EDGE";
        return "NO VALUE";
    };

    return (
        <div className="premium-card p-8 bg-white dark:bg-slate-900 shadow-xl border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-base font-black uppercase tracking-widest text-slate-900 dark:text-white">Value Detector</h3>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Model vs Market Analysis</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Headers */}
                <div className="grid grid-cols-12 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="col-span-3 text-left">Outcome</div>
                    <div className="col-span-3">Model %</div>
                    <div className="col-span-3">Market %</div>
                    <div className="col-span-3">Edge</div>
                </div>

                {/* Rows */}
                {[
                    { label: "Home Win", model: model.home, market: market.home, edge: homeEdge },
                    { label: "Draw", model: model.draw, market: market.draw, edge: drawEdge },
                    { label: "Away Win", model: model.away, market: market.away, edge: awayEdge }
                ].map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 items-center text-center">
                        <div className="col-span-3 text-left font-bold text-xs text-slate-700 dark:text-slate-300">
                            {item.label}
                        </div>
                        <div className="col-span-3">
                            <span className="text-base font-black text-purple-600 dark:text-purple-400">{item.model}%</span>
                        </div>
                        <div className="col-span-3">
                            <span className="text-sm font-bold text-slate-500">{item.market}%</span>
                        </div>
                        <div className="col-span-3 flex flex-col items-center">
                            <span className={`text-sm font-black ${getValueColor(item.edge)}`}>
                                {item.edge > 0 ? '+' : ''}{item.edge}%
                            </span>
                            {item.edge >= 5 && (
                                <span className="text-[8px] font-black bg-emerald-100 text-emerald-600 px-1.5 rounded uppercase mt-1">
                                    {getValueLabel(item.edge)}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Interpretation Guide</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            Positive edge indicates our AI model sees a higher probability than the betting market.
                            <span className="text-emerald-500 font-bold ml-1">Green values</span> represent potential value bets where the odds may be overpriced.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
