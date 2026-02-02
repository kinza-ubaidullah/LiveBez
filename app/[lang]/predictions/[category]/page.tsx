import { getDictionary } from "@/lib/i18n";
import prisma from "@/lib/db";
import PredictionCard from "@/components/PredictionCard";
import { notFound } from "next/navigation";
import { Activity, Target, Trophy } from "lucide-react";

export default async function PredictionCategoryPage({
    params
}: {
    params: Promise<{ lang: string, category: string }>
}) {
    const { lang, category } = await params;
    const t = getDictionary(lang);

    // Filter Logic
    const where: any = {
        translations: { some: { languageCode: lang } }
    };

    let title = "Predictions";
    let IconComponent = Target;

    if (category === '1x2') {
        where.mainTip = { contains: 'Win' };
        title = "1X2 Predictions";
        IconComponent = Activity;
    } else if (category === 'btts') {
        where.mainTip = { contains: 'BTTS' };
        title = "BTTS (Both Teams To Score)";
        IconComponent = Target;
    } else if (category === 'over-under') {
        where.mainTip = { contains: 'Over' };
        title = "Over/Under Logic";
    } else {
        // Fallback or generic
        where.date = { gte: new Date() };
    }

    // Always filter for future if not specifically looking for results
    if (category !== 'results') {
        where.date = { gte: new Date() };
    }

    const matches = await prisma.match.findMany({
        where,
        include: {
            translations: { where: { languageCode: lang } },
            league: {
                include: {
                    translations: { where: { languageCode: lang } }
                }
            },
            prediction: true
        },
        orderBy: { date: 'asc' }
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
                    <IconComponent className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tighter uppercase italic">
                        {title}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                        Expert analysis and AI-driven picks.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.length > 0 ? (
                    matches.map((match) => (
                        <PredictionCard key={match.id} lang={lang} match={match} />
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600">
                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <span className="font-bold uppercase tracking-widest">{t.ui.noPredictions}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
