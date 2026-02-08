import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { generatePageMetadata } from "@/lib/seo";
import { apiSports } from "@/lib/sports-api";
import LeagueStandings from "@/components/LeagueStandings";

// Helper to fetch league by slug
async function getLeagueData(slug: string, lang: string) {
    // 1. Fetch by exact slug in the Translation table
    const leagueTrans = await prisma.leagueTranslation.findUnique({
        where: { slug: slug },
        include: {
            seo: true,
            league: {
                include: {
                    matches: {
                        where: {
                            date: { gte: new Date() },
                            translations: { some: { languageCode: lang } }
                        },
                        include: {
                            translations: { where: { languageCode: lang } },
                            prediction: true
                        },
                        orderBy: { date: 'asc' }
                    }
                }
            }
        }
    });

    // 2. Strict check: If it doesn't belong to the current language, or doesn't exist, we return null
    // Note: If the slug exists but belongs to another language, it will still match findUnique by slug.
    // We must ensure the languageCode matches the requested lang.
    if (!leagueTrans || leagueTrans.languageCode !== lang) {
        return null;
    }

    return leagueTrans;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string, leagueSlug: string }> }) {
    const { lang, leagueSlug } = await params;
    const data = await getLeagueData(leagueSlug, lang);
    if (!data || !data.seo) return {};
    return await generatePageMetadata(data.seo);
}

