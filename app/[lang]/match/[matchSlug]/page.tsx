import prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string, matchSlug: string }> }) {
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

export default async function MatchSlugPage({ params }: { params: Promise<{ lang: string, matchSlug: string }> }) {
    const { lang, matchSlug } = await params;

    let matchTrans = await prisma.matchTranslation.findUnique({
        where: { slug: matchSlug },
        include: {
            match: {
                include: {
                    league: {
                        include: {
                            translations: { where: { languageCode: lang } }
                        }
                    }
                }
            }
        }
    });

    // Fallback: If not found by slug, try to find by ID or ApiSportsID (in case the link used an ID)
    if (!matchTrans) {
        // 1. Try DB lookup by ID/API ID
        let matchById = await prisma.match.findFirst({
            where: {
                OR: [
                    { id: matchSlug }, // If matchSlug is actually a UUID
                    { apiSportsId: matchSlug } // If matchSlug is an API ID
                ]
            },
            include: {
                translations: { where: { languageCode: lang } },
                league: {
                    include: {
                        translations: { where: { languageCode: lang } }
                    }
                }
            }
        });

        // 2. If not in DB, try fetching from API-Sports (sync on demand)
        // Only try this if matchSlug looks like an API ID (numeric)
        if (!matchById && /^\d+$/.test(matchSlug)) {
            // Dynamic import to avoid circular dep issues if any, or just import
            const { ensureMatchFromApi } = await import("@/lib/match-service");
            const newMatch = await ensureMatchFromApi(matchSlug);
            if (newMatch) {
                // Re-fetch with relations to match expected structure
                matchById = await prisma.match.findUnique({
                    where: { id: newMatch.id },
                    include: {
                        translations: { where: { languageCode: lang } },
                        league: {
                            include: {
                                translations: { where: { languageCode: lang } }
                            }
                        }
                    }
                }) as any;
            }
        }

        if (matchById && matchById.translations && matchById.translations.length > 0) {
            matchTrans = matchById.translations[0] as any;
            (matchTrans as any).match = matchById;
        } else if (matchById) {
            // If match exists but no translation for this lang, create a dummy trans object
            matchTrans = {
                languageCode: lang,
                slug: matchSlug,
                match: matchById,
                name: `${matchById.homeTeam} vs ${matchById.awayTeam}`,
                // ... other fields
            } as any;
        }
    }

    if (!matchTrans || matchTrans.languageCode !== lang) {
        notFound();
    }

    const leagueSlug = matchTrans.match.league.translations[0]?.slug || 'any';

    // Redirect to the canonical league-nested URL
    redirect(`/${lang}/league/${leagueSlug}/${matchSlug}`);
}
