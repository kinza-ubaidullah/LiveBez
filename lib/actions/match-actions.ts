"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { generateMatchAnalysis } from "@/lib/ai-service";
import { getFullMatchDetails } from "@/lib/match-service";
import { syncAndAnalyzeMatch } from "@/lib/analysis-service";

// Use a local type if the Prisma one is stale in the IDE
export type LocalContentStatus = 'DRAFT' | 'PUBLISHED' | 'REJECTED';

export async function checkMatchSlugUniqueness(slug: string, matchId: string) {
    try {
        const existing = await prisma.matchTranslation.findFirst({
            where: {
                slug: slug,
                NOT: { matchId: matchId }
            }
        });
        return { isUnique: !existing };
    } catch (error) {
        return { isUnique: false };
    }
}

export async function updateMatchAction(
    matchId: string,
    data: {
        date: Date;
        homeScore?: number;
        awayScore?: number;
        status: string;
        lineups?: string;
        stats?: string;
        h2h?: string;
        homeTeamLogo?: string;
        awayTeamLogo?: string;
        mainTip?: string;
        confidence?: number;
        isFeatured?: boolean;
        winProbHome: number;
        winProbAway: number;
        winProbDraw: number;
        bttsProb?: number;
        overProb?: number;
        underProb?: number;
        isManual?: boolean;
        translations: {
            languageCode: string;
            name: string;
            slug: string;
            content?: string;
            analysis?: string;
            status: LocalContentStatus;
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
                h2h: data.h2h,
                homeTeamLogo: data.homeTeamLogo,
                awayTeamLogo: data.awayTeamLogo,
                mainTip: data.mainTip,
                confidence: data.confidence,
                isFeatured: data.isFeatured ?? false,
            }
        });

        // 2. Update Prediction
        await (prisma.prediction as any).upsert({
            where: { matchId: matchId },
            update: {
                winProbHome: data.winProbHome,
                winProbAway: data.winProbAway,
                winProbDraw: data.winProbDraw,
                bttsProb: data.bttsProb,
                overProb: data.overProb,
                underProb: data.underProb,
                isManual: data.isManual || false,
            },
            create: {
                matchId: matchId,
                winProbHome: data.winProbHome,
                winProbAway: data.winProbAway,
                winProbDraw: data.winProbDraw,
                bttsProb: data.bttsProb || 50,
                overProb: data.overProb || 50,
                underProb: data.underProb || 50,
                isManual: data.isManual || false,
            }
        });

        // 3. Handle Translations & SEO
        for (const trans of data.translations) {
            // Check for slug uniqueness (excluding current)
            const existingTrans = await prisma.matchTranslation.findFirst({
                where: {
                    slug: trans.slug,
                    NOT: { matchId: matchId }
                }
            });

            if (existingTrans) {
                return { error: `Slug "${trans.slug}" is already taken.` };
            }

            const currentTrans = await prisma.matchTranslation.findFirst({
                where: {
                    matchId: matchId,
                    languageCode: trans.languageCode
                }
            });

            if (currentTrans) {
                await (prisma.matchTranslation as any).update({
                    where: { id: currentTrans.id },
                    data: {
                        name: trans.name,
                        slug: trans.slug,
                        content: trans.content,
                        analysis: trans.analysis,
                        status: trans.status as any,
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
                // Create SEO first
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

                await (prisma.matchTranslation as any).create({
                    data: {
                        matchId: matchId,
                        languageCode: trans.languageCode,
                        name: trans.name,
                        slug: trans.slug,
                        content: trans.content,
                        analysis: trans.analysis,
                        status: trans.status as any,
                        seoId: newSeo.id
                    }
                });
            }
        }

        revalidatePath(`/admin/matches/${matchId}`);
        revalidatePath('/[lang]', 'layout');
        return { success: true, id: matchId };
    } catch (error: any) {
        console.error("Match update failed:", error);
        return { error: error.message || "Failed to update match" };
    }
}

export async function createMatchAction(
    data: {
        homeTeam: string;
        awayTeam: string;
        leagueId: string;
        date: Date;
        homeScore?: number;
        awayScore?: number;
        status: string;
        lineups?: string;
        stats?: string;
        h2h?: string;
        homeTeamLogo?: string;
        awayTeamLogo?: string;
        mainTip?: string;
        confidence?: number;
        isFeatured?: boolean;
        winProbHome: number;
        winProbAway: number;
        winProbDraw: number;
        bttsProb?: number;
        overProb?: number;
        underProb?: number;
        isManual?: boolean;
        translations: {
            languageCode: string;
            name: string;
            slug: string;
            content?: string;
            analysis?: string;
            status: LocalContentStatus;
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
        // 1. Create Match model
        const match = await prisma.match.create({
            data: {
                homeTeam: data.homeTeam,
                awayTeam: data.awayTeam,
                leagueId: data.leagueId,
                date: data.date,
                homeScore: data.homeScore,
                awayScore: data.awayScore,
                status: data.status,
                lineups: data.lineups,
                stats: data.stats,
                h2h: data.h2h,
                homeTeamLogo: data.homeTeamLogo,
                awayTeamLogo: data.awayTeamLogo,
                mainTip: data.mainTip,
                confidence: data.confidence,
                isFeatured: data.isFeatured ?? false,
            }
        });

        // 2. Create Prediction
        await (prisma.prediction as any).create({
            data: {
                matchId: match.id,
                winProbHome: data.winProbHome,
                winProbAway: data.winProbAway,
                winProbDraw: data.winProbDraw,
                bttsProb: data.bttsProb || 50,
                overProb: data.overProb || 50,
                underProb: data.underProb || 50,
                isManual: data.isManual || false,
            }
        });

        // 3. Handle Translations & SEO
        for (const trans of data.translations) {
            // Check for slug uniqueness
            const existingTrans = await prisma.matchTranslation.findFirst({
                where: { slug: trans.slug }
            });

            if (existingTrans) {
                return { error: `Slug "${trans.slug}" is already taken.` };
            }

            // Create SEO
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

            await (prisma.matchTranslation as any).create({
                data: {
                    matchId: match.id,
                    languageCode: trans.languageCode,
                    name: trans.name,
                    slug: trans.slug,
                    content: trans.content,
                    analysis: trans.analysis,
                    status: trans.status as any,
                    seoId: newSeo.id
                }
            });
        }

        revalidatePath('/admin/matches');
        revalidatePath('/[lang]', 'layout');
        return { success: true, id: match.id };
    } catch (error: any) {
        console.error("Match creation failed:", error);
        return { error: error.message || "Failed to create match" };
    }
}


export async function generateAIAnalysisAction(matchId: string, lang: string) {
    return await syncAndAnalyzeMatch(matchId, lang, true); // true for force update when triggered manually
}

export async function updateAnalysisStatusAction(matchId: string, lang: string, status: string) {
    try {
        await (prisma.matchTranslation as any).update({
            where: { matchId_languageCode: { matchId, languageCode: lang } },
            data: { status: status as any }
        });
        revalidatePath(`/admin/matches/${matchId}`);
        revalidatePath(`/[lang]/league`, 'layout');
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Status update failed" };
    }
}
