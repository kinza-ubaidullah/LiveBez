import prisma from "@/lib/db";
import Link from "next/link";

export default async function AdminLeaguesPage() {
    const leagues = await prisma.league.findMany({
        include: {
            translations: { where: { languageCode: 'en' } }
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 dark:border-slate-800 pb-12">
                <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Competition Management</div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">Football Leagues</h1>
                    <p className="text-slate-500 text-sm mt-4 max-w-2xl">Manage global competitions, their localized names, and SEO parameters. Content here drives the main navigation and league-specific landing pages.</p>
                </div>

                <Link href="/admin/leagues/new" className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] text-center hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                    + Register New League
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                        <tr>
                            <th className="px-8 py-6">Competition Name</th>
                            <th className="px-8 py-6">Country</th>
                            <th className="px-8 py-6">Slug Hierarchy</th>
                            <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {leagues.map((league) => (
                            <tr key={league.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/50 transition-all group">
                                <td className="px-8 py-6">
                                    <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter italic group-hover:text-blue-600 transition-colors">
                                        {league.translations[0]?.name || 'Unnamed League'}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">{league.country}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-slate-400 dark:text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-mono border border-slate-200 dark:border-slate-700">/{league.translations[0]?.slug || 'not-set'}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Link href={`/admin/leagues/${league.id}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-all bg-blue-50 dark:bg-blue-900/10 px-4 py-2 rounded-xl group-hover:scale-105">
                                        Manage Suite
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
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
