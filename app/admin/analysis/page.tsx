import prisma from "@/lib/db";
import Link from "next/link";
import BulkAIButton from "@/components/admin/BulkAIButton";

export const dynamic = 'force-dynamic';

export default async function AnalysisManagerPage() {
    const drafts = await (prisma.matchTranslation as any).findMany({
        where: {
            status: { in: ['DRAFT', 'REJECTED'] }
        },
        include: {
            match: true
        },
        orderBy: {
            match: { date: 'desc' }
        }
    }) as any[];

    return (
        <div className="max-w-7xl pb-24">
            <header className="mb-12 flex items-center justify-between gap-6">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Editorial Control</div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
                        Analysis <span className="text-blue-600 underline underline-offset-8 decoration-4">Drafts</span>
                    </h1>
                </div>
                <BulkAIButton />
            </header>

            <div className="grid grid-cols-1 gap-6">
                {drafts.length > 0 ? (
                    drafts.map((draft) => (
                        <div key={draft.id} className="premium-card p-6 bg-white border-slate-100 flex items-center justify-between group">
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <div className="text-[10px] font-black uppercase text-slate-400">Match Date</div>
                                    <div className="text-xs font-bold text-slate-900">{new Date(draft.match.date).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">
                                        {draft.match.homeTeam} vs {draft.match.awayTeam}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{draft.languageCode}</div>
                                        <div className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${draft.status === 'DRAFT' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                                            {draft.status}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/admin/matches/${draft.matchId}`}
                                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                            >
                                Review Analysis
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="py-24 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No pending drafts to review.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
