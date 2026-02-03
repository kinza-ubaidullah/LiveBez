import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { generatePageMetadata } from "@/lib/seo";
import PredictionChart from "@/components/PredictionChart";
import { getDictionary } from "@/lib/i18n";
import { apiSports } from "@/lib/sports-api";
import ShareButtons from "@/components/ShareButtons";
import OddsDisplay from "@/components/OddsDisplay";
import LiveMatchHeader from "@/components/LiveMatchHeader";
import NotifyButton from "@/components/NotifyButton";

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

    // 2. Strict check: No fallback to numeric IDs. Slugs must match perfectly.
    if (!matchTrans || matchTrans.languageCode !== lang) {
        notFound();
    }

    const match: any = matchTrans.match;
    const prediction = match.prediction;
    const finalTrans = matchTrans;

    // Verify league context matches for SEO integrity
    const leagueTransData = match.league.translations[0];
    const leagueName = leagueTransData?.name || match.league.country;

    if (leagueTransData && leagueTransData.slug !== leagueSlug) {
        notFound();
    }

    const translateTip = (tip: string | null | undefined) => {
        if (!tip) return "";
        const lower = tip.toLowerCase();
        if (lower.includes('home win')) return lang === 'fa' ? 'برد میزبان' : lang === 'ar' ? 'فوز صاحب الأرض' : 'Home Win';
        if (lower.includes('away win')) return lang === 'fa' ? 'برد میهمان' : lang === 'ar' ? 'فوز الضيف' : 'Away Win';
        if (lower.includes('draw')) return lang === 'fa' ? 'مساوی' : lang === 'ar' ? 'تعادل' : 'Draw';
        if (lower.includes('btts')) return lang === 'fa' ? 'گلزنی ہر دو ٹیم' : lang === 'ar' ? 'كلا الفريقين يسجل' : 'BTTS Yes';
        return tip;
    };

    return (
        <div className="bg-[#f0f4f8] dark:bg-slate-950 min-h-screen">
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

            <div className="container mx-auto px-4 lg:px-6 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-12 overflow-x-auto whitespace-nowrap pb-4">
                    <Link href={`/${lang}`} className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <Link href={`/${lang}/leagues`} className="hover:text-primary transition-colors">Leagues</Link>
                    <span>/</span>
                    <Link href={`/${lang}/league/${leagueSlug}`} className="hover:text-primary transition-colors">{leagueName}</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white italic">{finalTrans.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Analysis Card */}
                        <div className="premium-card p-10 relative overflow-hidden group border-none bg-white">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-1.5 h-8 bg-primary rounded-full" />
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Expert Preview</div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">Match Analysis</h2>
                                    </div>
                                </div>

                                <div className="prose prose-slate dark:prose-invert max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-headings:font-black prose-headings:italic prose-headings:tracking-tighter prose-strong:text-primary prose-a:text-primary hover:prose-a:underline">
                                    {finalTrans.analysis ? (
                                        <div dangerouslySetInnerHTML={{ __html: finalTrans.analysis }} />
                                    ) : (
                                        <p className="italic text-slate-400 text-lg">Detailed tactical analysis and expert insights for this match are being compiled by our scouts. Stay tuned for the full breakdown.</p>
                                    )}
                                </div>

                                <div className="mt-12 flex flex-wrap items-center gap-8 border-t border-slate-100 dark:border-slate-800 pt-10">
                                    <ShareButtons title={finalTrans.name} />
                                    <div className="w-px h-8 bg-slate-100 hidden md:block" />
                                    <div className="flex-1 max-w-xs">
                                        <NotifyButton label="Get Live Score Alerts" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Odds Comparison */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-primary rounded shadow-lg shadow-primary/20 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-white">Real-Time Market Comparison</h3>
                            </div>
                            <OddsDisplay homeTeam={match.homeTeam} awayTeam={match.awayTeam} t={t} />
                        </div>

                        {/* Lineups & Stats */}
                        {(match.lineups || match.stats) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {match.lineups && (
                                    <div className="premium-card p-8 bg-white border-none">
                                        <h3 className="text-xl font-black italic mb-6 flex items-center gap-3">
                                            <div className="w-2 h-2 bg-primary rounded-full" />
                                            Starting Eleven
                                        </h3>
                                        <pre className="text-xs font-sans text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{match.lineups}</pre>
                                    </div>
                                )}
                                {match.stats && (
                                    <div className="premium-card p-8 bg-white border-none">
                                        <h3 className="text-xl font-black italic mb-6 flex items-center gap-3">
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                            Match Metrics
                                        </h3>
                                        <pre className="text-xs font-sans text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{match.stats}</pre>
                                    </div>
                                )}
                            </div>
                        )}
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
