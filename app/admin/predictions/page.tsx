import prisma from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function AdminPredictionsPage() {
    const matches = await prisma.match.findMany({
        where: {
            date: { gte: new Date() }
        },
        include: {
            prediction: true,
            league: {
                include: { translations: { where: { languageCode: 'en' } } }
            }
        },
        orderBy: { date: 'asc' }
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Prediction Strategy</div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Predictions Dashboard</h1>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/admin/matches"
                        className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition shadow-sm"
                    >
                        View All Fixtures
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card p-6 bg-blue-600 text-white border-none shadow-xl shadow-blue-600/20">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Upcoming Probabilities</div>
                    <div className="text-4xl font-black">{matches.length}</div>
                    <div className="text-[10px] uppercase font-bold mt-2 opacity-80">Active Match Models</div>
                </div>
                <div className="premium-card p-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Featured Picks</div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white">{matches.filter(m => m.isFeatured).length}</div>
                    <div className="text-[10px] uppercase font-bold mt-2 text-primary tracking-widest">Main Predictions</div>
                </div>
                <div className="premium-card p-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">High Confidence</div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white">{matches.filter(m => (m.confidence || 0) > 80).length}</div>
                    <div className="text-[10px] uppercase font-bold mt-2 text-emerald-500 tracking-widest">Confidence &gt; 80%</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-black text-slate-400 text-[10px] uppercase tracking-[0.15em]">
                        <tr>
                            <th className="px-8 py-5">Matchup</th>
                            <th className="px-8 py-5">Algorithm (Win/Draw/Away)</th>
                            <th className="px-8 py-5">Main Tip</th>
                            <th className="px-8 py-5">Confidence</th>
                            <th className="px-8 py-5 text-right">Targeting</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {matches.map((match) => (
                            <tr key={match.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                                        {match.homeTeam} <span className="text-slate-400 not-italic px-1">v</span> {match.awayTeam}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
                                        {match.league.translations[0]?.name || match.league.country}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    {match.prediction ? (
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden min-w-[120px]">
                                                <div className="h-full bg-blue-600 border-r border-white/20" style={{ width: `${match.prediction.winProbHome}%` }} />
                                                <div className="h-full bg-slate-400 border-r border-white/20" style={{ width: `${match.prediction.winProbDraw}%` }} />
                                                <div className="h-full bg-red-500" style={{ width: `${match.prediction.winProbAway}%` }} />
                                            </div>
                                            <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 tracking-tighter">
                                                {match.prediction.winProbHome}% / {match.prediction.winProbDraw}% / {match.prediction.winProbAway}%
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-300 italic">No Algorithm Data</span>
                                    )}
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        {match.mainTip || 'Not Set'}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`text-sm font-black italic ${(match.confidence || 0) > 75 ? 'text-primary' : 'text-slate-400'}`}>
                                            {match.confidence || 0}%
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        {match.isFeatured && (
                                            <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50 animate-pulse" title="Featured" />
                                        )}
                                        <Link
                                            href={`/admin/matches/${match.id}`}
                                            className="px-6 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            Override
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
