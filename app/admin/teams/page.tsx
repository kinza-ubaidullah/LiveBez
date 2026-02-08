import prisma from "@/lib/db";
import Link from "next/link";

export default async function AdminTeamsPage() {
    const teams = await prisma.team.findMany({
        include: {
            translations: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 100
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Club Management</div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Teams & Franchises</h1>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-black text-slate-400 text-[10px] uppercase tracking-[0.15em]">
                        <tr>
                            <th className="px-8 py-5">Identity & Logo</th>
                            <th className="px-8 py-5">Origin</th>
                            <th className="px-8 py-5">Last Updated</th>
                            <th className="px-8 py-5 text-right">Matrix Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {teams.map((team) => (
                            <tr key={team.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        {team.logoUrl ? (
                                            <img src={team.logoUrl} alt={team.translations.find(t => t.languageCode === 'en')?.name || team.translations[0]?.name} className="w-10 h-10 object-contain rounded-lg" />
                                        ) : (
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-black text-slate-400">?</div>
                                        )}
                                        <div className="font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                                            {team.translations.find(t => t.languageCode === 'en')?.name || team.translations[0]?.name || 'Unknown Team'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                        {team.country || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(team.updatedAt).toLocaleDateString()}</div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Link
                                        href={`/admin/teams/${team.id}`}
                                        className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    >
                                        Edit SEO
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
