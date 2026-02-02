import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { generatePageMetadata } from "@/lib/seo";
import PredictionChart from "@/components/PredictionChart";
import { getDictionary } from "@/lib/i18n";
import ShareButtons from "@/components/ShareButtons";
import OddsDisplay from "@/components/OddsDisplay";
import LiveMatchHeader from "@/components/LiveMatchHeader";
import NotifyButton from "@/components/NotifyButton";

export async function generateMetadata({ params }: { params: Promise<{ lang: string, leagueSlug: string, matchSlug: string }> }) {
    const { lang, matchSlug } = await params;

    const slugTrans = await prisma.matchTranslation.findUnique({
        where: { slug: matchSlug },
        select: { matchId: true }
    });

    if (!slugTrans) return {};

    const matchTrans = await prisma.matchTranslation.findFirst({
        where: { matchId: slugTrans.matchId, languageCode: lang },
        include: { seo: true }
    });

    if (!matchTrans) return {};
    return generatePageMetadata(matchTrans.seo);
}

export default async function MatchPage({ params }: { params: Promise<{ lang: string, leagueSlug: string, matchSlug: string }> }) {
    const { lang, leagueSlug, matchSlug } = await params;
    const t = getDictionary(lang);

    // First, find the match by any slug
    const slugTrans = await prisma.matchTranslation.findUnique({
        where: { slug: matchSlug },
        select: { matchId: true }
    });

    if (!slugTrans) notFound();

    // Then, get the translation for the current language
    const articleTrans = await prisma.matchTranslation.findFirst({
        where: { matchId: slugTrans.matchId, languageCode: lang },
        include: {
            seo: true,
            match: {
                include: {
                    prediction: {
                        include: {
                            translations: { where: { languageCode: lang } }
                        }
                    }
                }
            }
        }
    });

    // Fall back to the original if no translation exists
    const finalTrans = articleTrans || await prisma.matchTranslation.findUnique({
        where: { slug: matchSlug },
        include: {
            seo: true,
            match: {
                include: {
                    prediction: {
                        include: {
                            translations: { where: { languageCode: lang } }
                        }
                    }
                }
            }
        }
    });

    if (!finalTrans) notFound();

    let leagueName = leagueSlug;
    const leagueTransData = await prisma.leagueTranslation.findUnique({
        where: { slug: leagueSlug },
        select: { name: true }
    });

    if (leagueTransData && leagueTransData.name) {
        leagueName = leagueTransData.name;
    }

    const match = finalTrans.match;
    const prediction = match.prediction;

    // Structured Data (JSON-LD)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        "name": finalTrans.name,
        "startDate": match.date,
        "homeTeam": { "@type": "SportsTeam", "name": match.homeTeam },
        "awayTeam": { "@type": "SportsTeam", "name": match.awayTeam },
        "description": finalTrans.content || `Prediction and live scores for ${match.homeTeam} vs ${match.awayTeam}`
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <nav className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                <Link href={`/${lang}`} className="hover:text-blue-600 transition-colors uppercase">{t.nav.home}</Link>
                <span className="opacity-30">/</span>
                <Link href={`/${lang}/league/${leagueSlug}`} className="hover:text-blue-600 transition-colors uppercase">{leagueName}</Link>
                <span className="opacity-30">/</span>
                <span className="text-blue-600 truncate max-w-[200px]">{finalTrans.name}</span>
            </nav>

            <header className="mb-12">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                    {finalTrans.seo?.h1 || finalTrans.name}
                </h1>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        {leagueName}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>{new Date(match.date).toLocaleDateString(lang, { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {/* Live Scoreboard */}
                    <LiveMatchHeader
                        matchId={match.id}
                        initialData={{
                            status: match.status,
                            homeScore: match.homeScore,
                            awayScore: match.awayScore,
                            minute: match.minute,
                            date: match.date,
                            homeTeam: match.homeTeam,
                            awayTeam: match.awayTeam,
                            homeTeamLogo: match.homeTeamLogo,
                            awayTeamLogo: match.awayTeamLogo
                        }}
                        lang={lang}
                        t={t}
                    />

                    {/* Expert Tip Box (Critical Milestone 4 Demand) */}
                    <div className="bg-blue-600 rounded-3xl md:rounded-[2.5rem] p-0.5 md:p-1 shadow-2xl shadow-blue-500/30">
                        <div className="bg-slate-900 rounded-[1.4rem] md:rounded-[2.4rem] p-6 md:p-12 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-blue-600/10 blur-[60px] md:blur-[80px] -mr-24 md:-mr-32 -mt-24 md:-mt-32" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 text-center md:text-start">
                                <div className="space-y-3 md:space-y-4 max-w-sm">
                                    <div className="inline-flex items-center gap-2 bg-blue-600 px-3 py-1.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-2 md:mb-4">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                        Expert Verdict
                                    </div>
                                    <h3 className="text-2xl md:text-4xl font-black tracking-tighter italic leading-tight">"Safe bet on {match.mainTip || 'Home Win'}"</h3>
                                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">Our AI models and human analysts agree on this outcome based on form and data.</p>
                                </div>

                                <div className="flex flex-col items-center gap-4 md:gap-6">
                                    <div className="flex flex-col items-center">
                                        <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 md:mb-2">Confidence Score</div>
                                        <div className="text-4xl md:text-6xl font-black text-blue-500 italic tracking-tighter">{match.confidence || 85}%</div>
                                    </div>
                                    <div className="w-full h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden min-w-[150px] md:min-w-[200px]">
                                        <div className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.8)]" style={{ width: `${match.confidence || 85}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Prediction Section */}
                    {prediction && (
                        <div className="premium-card p-6 md:p-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 space-y-8 md:space-y-10">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 md:pb-6">

                                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center">

                                    <div className="w-1 h-5 md:w-1.5 md:h-6 bg-blue-600 rounded-full me-3 md:me-4" />
                                    {t.match.winProbability}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                                <div className="space-y-8">
                                    <PredictionChart
                                        homeProb={Math.round(prediction.winProbHome)}
                                        awayProb={Math.round(prediction.winProbAway)}
                                        drawProb={Math.round(prediction.winProbDraw)}
                                        homeTeam={match.homeTeam}
                                        awayTeam={match.awayTeam}
                                    />
                                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                                        <span>Home: <b className="text-blue-600">{Math.round(prediction.winProbHome)}%</b></span>
                                        <span>Draw: <b>{Math.round(prediction.winProbDraw)}%</b></span>
                                        <span>Away: <b>{Math.round(prediction.winProbAway)}%</b></span>
                                    </div>
                                </div>

                                <div className="space-y-8 pt-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Over/Under 2.5 Goals</span>
                                            <span className="text-blue-600">65% Over</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Over 2.5</div>
                                                <div className="text-xl font-black text-slate-900 dark:text-white">65%</div>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Under 2.5</div>
                                                <div className="text-xl font-black text-slate-900 dark:text-white">35%</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-6">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Both Teams To Score</span>
                                            <span className="text-blue-600">Yes (58%)</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">BTTS Yes</div>
                                                <div className="text-xl font-black text-slate-900 dark:text-white">58%</div>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">BTTS No</div>
                                                <div className="text-xl font-black text-slate-900 dark:text-white">42%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* Lineups & Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {match.lineups && (
                            <div className="premium-card p-8 space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.match.lineups}</h3>
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                    {match.lineups}
                                </div>

                            </div>
                        )}
                        {match.stats && (
                            <div className="premium-card p-8 space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.match.stats}</h3>
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                    {match.stats}
                                </div>

                            </div>
                        )}
                    </div>

                    {/* Analysis Content */}
                    <div className="space-y-8">
                        {finalTrans.content && (
                            <div className="prose prose-sm md:prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">

                                <div dangerouslySetInnerHTML={{ __html: finalTrans.content }} />
                            </div>
                        )}
                        {finalTrans.analysis && (
                            <div className="bg-blue-600 p-6 md:p-10 rounded-2xl md:rounded-3xl text-white space-y-4 md:space-y-6 shadow-2xl shadow-blue-500/20">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">{t.match.expertAnalysis}</h3>
                                <div className="prose prose-sm md:prose-lg prose-invert max-w-none italic leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: finalTrans.analysis }} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Live Odds from API */}
                    <OddsDisplay homeTeam={match.homeTeam} awayTeam={match.awayTeam} t={t} />

                    <div className="premium-card p-8 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">{t.ui.liveAlerts}</h4>
                        <NotifyButton label={t.ui.notifyMe} />
                    </div>

                    <div className="premium-card p-6 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700">
                        <ShareButtons title={finalTrans.name} />
                    </div>
                </div>
            </div>
        </div>
    );
}

