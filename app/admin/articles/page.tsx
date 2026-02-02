import prisma from "@/lib/db";
import Link from "next/link";

export default async function AdminArticlesPage() {
    const articles = await prisma.article.findMany({
        include: {
            translations: { where: { languageCode: 'en' } },
            category: {
                include: {
                    translations: { where: { languageCode: 'en' } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Articles</h1>
                <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                    + Add New Article
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Title (EN)</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {articles.map((article) => (
                            <tr key={article.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-bold text-slate-900">
                                    {article.translations[0]?.title || 'Untitled'}
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {(article as any).category?.translations[0]?.name || (article as any).category?.key || 'Uncategorized'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${article.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {article.published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <Link href={`/admin/articles/${article.id}`} className="text-primary font-bold hover:underline">Edit</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
