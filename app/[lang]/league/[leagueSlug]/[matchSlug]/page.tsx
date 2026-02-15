import prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { generatePageMetadata } from "@/lib/seo";
import PredictionChart from "@/components/PredictionChart";
import { getDictionary } from "@/lib/i18n";
import { apiSports } from "@/lib/sports-api";
import ShareButtons from "@/components/ShareButtons";

export const dynamic = 'force-dynamic';
import OddsDisplay from "@/components/OddsDisplay";
import LiveMatchHeader from "@/components/LiveMatchHeader";
import NotifyButton from "@/components/NotifyButton";
import MatchTabs from "@/components/MatchTabs";
import { getFullMatchDetails } from "@/lib/match-service";
import ValueAnalysis from "@/components/ValueAnalysis";

export async function generateMetadata({ params }: { params: Promise<{ lang: string, leagueSlug: string, matchSlug: string }> }) {
    const { lang, matchSlug } = await params;

    const matchTrans = await prisma.matchTranslation.findUnique({
        where: { slug: matchSlug },
        include: { seo: true }
    });

    if (!matchTrans || matchTrans.languageCode !== lang) {
        return { title: "Match Not Found | LiveBaz" };
    }

    return generatePageMetadata(matchTrans.seo);
}

export default async function MatchPage({ params }: { params: Promise<{ lang: string, leagueSlug: string, matchSlug: string }> }) {
    const { lang, leagueSlug, matchSlug } = await params;
    const t = getDictionary(lang);

    // 1. Find the match by exact slug in the requested language
    const matchTrans = await prisma.matchTranslation.findUnique({
        where: { slug: matchSlug },
        include: {
            seo: true,
            match: {
                include: {
                    league: {
                        include: {
                            translations: { where: { languageCode: lang } }
                        }
                    },
                    prediction: true
                }
            }
        }
    });

    // 2. Draft check: If match is DRAFT, only allow if searching by ID or special admin preview (simplified for now)
    if (!matchTrans || matchTrans.languageCode !== lang) {
        // Fallback: search for match in any language and redirect
        const fallbackTrans = await prisma.matchTranslation.findFirst({
            where: { slug: matchSlug }
        });
        if (fallbackTrans) {
            redirect(`/${fallbackTrans.languageCode}/match/${matchSlug}`);
        }
        notFound();
    }

    const match: any = matchTrans.match;
    const prediction = match.prediction;
    const finalTrans = matchTrans;

    // Verify league context matches for SEO integrity
    const leagueTransData = match.league.translations[0];
    const leagueName = leagueTransData?.name || match.league.country;

    // If leagueSlug is 'any' or doesn't match, redirect to the correct canonical URL
    if (leagueTransData && leagueTransData.slug !== leagueSlug) {
        redirect(`/${lang}/league/${leagueTransData.slug}/${matchSlug}`);
    }

    const translateTip = (tip: string | null | undefined) => {
        if (!tip) return "";
        const lower = tip.toLowerCase();
        if (lower.includes('home win')) return lang === 'fa' ? 'برد میزبان' : lang === 'ar' ? 'فوز صاحب الأرض' : 'Home Win';
        if (lower.includes('away win')) return lang === 'fa' ? 'برد میهمان' : lang === 'ar' ? 'فوز الضيف' : 'Away Win';
        if (lower.includes('draw')) return lang === 'fa' ? 'مساوی' : lang === 'ar' ? 'تعادل' : 'Draw';
        if (lower.includes('btts')) return lang === 'fa' ? 'گلزنی هر دو تیم' : lang === 'ar' ? 'كلا الفريقين يسجل' : 'BTTS Yes';
        return tip;
    };

    const matchData = await getFullMatchDetails(match.id, match.apiSportsId);
    const stats = matchData?.stats || null;
    const lineups = matchData?.lineups || null;
    const h2h = (matchData as any)?.h2h || null;

    // Structured Data (JSON-LD)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        "name": `${match.homeTeam} vs ${match.awayTeam}`,
        "description": finalTrans.seo?.description || `Match prediction and analysis for ${match.homeTeam} vs ${match.awayTeam}`,
        "startDate": match.date,
        "homeTeam": {
            "@type": "SportsTeam",
            "name": match.homeTeam,
            "logo": match.homeTeamLogo
        },
        "awayTeam": {
            "@type": "SportsTeam",
            "name": match.awayTeam,
            "logo": match.awayTeamLogo
        },
        "location": {
            "@type": "Place",
            "name": match.league.country
        },
        "eventStatus": match.status === 'FINISHED' ? "https://schema.org/EventScheduled" : "https://schema.org/EventScheduled"
    };

    return (
        <div className="bg-[#f0f4f8] dark:bg-slate-950 min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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
                    awayTeamLogo: match.awayTeamLogo,
                    prediction: match.prediction
                }}
                lang={lang}
                t={t}
            />

            <div className="container mx-auto px-4 lg:px-6 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-12 overflow-x-auto whitespace-nowrap pb-4">
                    <Link href={`/${lang}`} className="hover:text-primary transition-colors">{t.nav.home}</Link>
                    <span>/</span>
                    <Link href={`/${lang}/leagues`} className="hover:text-primary transition-colors">{t.footer.leagues}</Link>
                    <span>/</span>
                    <Link href={`/${lang}/league/${leagueSlug}`} className="hover:text-primary transition-colors">{leagueName}</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white italic">{finalTrans.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-12">
                        <MatchTabs
                            stats={stats}
                            lineups={lineups}
                            h2h={h2h}
                            comparison={matchData?.comparison || null}
                            predictionsFull={matchData?.predictionsFull || null}
                            analysis={matchTrans.status === 'PUBLISHED' ? matchTrans.analysis : null}
                            events={(matchData as any)?.events || null}
                            standings={(matchData as any)?.standings || null}
                            homeTeamName={match.homeTeam}
                            awayTeamName={match.awayTeam}
                            lang={lang}
                            t={t}
                        />

                        {/* Odds Comparison */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-primary rounded shadow-lg shadow-primary/20 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-white">Real-Time Market Comparison</h3>
                            </div>
                            <OddsDisplay fixtureId={match.apiSportsId} homeTeam={match.homeTeam} awayTeam={match.awayTeam} t={t} />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Prediction Widget */}
                        <div className="premium-card p-8 bg-white dark:bg-slate-900 border-none shadow-2xl sticky top-24">
                            <div className="text-center mb-10">
                                <div className="inline-block px-4 py-1.5 bg-primary rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg mb-6">Master Pick</div>
                                <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-2 underline decoration-primary decoration-4 underline-offset-8">
                                    {translateTip(match.mainTip || "Home Win")}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4">AI Confidence: {match.confidence || 78}%</p>
                            </div>

                            {prediction && (
                                <div className="space-y-8">
                                    <PredictionChart
                                        homeProb={prediction.winProbHome}
                                        drawProb={prediction.winProbDraw}
                                        awayProb={prediction.winProbAway}
                                        homeTeam={match.homeTeam}
                                        awayTeam={match.awayTeam}
                                    />

                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <ValueAnalysis
                                            modelPredictions={matchData?.predictionsFull}
                                            marketPredictions={prediction}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        {[
                                            { label: 'BTTS', val: prediction.bttsProb, color: 'text-emerald-500' },
                                            { label: 'O2.5', val: prediction.overProb, color: 'text-primary' },
                                            { label: 'U2.5', val: prediction.underProb, color: 'text-slate-400' },
                                        ].map((stat, i) => (
                                            <div key={i} className="text-center">
                                                <div className={`text-lg font-black italic ${stat.color}`}>{stat.val}%</div>
                                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Pro Insight</div>
                                        <div className="text-[10px] text-slate-500 leading-tight">Unlock 15+ more markets.</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bookmaker Ad */}
                        <div className="premium-card bg-primary p-8 text-white relative overflow-hidden group border-none">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.83L19.34 19H4.66L12 5.83z"></path></svg>
                            </div>
                            <div className="relative z-10 text-center">
                                <h4 className="text-xl font-black italic tracking-tighter mb-4">Elite Betting Partners</h4>
                                <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest mb-8 leading-relaxed">Boosted odds available for this match.</p>
                                <Link href={`/${lang}/bookmakers`} className="block w-full py-4 bg-white text-primary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl">Get Bonus Deals</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
