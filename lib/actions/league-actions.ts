"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateLeagueAction(
    leagueId: string,
    data: {
        country: string;
        logoUrl?: string;
        translations: {

            languageCode: string;
            name: string;
            slug: string;
            description?: string;
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
        // 1. Update League model
        await prisma.league.update({
            where: { id: leagueId },
            data: {
                country: data.country,
                logoUrl: data.logoUrl
            }

        });


        // 2. Loop through and update/upsert translations
        for (const trans of data.translations) {
            // Find existing translation to get seoId
            const existingTrans = await prisma.leagueTranslation.findUnique({
                where: { slug: trans.slug, NOT: { leagueId } } // Check if slug is taken by another league
            });

            if (existingTrans) {
                return { error: `Slug "${trans.slug}" is already taken.` };
            }

            const currentTrans = await prisma.leagueTranslation.findFirst({
                where: { leagueId, languageCode: trans.languageCode }
            });

            if (currentTrans) {
                // Update Translation and SEO
                await prisma.leagueTranslation.update({
                    where: { id: currentTrans.id },
                    data: {
                        name: trans.name,
                        slug: trans.slug,
                        description: trans.description,
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
                // Create New Translation
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

                await prisma.leagueTranslation.create({
                    data: {
                        leagueId,
                        languageCode: trans.languageCode,
                        name: trans.name,
                        slug: trans.slug,
                        description: trans.description,
                        seoId: newSeo.id
                    }
                });
            }
        }

        revalidatePath(`/admin/leagues/${leagueId}`);
        revalidatePath(`/en/league`); // Adjust based on paths
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update league:", error);
        return { error: error.message || "Failed to update league" };
    }
}

export async function checkSlugUniqueness(slug: string, leagueId?: string) {
    const existing = await prisma.leagueTranslation.findUnique({
        where: { slug }
    });

    if (existing && existing.leagueId !== leagueId) {
        return { isUnique: false };
    }
    return { isUnique: true };
}
