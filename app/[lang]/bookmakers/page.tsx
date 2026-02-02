import prisma from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { Star, Shield, ExternalLink, CheckCircle } from "lucide-react";

export default async function BookmakersPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const t = getDictionary(lang);

    const bookmakers = await prisma.bookmaker.findMany({
        include: {
            translations: {
                where: { languageCode: lang }
            }
        },
        orderBy: { rating: 'desc' }
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase italic">
                    {t.bookmakers?.title || "Top Bookmakers"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium">
                    Trusted, reviewed, and rated platforms with the best odds and bonuses for {new Date().getFullYear()}.
                </p>
            </div>

            <div className="space-y-6">
                {bookmakers.map((bm, index) => {
                    const trans = bm.translations[0];
                    if (!trans) return null;

                    return (
                        <div
                            key={bm.id}
                            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-2 h-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 transition-colors" />

                            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
                                {/* Rank & Logo */}
                                <div className="flex items-center gap-6 w-full lg:w-auto">
                                    <div className="w-8 text-center font-black text-slate-300 dark:text-slate-700 text-2xl italic">
                                        #{index + 1}
                                    </div>
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner flex-shrink-0">
                                        {bm.logoUrl ? (
                                            <Image
                                                src={bm.logoUrl}
                                                alt={trans.name}
                                                fill
                                                className="object-contain p-3"
                                            />
                                        ) : (
                                            <span className="text-2xl font-black text-slate-300 dark:text-slate-600">
                                                {trans.name.substring(0, 1)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center lg:text-left space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        {trans.name}
                                    </h3>
                                    <div className="flex items-center justify-center lg:justify-start gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.floor(bm.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-700'}`}
                                            />
                                        ))}
                                        <span className="ml-2 text-sm font-bold text-slate-500">{bm.rating}/5</span>
                                    </div>
                                </div>

                                {/* Bonus */}
                                <div className="bg-blue-50 dark:bg-blue-900/10 px-6 py-3 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center w-full lg:w-auto">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Welcome Bonus</div>
                                    <div className="font-bold text-blue-700 dark:text-blue-400 text-lg whitespace-nowrap">
                                        {trans.bonusText}
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="w-full lg:w-auto">
                                    <Link
                                        href={trans.affiliateUrl || "#"}
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 w-full lg:w-48 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                                    >
                                        Claim Bonus
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                    <p className="mt-2 text-[10px] text-center text-slate-400 font-medium">
                                        T&Cs Apply. 18+
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {bookmakers.length === 0 && (
                    <div className="text-center py-24 text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
                        No bookmakers listed yet.
                    </div>
                )}
            </div>
        </div>
    );
}
