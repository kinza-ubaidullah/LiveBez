import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import LeagueForm from "@/components/admin/LeagueForm";
import Link from "next/link";

export default async function EditLeaguePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [league, languages] = await Promise.all([
        prisma.league.findUnique({
            where: { id },
            include: {
                translations: {
                    include: { seo: true }
                }
            }
        }),
        prisma.language.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    if (!league) notFound();

    // Find the English translation for the header title
    const enTranslation = league.translations.find(t => t.languageCode === 'en');

    return (
        <div className="max-w-6xl pb-24">
            <div className="flex items-center space-x-4 mb-8">
                <Link href="/admin/leagues" className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </Link>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">League Management</div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Edit <span className="text-blue-600">{enTranslation?.name || 'League'}</span>
                    </h1>
                </div>
            </div>

            <LeagueForm league={league} languages={languages} />
        </div>
    );
}
