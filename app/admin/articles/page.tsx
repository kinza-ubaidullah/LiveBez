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
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Content Archive</div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Articles</h1>
                </div>
                <button className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 active:scale-95">
                    + Create Article
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-black text-slate-400 text-[10px] uppercase tracking-[0.15em]">
                        <tr>
                            <th className="px-8 py-5">Article Metadata</th>
                            <th className="px-8 py-5">Category</th>
                            <th className="px-8 py-5">Visibility</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {articles.map((article) => (
                            <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                        {article.translations[0]?.title || 'Untitled'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(article.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                        {(article as any).category?.translations[0]?.name || (article as any).category?.key || 'Uncategorized'}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${article.published ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-orange-500 shadow-lg shadow-orange-500/50'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${article.published ? 'text-green-600' : 'text-orange-600'}`}>
                                            {article.published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Link
                                        href={`/admin/articles/${article.id}`}
                                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
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
