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
        // Only try this if matchSlug looks like an API ID (numeric) or a valid ID format
        if (!matchById && /^\d+$/.test(matchSlug)) {
            console.log(`[MatchPage] Match not found in DB. Attempting to sync from API for ID: ${matchSlug}`);
            try {
                // Dynamic import to avoid circular dep issues if any, or just import
                const { ensureMatchFromApi } = await import("@/lib/match-service");

                // Ensure ID is passed as string to match existing logic
                const newMatch = await ensureMatchFromApi(matchSlug);

                if (newMatch) {
                    console.log(`[MatchPage] Successfully synced match: ${newMatch.id}`);
                    // Re-fetch with relations to match expected structure and confirm commit
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
                } else {
                    console.error(`[MatchPage] Failed to sync match ${matchSlug} from API (ensureMatchFromApi returned null).`);
                }
            } catch (err) {
                console.error(`[MatchPage] Error during ensureMatchFromApi:`, err);
            }
        }
        if (matchById) {
            if (matchById.translations && matchById.translations.length > 0) {
                matchTrans = matchById.translations[0] as any;
                (matchTrans as any).match = matchById;
            } else {
                // Create dummy trans if needed, though strictly we need translation for slug
                matchTrans = {
                    languageCode: lang,
                    slug: matchSlug,
                    match: matchById,
                    name: `${matchById.homeTeam} vs ${matchById.awayTeam}`,
                } as any;
            }
        }

        if (!matchTrans) {
            notFound();
        }
    }

    const leagueSlug = matchTrans.match.league.translations[0]?.slug || 'any';
    redirect(`/${lang}/league/${leagueSlug}/${matchTrans.slug}`);
}
