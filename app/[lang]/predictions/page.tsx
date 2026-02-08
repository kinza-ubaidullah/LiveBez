import prisma from "@/lib/db";
import PredictionCard from "@/components/PredictionCard";
import { getDictionary } from "@/lib/i18n";

export default async function PredictionsPage({ params, searchParams }: {
    params: Promise<{ lang: string }>,
    searchParams: Promise<{ cat?: string }>
}) {
    const { lang } = await params;
    const { cat = 'home' } = await searchParams;
    const t = getDictionary(lang);

    // Categories Logic
    // cat=home -> winProbHome > winProbAway AND winProbHome > 45%
    // cat=over -> overProb > 60%
    // cat=btts -> bttsProb > 60%

    let whereClause: any = {
        date: { gte: new Date() },
        prediction: {}
    };

    if (cat === 'home') {
        whereClause.prediction = {
            winProbHome: { gt: 45 }
        };
    } else if (cat === 'over') {
        whereClause.prediction = {
            overProb: { gt: 60 }
        };
    } else if (cat === 'btts') {
        whereClause.prediction = {
            bttsProb: { gt: 60 }
        };
    }

    const matches = await prisma.match.findMany({
        where: whereClause,
        include: {
            translations: { where: { languageCode: lang } },
            league: { include: { translations: { where: { languageCode: lang } } } },
            prediction: true
        },
        orderBy: { date: 'asc' },
        take: 20
    });

    const categories = [
        { id: 'home', label: t.predictions.homeWin, icon: '🏠' },
        { id: 'over', label: t.predictions.overGoals, icon: '⚽' },
        { id: 'btts', label: t.predictions.btts, icon: '🔄' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
            <div className="container mx-auto px-4 lg:px-6">
                <header className="mb-16">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Algorithm Center</div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter italic drop-shadow-sm">
                        {t.predictions.title.split(' ')[0]} <span className="text-blue-600">{t.predictions.title.split(' ').slice(1).join(' ')}</span>
                    </h1>
                </header>

                <div className="flex flex-wrap gap-4 mb-12">
                    {categories.map((c) => (
                        <a
                            key={c.id}
                            href={`/${lang}/predictions?cat=${c.id}`}
                            className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 ${cat === c.id
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105'
                                : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:text-blue-600'
                                }`}
                        >
                            <span>{c.icon}</span>
                            {c.label}
                        </a>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {matches.length > 0 ? (
                        matches.map(match => (
                            <PredictionCard key={match.id} lang={lang} match={match as any} />
                        ))
                    ) : (
                        <div className="py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                            <div className="text-slate-200 dark:text-slate-800 font-black text-6xl uppercase italic tracking-widest opacity-30 mb-4">{t.predictions.noMatches}</div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t.predictions.noCriteria}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
