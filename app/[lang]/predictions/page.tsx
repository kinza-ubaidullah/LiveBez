import { getDictionary } from "@/lib/i18n";
import prisma from "@/lib/db";
import PredictionCard from "@/components/PredictionCard";

export default async function PredictionsPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>,
    searchParams: Promise<{ sport?: string, type?: string }>
}) {
    const { lang } = await params;
    const { sport, type } = await searchParams;
    const t = getDictionary(lang);

    // Build the query
    const where: any = {
        translations: { some: { languageCode: lang } }
    };

    if (sport === 'football') {
        // All our current leagues are football
    } else if (sport === 'basketball') {
        // We don't have basketball yet, but we'll show empty or handle it
        where.league = { country: 'USA' }; // Placeholder
    }

    if (type) {
        if (type === '1x2') {
            where.mainTip = { contains: 'Win' }; // Most our 1x2 are "Home Win" etc
        } else if (type === 'over-under') {
            where.mainTip = { contains: 'Over' };
        } else if (type === 'btts') {
            where.OR = [
                { mainTip: { contains: 'BTTS' } },
                { mainTip: 'Analysis Pending' }
            ];
        } else if (type === 'top') {
            where.confidence = { gte: 85 };
        } else if (type === 'banker') {
            where.confidence = { gte: 90 };
        } else if (type === 'results') {
            where.OR = [
                { status: 'FINISHED' },
                { date: { lt: new Date() } }
            ];
        }
    }

    // Default to future matches if not results
    if (type !== 'results' && !where.OR) {
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
            <div className="mb-12 text-center">
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">
                    {t.ui.allPredictions}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    {t.ui.browseUpcoming}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.length > 0 ? (
                    matches.map((match) => (
                        <PredictionCard key={match.id} lang={lang} match={match} />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">{t.ui.noPredictions}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
