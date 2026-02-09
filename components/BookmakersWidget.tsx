import prisma from "@/lib/db";
import SmartLogo from "./SmartLogo";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

interface BookmakersWidgetProps {
    lang: string;
}

export default async function BookmakersWidget({ lang }: BookmakersWidgetProps) {
    const t = getDictionary(lang);

    const bookmakers = await prisma.bookmaker.findMany({
        include: {
            translations: {
                where: { languageCode: lang }
            }
        },
        orderBy: { rating: 'desc' },
        take: 3
    });

    const getTranslation = (bm: any) => {
        return bm.translations[0] || bm.translations.find((t: any) => t.languageCode === 'en') || null;
    };

    if (bookmakers.length === 0) return null;

    return (
        <section className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[3rem] p-6 md:p-10 border-2 border-slate-50 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 dark:border-slate-800 pb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <span className="text-xl">⭐</span>
                </div>
                <h3 className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-[0.15em]">
                    {t.bookmakers?.title || "Top Bookmakers"}
                </h3>
            </div>

            <div className="space-y-6">
                {bookmakers.map((bm) => {
                    const trans = getTranslation(bm);
                    if (!trans) return null;

                    return (
                        <div key={bm.id} className="group relative">
                            <a
                                href={trans.affiliateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 border border-slate-50 dark:border-slate-800 rounded-3xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer"
                            >
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center p-3 flex-shrink-0 border border-slate-100 dark:border-slate-600 shadow-sm transition-transform group-hover:scale-105">
                                        <SmartLogo
                                            src={bm.logoUrl}
                                            alt={trans.name}
                                            width={60}
                                            height={60}
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-tight italic truncate">{trans.name}</div>
                                            <div className="flex items-center gap-1 text-blue-600 font-black text-[10px] italic">
                                                ★ {bm.rating.toFixed(1)}
                                            </div>
                                        </div>
                                        <div className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed line-clamp-2 italic opacity-60">
                                            {trans.bonusText}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full py-4 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl text-center shadow-lg shadow-blue-500/20 group-hover:bg-blue-700 transition-all duration-300">
                                    {t.bookmakers?.visit || "Visit Site"}
                                </div>
                            </a>
                        </div>
                    );
                })}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    Responsible gambling only. 18+ Terms apply.
                </p>
            </div>
        </section>
    );
}
