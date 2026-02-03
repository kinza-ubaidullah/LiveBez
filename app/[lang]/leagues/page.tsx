import prisma from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n";
import { ArrowRight, Trophy } from "lucide-react";

export default async function LeaguesPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const t = getDictionary(lang);

    let leagues: any[] = [];
    try {
        leagues = await prisma.league.findMany({
            include: {
                translations: {
                    where: { languageCode: lang }
                }
            }
        });
    } catch (error) {
        console.error("Database Connection Failed (Leagues Page):", error);
        // Fallback: Return empty array to render "No Leagues" state instead of 500 Error
        leagues = [];
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="mb-12">
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase italic">
                    {t.leagues?.title || "All Leagues"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
                    Explore predictions and stats for the world's top football competitions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {leagues.map((league) => {
                    const trans = league.translations[0];
                    if (!trans) return null;

                    return (
                        <Link
                            key={league.id}
                            href={`/${lang}/league/${trans.slug}`}
                            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-600/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Trophy className="w-24 h-24 -rotate-12" />
                            </div>

                            <div className="relative z-10 flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl relative overflow-hidden shadow-inner">
                                    {league.logoUrl ? (
                                        <Image
                                            src={league.logoUrl}
                                            alt={trans.name}
                                            fill
                                            sizes="64px"
                                            className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <span className="font-black text-slate-300 dark:text-slate-600 select-none">
                                            {trans.name.substring(0, 1)}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                                        {trans.name}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {league.country}
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-600 transition-colors">
                                    View Analysis
                                </span>
                                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
