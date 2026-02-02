import prisma from "@/lib/db";
import Link from "next/link";

export default async function AdminMatchesPage() {
    const matches = await prisma.match.findMany({
        include: {
            translations: { where: { languageCode: 'en' } },
            league: {
                include: { translations: { where: { languageCode: 'en' } } }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Matches</h1>
                <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                    + Add New Match
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Teams</th>
                            <th className="px-6 py-4">League</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {matches.map((match) => (
                            <tr key={match.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-bold text-slate-900">
                                    {match.homeTeam} vs {match.awayTeam}
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {match.league.translations[0]?.name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(match.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <Link href={`/admin/matches/${match.id}`} className="text-primary font-bold hover:underline">Edit</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
