"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateMatchAction(
    matchId: string,
    data: {
        date: Date;
        homeScore?: number;
        awayScore?: number;
        status: string;
        lineups?: string;
        stats?: string;
        homeTeamLogo?: string;
        awayTeamLogo?: string;
        winProbHome: number;

        winProbAway: number;
        winProbDraw: number;
        translations: {
            languageCode: string;
            name: string;
            slug: string;
            content?: string;
            analysis?: string;
            seo: {
                title?: string;
                description?: string;
                canonical?: string;
                ogTitle?: string;
                ogDescription?: string;
                ogImage?: string;
                noIndex: boolean;
            };
        }[];
    }
) {
    try {
        // 1. Update Match model
        await prisma.match.update({
            where: { id: matchId },
            data: {
                date: data.date,
                homeScore: data.homeScore,
                awayScore: data.awayScore,
                status: data.status,
                lineups: data.lineups,
                stats: data.stats,
                homeTeamLogo: data.homeTeamLogo,
                awayTeamLogo: data.awayTeamLogo
            }

        });

        // 2. Update Prediction
        await prisma.prediction.upsert({
            where: { matchId },
            update: {
                winProbHome: data.winProbHome,
                winProbAway: data.winProbAway,
                winProbDraw: data.winProbDraw
            },
            create: {
                matchId,
                winProbHome: data.winProbHome,
                winProbAway: data.winProbAway,
                winProbDraw: data.winProbDraw
            }
        });

        // 3. Loop through translations
        for (const trans of data.translations) {
            const existingTrans = await prisma.matchTranslation.findUnique({
                where: { slug: trans.slug, NOT: { matchId } }
            });

            if (existingTrans) {
                return { error: `Slug "${trans.slug}" is already taken.` };
            }

            const currentTrans = await prisma.matchTranslation.findFirst({
                where: { matchId, languageCode: trans.languageCode }
            });

            if (currentTrans) {
                await prisma.matchTranslation.update({
                    where: { id: currentTrans.id },
                    data: {
                        name: trans.name,
                        slug: trans.slug,
                        content: trans.content,
                        analysis: trans.analysis,
                        seo: {
                            update: {
                                title: trans.seo.title,
                                description: trans.seo.description,
                                canonical: trans.seo.canonical,
                                ogTitle: trans.seo.ogTitle,
                                ogDescription: trans.seo.ogDescription,
                                ogImage: trans.seo.ogImage,
                                noIndex: trans.seo.noIndex
                            }
                        }
                    }
                });
            } else {
                // Create SEO first to avoid nested write type errors
                const newSeo = await prisma.seoFields.create({
                    data: {
                        title: trans.seo.title,
                        description: trans.seo.description,
                        canonical: trans.seo.canonical,
                        noIndex: trans.seo.noIndex,
                        ogTitle: trans.seo.ogTitle,
                        ogDescription: trans.seo.ogDescription,
                        ogImage: trans.seo.ogImage,
                    }
                });

                await prisma.matchTranslation.create({
                    data: {
                        matchId,
                        languageCode: trans.languageCode,
                        name: trans.name,
                        slug: trans.slug,
                        content: trans.content,
                        analysis: trans.analysis,
                        seoId: newSeo.id
                    }
                });
            }
        }

        revalidatePath(`/admin/matches/${matchId}`);
        revalidatePath(`/en/league`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update match:", error);
        return { error: error.message || "Failed to update match" };
    }
}

export async function checkMatchSlugUniqueness(slug: string, matchId?: string) {
    const existing = await prisma.matchTranslation.findUnique({
        where: { slug }
    });

    if (existing && existing.matchId !== matchId) {
        return { isUnique: false };
    }
    return { isUnique: true };
}
