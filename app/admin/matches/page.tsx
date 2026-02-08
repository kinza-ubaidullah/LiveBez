import prisma from "@/lib/db";
import Link from "next/link";

export default async function AdminMatchesPage() {
    const matches = await prisma.match.findMany({
        include: {
            translations: { where: { languageCode: 'en' } },
            league: {
                include: { translations: true }
            }
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Match Center</div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Upcoming Fixtures</h1>
                </div>
                <Link href="/admin/matches/new" className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 active:scale-95 text-center">
                    + Register Match
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-black text-slate-400 text-[10px] uppercase tracking-[0.15em]">
                        <tr>
                            <th className="px-8 py-5">Teams & Scheduling</th>
                            <th className="px-8 py-5">Competition</th>
                            <th className="px-8 py-5">Match Date</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {matches.map((match) => (
                            <tr key={match.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        {match.homeTeam} <span className="text-slate-400 font-bold not-italic px-2">VS</span> {match.awayTeam}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                        {match.league.translations.find(t => t.languageCode === 'en')?.name || match.league.translations[0]?.name || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(match.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                    <div className="text-[10px] font-bold text-slate-300 uppercase mt-0.5">{new Date(match.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Link
                                        href={`/admin/matches/${match.id}`}
                                        className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    >
                                        Edit Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
