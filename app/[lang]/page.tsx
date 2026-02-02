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

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const t = getDictionary(lang);

    let leagues: any[] = [];
    let featuredArticles: any[] = [];
    let matches: any[] = [];

    try {
        const [leaguesRes, articlesRes, matchesRes] = await Promise.all([
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
            prisma.match?.findMany({
                where: { translations: { some: { languageCode: lang } } },
                include: {
                    translations: { where: { languageCode: lang } },
                    prediction: true,
                    league: {
                        include: {
                            translations: { where: { languageCode: lang } }
                        }
                    }
                },
                take: 8,
                orderBy: { date: 'asc' }
            }) || Promise.resolve([])
        ]);
        leagues = leaguesRes;
        featuredArticles = articlesRes;
        matches = matchesRes;
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
                        <LeaguesSidebar lang={lang} />
                    </div>

                    {/* Column 2: Main Content (Predictions & Featured) */}
                    <main className="xl:col-span-6 space-y-8 md:space-y-12 min-w-0">
                        {/* Featured High-Fidelity Mini-Hero */}
                        <section className="relative rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden min-h-[300px] md:min-h-[500px] flex flex-col justify-center shadow-2xl group">
                            <Image
                                src="/images/hero-bg.png"
                                alt="Premium Sports Hub"
                                fill
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
                                <button className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20">Today</button>
                                <button className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:border-blue-600 hover:text-blue-600">Tomorrow</button>
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

                        {/* Expert Insights - Simplified & Human Ready */}
                        <div className="portal-card p-8 space-y-8 bg-white dark:bg-slate-950 border-t-4 border-blue-600">
                            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-6">
                                <div className="flex items-center gap-3">
                                    <Crown className="w-5 h-5 text-blue-600" />
                                    <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Platform Top Experts</h4>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { name: "Pro Analyst 01", win: "88%", profit: "+4.2k", trend: "up" },
                                    { name: "Market Shark", win: "82%", profit: "+3.1k", trend: "up" },
                                ].map((expert, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-blue-600/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-blue-600/20">
                                                {expert.name[0]}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{expert.name}</div>
                                                <div className="text-[8px] font-bold text-blue-600 uppercase mt-0.5">{expert.win} Success Rate</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">{expert.profit}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href={`/${lang}/predictions`} className="block w-full text-center py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-950 transition-all">
                                View Full Analysis
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}





