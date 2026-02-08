import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PredictionCard from "@/components/PredictionCard";
import { Metadata } from "next";

interface TeamPageProps {
    params: Promise<{
        lang: string;
        slug: string;
    }>;
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    const teamTrans = await prisma.teamTranslation.findUnique({
        where: { slug },
        include: { seo: true }
    });

    if (!teamTrans) return {};

    return {
        title: teamTrans.seo?.title || teamTrans.name,
        description: teamTrans.seo?.description || `Live scores and predictions for ${teamTrans.name}`,
        alternates: {
            canonical: teamTrans.seo?.canonical || undefined
        },
        robots: {
            index: !teamTrans.seo?.noIndex,
            follow: !teamTrans.seo?.noIndex,
        },
        openGraph: {
            title: teamTrans.seo?.ogTitle || teamTrans.seo?.title || teamTrans.name,
            description: teamTrans.seo?.ogDescription || teamTrans.seo?.description || undefined,
            images: teamTrans.seo?.ogImage ? [teamTrans.seo.ogImage] : []
        }
    };
}

export default async function TeamPage({ params }: TeamPageProps) {
    const { lang, slug } = await params;

    const team = await prisma.team.findFirst({
        where: {
            translations: {
                some: { slug }
            }
        },
        include: {
            translations: {
                where: { languageCode: lang }
            },
            homeMatches: {
                include: {
                    translations: { where: { languageCode: lang } },
                    league: { include: { translations: { where: { languageCode: lang } } } },
                    prediction: true
                },
                orderBy: { date: 'desc' },
                take: 10
            },
            awayMatches: {
                include: {
                    translations: { where: { languageCode: lang } },
                    league: { include: { translations: { where: { languageCode: lang } } } },
                    prediction: true
                },
                orderBy: { date: 'desc' },
                take: 10
            }
        }
    });

    if (!team) notFound();

    const translation = team.translations[0] || (await prisma.teamTranslation.findFirst({ where: { teamId: team.id, languageCode: 'en' } }));
    if (!translation) notFound();

    const allMatches = [...team.homeMatches, ...team.awayMatches].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Structured Data (JSON-LD)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SportsTeam",
        "name": translation.name,
        "description": translation.description || `Official profile, statistics and predictions for ${translation.name}.`,
        "logo": team.logoUrl,
        "memberOf": {
            "@type": "SportsOrganization",
            "name": team.country || "International Football"
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Team Header */}
            <div className="relative bg-slate-900 overflow-hidden py-24">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="relative w-32 h-32 md:w-48 md:h-48 bg-white dark:bg-slate-950 rounded-[3rem] shadow-2xl flex items-center justify-center p-6 border border-white/10 group-hover:scale-105 transition-transform duration-500">
                            {team.logoUrl ? (
                                <Image src={team.logoUrl} alt={translation.name} fill className="object-contain p-8" unoptimized />
                            ) : (
                                <div className="text-6xl font-black text-slate-200 uppercase">{translation.name.substring(0, 2)}</div>
                            )}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">Official Profile</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{team.country || 'International'}</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-6 drop-shadow-2xl">
                                {translation.name} <span className="text-blue-600 opacity-50 underline decoration-4 underline-offset-8">FC</span>
                            </h1>
                            <p className="text-xl text-slate-400 font-medium max-w-2xl italic leading-relaxed">
                                {translation.description || `Comprehensive stats, upcoming fixtures, and expert predictions for ${translation.name}. Get the edge with our deep tactical analysis and live data.`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matches Section */}
            <div className="container mx-auto px-4 -mt-12 pb-24 relative z-20">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-2 h-10 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Fixture Matrix</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {allMatches.map(match => (
                        <PredictionCard key={match.id} lang={lang} match={match as any} />
                    ))}
                    {allMatches.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="text-slate-300 dark:text-slate-700 font-black text-4xl uppercase italic tracking-widest opacity-20 mb-4">No Active Data</div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No upcoming or recent fixtures found for this team.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
