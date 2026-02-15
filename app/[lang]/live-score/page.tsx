import StaticPageTemplate from "@/components/StaticPageTemplate";
import prisma from "@/lib/db";
import { Metadata } from "next";
import LiveScoreDashboard from "@/components/LiveScoreDashboard";
import { getDictionary } from "@/lib/i18n";
import { Activity } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const { lang } = await params;
    const page = await prisma.staticPage.findUnique({
        where: { slug: 'live-score' },
        include: {
            translations: {
                where: { languageCode: lang },
                include: { seo: true }
            }
        }
    });

    const trans = page?.translations[0];
    if (!trans) return { title: 'Live Score' };

    return {
        title: trans.seo?.title || trans.title,
        description: trans.seo?.description || trans.content.substring(0, 160).replace(/<[^>]*>?/gm, ''),
    };
}

export default async function LiveScorePage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const t = getDictionary(lang);

    return (
        <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen pb-20 overflow-x-hidden">
            {/* Header Section */}
            <div className="bg-slate-950 text-white pt-12 pb-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                <div className="container mx-auto px-4 lg:px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-pulse text-blue-400">
                        <Activity className="w-4 h-4" />
                        Live Analysis Engine Online
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter mb-6 leading-none">
                        Real-Time <span className="text-blue-500">LiveScore</span> <br />
                        <span className="text-slate-400">& Analysis Hub</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed uppercase tracking-wide">
                        Real-time match updates, expert win percentages, and deep algorithmic analysis for every ongoing game.
                    </p>
                </div>
                {/* Decorative curve */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8fafc] dark:from-slate-950 to-transparent" />
            </div>

            <div className="container mx-auto px-4 lg:px-6 -mt-12 relative z-20">
                <div className="grid grid-cols-1 gap-12">
                    {/* Live Score Dashboard Component */}
                    <div className="w-full">
                        <LiveScoreDashboard lang={lang} t={t} />
                    </div>

                    {/* SEO & Guide Section */}
                    <div className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-20">
                        <div className="max-w-4xl mx-auto">
                            <div className="portal-card p-12 bg-white dark:bg-slate-900 border-l-4 border-blue-600">
                                <StaticPageTemplate slug="live-score" lang={lang} hideTitle={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

