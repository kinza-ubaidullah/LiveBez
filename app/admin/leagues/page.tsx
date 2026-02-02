import prisma from "@/lib/db";
import Link from "next/link";

export default async function AdminLeaguesPage() {
    const leagues = await prisma.league.findMany({
        include: {
            translations: { where: { languageCode: 'en' } }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Leagues</h1>
                <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                    + Add New League
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Name (EN)</th>
                            <th className="px-6 py-4">Country</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {leagues.map((league) => (
                            <tr key={league.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-bold text-slate-900">{league.translations[0]?.name || 'N/A'}</td>
                                <td className="px-6 py-4 text-slate-500">{league.country}</td>
                                <td className="px-6 py-4 text-slate-500">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">{league.translations[0]?.slug || 'N/A'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <Link href={`/admin/leagues/${league.id}`} className="text-primary font-bold hover:underline">Edit</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