export default async function LeaguePage({ params }: { params: Promise<{ lang: string, leagueSlug: string }> }) {
    const { lang, leagueSlug } = await params;
    const t = getDictionary(lang);
    const leagueTrans = await getLeagueData(leagueSlug, lang);

    if (!leagueTrans) return notFound();

    const translateTip = (tip: string | null | undefined) => {
        if (!tip) return "";
        const lower = tip.toLowerCase();
        if (lower.includes('home win')) return lang === 'fa' ? 'برد میزبان' : lang === 'ar' ? 'فوز صاحب الأرض' : 'Home Win';
        if (lower.includes('away win')) return lang === 'fa' ? 'برد میهمان' : lang === 'ar' ? 'فوز الضيف' : 'Away Win';
        if (lower.includes('draw')) return lang === 'fa' ? 'مساوی' : lang === 'ar' ? 'تعادل' : 'Draw';
        if (lower.includes('btts')) return lang === 'fa' ? 'گلزنی هر دو تیم' : lang === 'ar' ? 'كلا الفريقين يسجل' : 'BTTS Yes';
        return tip;
    };

    // Fetch Real Standings using the DB ID
    const apiId = leagueTrans.league.apiId;
    let standings: any[] = [];
    let upcomingMatches = leagueTrans.league.matches;

    if (apiId) {
        try {
            standings = await apiSports.getStandings(apiId);

            // Fallback for matches if DB is empty for this league
            if (upcomingMatches.length === 0) {
                const apiMatches = await apiSports.getLiveScores({ league: apiId, next: '10' });
                upcomingMatches = apiMatches.map((m: any) => ({
                    id: m.fixture.id.toString(),
                    homeTeam: m.teams.home.name,
                    homeTeamLogo: m.teams.home.logo,
                    awayTeam: m.teams.away.name,
                    awayTeamLogo: m.teams.away.logo,
                    date: m.fixture.date,
                    status: m.fixture.status.short,
                    mainTip: "Analysis Pending",
                    confidence: 70,
                    prediction: { winProbHome: 33, winProbDraw: 33, winProbAway: 33 }, // Mock for fallback
                    translations: [{
                        slug: `${m.teams.home.name}-vs-${m.teams.away.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        name: `${m.teams.home.name} vs ${m.teams.away.name}`
                    }]
                })) as any;
            }
        } catch (err) {
            console.error("Failed to fetch league data fallback:", err);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <nav className="text-sm text-slate-500 mb-6">
                <Link href={`/${lang}`} className="hover:text-primary dark:hover:text-blue-400">{t.nav.home}</Link>

                <span className="mx-2">/</span>
                <span className="font-medium text-slate-900 dark:text-white">{leagueTrans.name}</span>

            </nav>

            <div className="flex items-center space-x-4 mb-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl font-bold text-primary dark:text-blue-500 relative overflow-hidden group">
                    {leagueTrans.league.logoUrl ? (
                        <Image
                            src={leagueTrans.league.logoUrl}
                            alt={leagueTrans.name}
                            fill
                            sizes="64px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            unoptimized
                        />
                    ) : (
                        leagueTrans.league.country.substring(0, 2).toUpperCase()
                    )}
                </div>
                <div>


                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{leagueTrans.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{leagueTrans.league.country}</p>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {/* League Standings (Real Data) */}
                    {standings.length > 0 && <LeagueStandings standings={standings} t={t} />}

                    {/* Upcoming Matches Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="font-bold text-slate-900 dark:text-white">{t.ui.upcomingMatches}</h2>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {upcomingMatches.map((match: any) => {
                                const matchTrans = match.translations[0];
                                if (!matchTrans) return null;
                                return (
                                    <Link
                                        key={match.id}
                                        href={`/${lang}/league/${leagueSlug}/${matchTrans.slug}`}
                                        className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition group gap-4 md:gap-0"
                                    >
                                        <div className="flex-1 w-full grid grid-cols-3 items-center">
                                            <div className="flex items-center justify-end gap-2 md:gap-3 text-right">
                                                <div className="font-bold text-sm md:text-lg text-slate-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-blue-400 transition truncate">{match.homeTeam}</div>
                                                <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center text-[10px] md:text-xs font-black">
                                                    {match.homeTeamLogo ? (
                                                        <Image src={match.homeTeamLogo} alt={match.homeTeam} fill sizes="40px" className="object-contain p-1" unoptimized />
                                                    ) : (
                                                        match.homeTeam.substring(0, 1)
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-center px-2">
                                                <div className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[8px] md:text-[10px] py-0.5 md:py-1 px-2 md:px-3 rounded-full inline-block font-bold uppercase tracking-widest whitespace-nowrap">
                                                    {new Date(match.date).toLocaleDateString(lang, { day: '2-digit', month: 'short' })}
                                                </div>
                                                <div className="font-mono text-base md:text-xl mt-1 text-slate-900 dark:text-white opacity-20">VS</div>
                                            </div>

                                            <div className="flex items-center justify-start gap-2 md:gap-3 text-left">
                                                <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center text-[10px] md:text-xs font-black">
                                                    {match.awayTeamLogo ? (
                                                        <Image src={match.awayTeamLogo} alt={match.awayTeam} fill sizes="40px" className="object-contain p-1" unoptimized />
                                                    ) : (
                                                        match.awayTeam.substring(0, 1)
                                                    )}
                                                </div>
                                                <div className="font-bold text-sm md:text-lg text-slate-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-blue-400 transition truncate">{match.awayTeam}</div>
                                            </div>
                                        </div>

                                        {match.prediction && (
                                            <div className="md:ml-8 flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-2 w-full md:w-auto justify-center md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                                                <div className="bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg leading-none whitespace-nowrap">
                                                    {translateTip(match.mainTip || "Home Win")}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{match.confidence || 75}% {t.ui.confidence}</span>
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                </div>
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                            {upcomingMatches.length === 0 && (
                                <div className="p-12 text-center text-slate-400 dark:text-slate-500">{t.ui.noPredictions}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="bg-slate-900 p-8 rounded-[2rem] text-white sticky top-24 shadow-2xl">
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6">{t.ui.expertTipHub}</div>
                        <h3 className="text-2xl font-black leading-tight mb-4 text-white">{t.ui.winMoreOn} {leagueTrans.name}</h3>
                        <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">{t.ui.proDescription}</p>
                        <button className="w-full py-4 bg-blue-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">{t.ui.getProPredictions}</button>
                    </div>

                    <div className="p-8 border border-slate-200 dark:border-slate-700 rounded-[2rem] bg-white dark:bg-slate-800">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">{t.ui.leagueStats}</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-600 dark:text-slate-300">{t.ui.avgGoals}</span>
                                <span className="text-slate-900 dark:text-white">2.84</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-600 dark:text-slate-300">{t.ui.homeWinPct}</span>
                                <span className="text-slate-900 dark:text-white">45%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-600 dark:text-slate-300">{t.ui.bttsPct}</span>
                                <span className="text-blue-600">58%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
