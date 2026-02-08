import prisma from "@/lib/db";
import ArticleForm from "@/components/admin/ArticleForm";
import Link from "next/link";

export default async function NewArticlePage() {
    const [languages, categories, leagues, matches] = await Promise.all([
        prisma.language.findMany({ orderBy: { name: 'asc' } }),
        prisma.articleCategory.findMany({
            include: { translations: { where: { languageCode: 'en' } } }
        }),
        prisma.league.findMany({
            include: { translations: { where: { languageCode: 'en' } } }
        }),
        prisma.match.findMany({
            where: { date: { gte: new Date() } },
            orderBy: { date: 'asc' },
            take: 20
        })
    ]);

    return (
        <div className="max-w-7xl pb-24">
            <div className="flex items-center space-x-4 mb-10">
                <Link href="/admin/articles" className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </Link>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Editorial</div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Create <span className="text-blue-600">New Article</span>
                    </h1>
                </div>
            </div>

            <ArticleForm
                article={{ translations: [], published: false }}
                languages={languages}
                categories={categories}
                leagues={leagues}
                matches={matches}
                isNew={true}
            />
        </div>
    );
}
