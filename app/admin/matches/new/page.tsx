import prisma from "@/lib/db";
import MatchForm from "@/components/admin/MatchForm";
import Link from "next/link";

export default async function NewMatchPage() {
    const [languages, leagues] = await Promise.all([
        prisma.language.findMany({ orderBy: { name: 'asc' } }),
        prisma.league.findMany({
            include: { translations: { where: { languageCode: 'en' } } }
        })
    ]);

    return (
        <div className="max-w-7xl pb-24">
            <div className="flex items-center space-x-4 mb-10">
                <Link href="/admin/matches" className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </Link>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Match Center</div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Register <span className="text-blue-600">New Match</span>
                    </h1>
                </div>
            </div>

            <MatchForm
                match={{ translations: [], status: 'SCHEDULED', prediction: {} }}
                languages={languages}
                leagues={leagues}
                isNew={true}
            />
        </div>
    );
}
