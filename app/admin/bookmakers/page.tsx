import prisma from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

export default async function AdminBookmakersPage() {
    const bookmakers = await prisma.bookmaker.findMany({
        include: {
            translations: { where: { languageCode: 'en' } }
        },
        orderBy: { rating: 'desc' }
    });

    return (
        <div className="max-w-6xl pb-24">
            <header className="flex items-center justify-between mb-12">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">Affiliate Distribution</div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
                        Bookmaker <span className="text-emerald-600 underline underline-offset-8 decoration-4">Partners</span>
                    </h1>
                </div>
                <Link
                    href="/admin/bookmakers/new"
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20"
                >
                    Add Global Partner
                </Link>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {bookmakers.map((bm) => {
                    const trans = bm.translations[0];
                    return (
                        <div key={bm.id} className="premium-card p-6 bg-white border-slate-100 flex items-center justify-between group hover:border-emerald-500 transition-all">
                            <div className="flex items-center gap-8">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center p-3 border border-slate-100 overflow-hidden">
                                    {bm.logoUrl ? (
                                        <Image src={bm.logoUrl} alt={trans?.name || 'BM'} width={60} height={60} className="object-contain" />
                                    ) : (
                                        <span className="text-slate-300 font-bold">NO LOGO</span>
                                    )}
                                </div>
                                <div>
                                    <div className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">
                                        {trans?.name || 'Unnamed Partner'}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="text-[10px] font-bold text-emerald-600 uppercase">★ {bm.rating.toFixed(1)}</div>
                                        <div className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${bm.isDoFollow ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {bm.isDoFollow ? 'DoFollow' : 'NoFollow'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/admin/bookmakers/${bm.id}`}
                                    className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                </Link>
                                <button className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
