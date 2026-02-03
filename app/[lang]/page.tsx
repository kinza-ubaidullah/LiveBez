import prisma from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n";
import PredictionCard from "@/components/PredictionCard";
import LiveTicker from "@/components/LiveTicker";
import BookmakersWidget from "@/components/BookmakersWidget";
import LeaguesSidebar from "@/components/LeaguesSidebar";
import { Activity, Crown, Trophy } from "lucide-react";



export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    let settings = null;
    try {
        settings = await prisma.siteSettings?.findFirst();
    } catch (e) {
        console.error("Metadata fetch failed:", e);
    }

    return {
        title: settings?.globalTitle || "LiveScore & Expert Predictions | LiveBaz",
        description: settings?.globalDesc || "Professional football picks, live scores, and expert analysis.",
    };
}

import { apiSports } from "@/lib/sports-api";

// ... previous imports

export default async function Home({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>,
    searchParams: Promise<{ day?: string }>
}) {
    const { lang } = await params;
    const { day = 'today' } = await searchParams;
    const t = getDictionary(lang);

    let leagues: any[] = [];
    let featuredArticles: any[] = [];
    let matches: any[] = [];

    // Calculate dates
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const targetDate = day === 'tomorrow' ? tomorrow : today;
    const dateString = targetDate.toISOString().split('T')[0];

    try {
        const [leaguesRes, articlesRes] = await Promise.all([
            prisma.league?.findMany({
                where: { translations: { some: { languageCode: lang } } },
                include: { translations: { where: { languageCode: lang } } }
            }) || Promise.resolve([]),
            prisma.article?.findMany({
                where: { published: true, translations: { some: { languageCode: lang } } },
                include: { translations: { where: { languageCode: lang } } },
                take: 4,
                orderBy: { createdAt: 'desc' }
            }) || Promise.resolve([]),
        ]);

        leagues = leaguesRes;
        featuredArticles = articlesRes;

        // Fetch Matches for the target day
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        matches = await prisma.match?.findMany({
            where: {
                date: { gte: startOfDay, lte: endOfDay },
                translations: { some: { languageCode: lang } }
            },
            include: {
                translations: { where: { languageCode: lang } },
                prediction: true,
                league: {
                    include: {
                        translations: { where: { languageCode: lang } }
                    }
                }
            },
            orderBy: { date: 'asc' }
        }) || [];

        // --- Automatic Background Sync Logic (Only for Today) ---
        if (day === 'today') {
            const lastSync = await (prisma as any).syncLog?.findFirst({
                where: { type: 'Matches' },
                orderBy: { createdAt: 'desc' }
            });

            const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

            if (matches.length === 0 || !lastSync || lastSync.createdAt < thirtyMinsAgo) {
                console.log("🔄 Auto-syncing projections in background...");
                fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:4005'}/api/sync/matches`).catch(e => { });
            }
        }

        // Fallback: Fetch from API if DB is empty for this day
        if (matches.length === 0) {
            console.log(`⚠️ DB empty for ${day}, fetching from API...`);
            const apiMatches = await apiSports.getLiveScores({ date: dateString });

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
            }));
        }

    } catch (e) {
        console.error("Home page data fetch failed:", e);
    }

    return (
        <div className="flex flex-col bg-[#f1f5f9] dark:bg-[#020617] min-h-screen">
            {/* Live Ticker - Global Context */}
            <LiveTicker lang={lang} t={t} />

            <div className="container mx-auto px-4 lg:px-6 py-8 max-w-[1600px]">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* Column 1: Left Sidebar (League Nav) */}
                    <div className="hidden xl:block xl:col-span-3">
                        <LeaguesSidebar lang={lang} leagues={leagues} />
                    </div>

                    {/* Column 2: Main Content (Predictions & Featured) */}
                    <main className="xl:col-span-6 space-y-8 md:space-y-12 min-w-0">
                        {/* Featured High-Fidelity Mini-Hero */}
                        <section className="relative rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden min-h-[300px] md:min-h-[500px] flex flex-col justify-center shadow-2xl group">
                            <Image
                                src="/images/hero-bg.png"
                                alt="Premium Sports Hub"
                                fill
                                sizes="100vw"
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

                            <div className="relative z-10 p-6 md:p-12 space-y-4 md:space-y-8 max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 border border-blue-400/30 rounded-full text-[7px] md:text-[9px] font-black text-white uppercase tracking-[0.2em] shadow-xl">
                                    YOU ARE FOR LIFE SPORTS AND EXPERT
                                </div>
                                <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white leading-[0.9] md:leading-[0.85] tracking-tighter uppercase italic drop-shadow-2xl">
                                    {t.hero.title1} <br />
                                    <span className="text-blue-500">{t.hero.titleHighlight}</span> <br />
                                    {t.hero.title2}
                                </h2>
                                <p className="text-sm md:text-lg text-slate-300 font-medium leading-relaxed max-w-lg line-clamp-3 md:line-clamp-none">
                                    {t.hero.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-2 md:pt-4">
                                    <Link href={`/${lang}/predictions`} className="bg-blue-600 text-white px-6 md:px-10 py-3.5 md:py-5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/40">
                                        {t.hero.startWinning}
                                    </Link>
                                    <button className="bg-white/5 backdrop-blur-xl text-white border border-white/10 px-6 md:px-10 py-3.5 md:py-5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                        Learn More
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Prediction Stream */}
                        <section className="space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.5)]" />
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                                        Today's Prediction Picks
                                    </h2>
                                </div>
                                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                                    <Activity className="w-3 h-3 text-blue-600 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Live Analysis Active</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`/${lang}?day=today`}
                                    className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${day === 'today' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:border-blue-600 hover:text-blue-600'}`}
                                >
                                    Today
                                </Link>
                                <Link
                                    href={`/${lang}?day=tomorrow`}
                                    className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${day === 'tomorrow' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:border-blue-600 hover:text-blue-600'}`}
                                >
                                    Tomorrow
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {matches.length > 0 ? (
                                    matches.map((match: any) => (
                                        <PredictionCard key={match.id} lang={lang} match={match} />
                                    ))
                                ) : (
                                    <div className="portal-card p-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                                        <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for live data sync...</div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </main>

                    {/* Column 3: Right Sidebar (Widgets) */}
                    <aside className="xl:col-span-3 space-y-12">
                        <BookmakersWidget lang={lang} />

                        {/* Featured Headlines - Real Data from DB */}
                        <div className="portal-card p-8 space-y-8 bg-white dark:bg-slate-950 border-t-4 border-blue-600">
                            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-6">
                                <div className="flex items-center gap-3">
                                    <Trophy className="w-5 h-5 text-blue-600" />
                                    <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Featured Headlines</h4>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {featuredArticles.length > 0 ? (
                                    featuredArticles.map((article: any, i) => (
                                        <div key={i} className="group relative">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden flex-shrink-0 relative">
                                                    {article.featuredImage ? (
                                                        <Image
                                                            src={article.featuredImage}
                                                            alt={article.translations[0]?.title}
                                                            fill
                                                            sizes="48px"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xs">NL</div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[8px] font-black text-blue-600 uppercase tracking-widest">
                                                        {new Date(article.createdAt).toLocaleDateString(lang, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-tight group-hover:text-blue-600 transition-colors">
                                                        <Link href={`/${lang}/blog/${article.translations[0]?.slug}`}>
                                                            {article.translations[0]?.title}
                                                        </Link>
                                                    </h5>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Stay tuned for news...
                                    </div>
                                )}
                            </div>
                            <Link href={`/${lang}/blog`} className="block w-full text-center py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-950 transition-all">
                                View Full Blog
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}





