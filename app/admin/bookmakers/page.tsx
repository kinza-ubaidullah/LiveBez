import prisma from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { deleteBookmaker } from "@/lib/actions/bookmaker-actions";

export default async function AdminBookmakersPage() {
    const bookmakers = await prisma.bookmaker.findMany({
        include: {
            translations: { where: { languageCode: 'en' } }
        },
        orderBy: { rating: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Bookmakers</h1>
                <Link
                    href="/admin/bookmakers/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                    + Add Bookmaker
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Logo</th>
                            <th className="px-6 py-4">Name (EN)</th>
                            <th className="px-6 py-4">Rating</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {bookmakers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                    No bookmakers yet. Add your first affiliate partner!
                                </td>
                            </tr>
                        )}
                        {bookmakers.map((bm) => (
                            <tr key={bm.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4">
                                    {bm.logoUrl ? (
                                        <Image
                                            src={bm.logoUrl}
                                            alt={bm.translations[0]?.name || 'Bookmaker'}
                                            width={40}
                                            height={40}
                                            className="rounded"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">N/A</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-900">{bm.translations[0]?.name || 'Unnamed'}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                                        ★ {bm.rating.toFixed(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex items-center gap-4">
                                    <Link href={`/admin/bookmakers/${bm.id}`} className="text-blue-600 font-bold hover:underline">Edit</Link>
                                    <form action={async () => {
                                        "use server";
                                        await deleteBookmaker(bm.id);
                                    }}>
                                        <button type="submit" className="text-red-500 font-bold hover:underline">Delete</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
