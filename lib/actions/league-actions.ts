"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function checkSlugUniqueness(slug: string, leagueId: string) {
    try {
        const existing = await prisma.leagueTranslation.findFirst({
            where: {
                slug: slug,
                NOT: { leagueId: leagueId }
            }
        });
        return { isUnique: !existing };
    } catch (error) {
        return { isUnique: false };
    }
}

export async function toggleLeagueFeatured(leagueId: string, isFeatured: boolean) {
    try {
        await (prisma.league as any).update({
            where: { id: leagueId },
            data: { isFeatured }
        });
        revalidatePath('/admin/leagues');
        revalidatePath('/[lang]', 'layout');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

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
            isActive: boolean;
            seo: {
                title?: string;
                description?: string;
                h1?: string;
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
        await prisma.league.update({
            where: { id: leagueId },
            data: {
                country: data.country,
                logoUrl: data.logoUrl,
            }
        });

        for (const trans of data.translations) {
            const currentTrans = await prisma.leagueTranslation.findUnique({
                where: { leagueId_languageCode: { leagueId, languageCode: trans.languageCode } }
            });

            if (currentTrans) {
                await prisma.leagueTranslation.update({
                    where: { id: currentTrans.id },
                    data: {
                        name: trans.name,
                        slug: trans.slug,
                        description: trans.description,
                        isActive: trans.isActive,
                        seo: {
                            update: {
                                title: trans.seo.title,
                                description: trans.seo.description,
                                h1: trans.seo.h1,
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
                // Create SEO first to avoid nested relation type errors
                const newSeo = await prisma.seoFields.create({
                    data: {
                        title: trans.seo.title,
                        description: trans.seo.description,
                        h1: trans.seo.h1,
                        canonical: trans.seo.canonical,
                        ogTitle: trans.seo.ogTitle,
                        ogDescription: trans.seo.ogDescription,
                        ogImage: trans.seo.ogImage,
                        noIndex: trans.seo.noIndex,
                    }
                });

                await (prisma.leagueTranslation as any).create({
                    data: {
                        leagueId,
                        languageCode: trans.languageCode,
                        name: trans.name,
                        slug: trans.slug,
                        description: trans.description,
                        isActive: trans.isActive,
                        seoId: newSeo.id
                    }
                });
            }
        }

        revalidatePath('/admin/leagues');
        revalidatePath('/[lang]', 'layout');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
