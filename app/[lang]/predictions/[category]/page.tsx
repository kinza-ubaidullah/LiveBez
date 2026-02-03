import { getDictionary } from "@/lib/i18n";
import prisma from "@/lib/db";
import PredictionCard from "@/components/PredictionCard";
import { notFound } from "next/navigation";
import { Activity, Target, Trophy } from "lucide-react";
import { apiSports } from "@/lib/sports-api";

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
        // Broaden to show matches even if analysis is pending, so the page isn't empty
        where.OR = [
            { mainTip: { contains: 'Win' } },
            { mainTip: 'Analysis Pending' },
            { mainTip: 'TBD' }
        ];
        title = "1X2 Predictions";
        IconComponent = Activity;
    } else if (category === 'btts') {
        where.OR = [
            { mainTip: { contains: 'BTTS' } },
            { mainTip: 'Analysis Pending' }
        ];
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

    let matches = await prisma.match.findMany({
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

    // Fallback if DB is empty for this category
    if (matches.length === 0 && category === '1x2') {
        const apiMatches = await apiSports.getLiveScores({ next: '20' });
        matches = apiMatches.map((m: any) => ({
            id: m.fixture.id.toString(),
            homeTeam: m.teams.home.name,
            homeTeamLogo: m.teams.home.logo,
            awayTeam: m.teams.away.name,
            awayTeamLogo: m.teams.away.logo,
            date: m.fixture.date,
            status: m.fixture.status.short,
            mainTip: "Analysis Pending",
            league: {
                translations: [{
                    name: m.league.name,
                    slug: m.league.name.toLowerCase().replace(/ /g, '-')
                }]
            },
            translations: [{
                slug: `${m.fixture.id}-${m.teams.home.name}-vs-${m.teams.away.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                name: `${m.teams.home.name} vs ${m.teams.away.name}`
            }]
        })) as any;
    }

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
