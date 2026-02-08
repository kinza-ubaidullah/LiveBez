"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateTeamAction(
    teamId: string,
    data: {
        country?: string;
        logoUrl?: string;
        translations: {
            languageCode: string;
            name: string;
            slug: string;
            description?: string | null;
            seo: {
                title?: string | null;
                description?: string | null;
                h1?: string | null;
                canonical?: string | null;
                ogTitle?: string | null;
                ogDescription?: string | null;
                ogImage?: string | null;
                noIndex: boolean;
            };
        }[];
    }
) {
    try {
        // 1. Update Team core
        await prisma.team.update({
            where: { id: teamId },
            data: {
                country: data.country,
                logoUrl: data.logoUrl
            }
        });

        // 2. Process translations
        for (const trans of data.translations) {
            const currentTrans = await prisma.teamTranslation.findFirst({
                where: { teamId, languageCode: trans.languageCode }
            });

            if (currentTrans) {
                await prisma.teamTranslation.update({
                    where: { id: currentTrans.id },
                    data: {
                        name: trans.name,
                        slug: trans.slug,
                        description: trans.description,
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
                const newSeo = await prisma.seoFields.create({
                    data: {
                        title: trans.seo.title,
                        description: trans.seo.description,
                        h1: trans.seo.h1,
                        canonical: trans.seo.canonical,
                        noIndex: trans.seo.noIndex,
                        ogTitle: trans.seo.ogTitle,
                        ogDescription: trans.seo.ogDescription,
                        ogImage: trans.seo.ogImage,
                    }
                });

                await prisma.teamTranslation.create({
                    data: {
                        teamId,
                        languageCode: trans.languageCode,
                        name: trans.name,
                        slug: trans.slug,
                        description: trans.description,
                        seoId: newSeo.id
                    }
                });
            }
        }

        revalidatePath(`/admin/teams`);
        revalidatePath(`/admin/teams/${teamId}`);
        revalidatePath(`/[lang]/team`, 'layout');
        return { success: true };
    } catch (error: any) {
        console.error("Team update failed:", error);
        return { error: error.message || "Failed to update team" };
    }
}

export async function checkTeamSlugUniqueness(slug: string, teamId?: string) {
    const existing = await prisma.teamTranslation.findUnique({
        where: { slug }
    });

    if (existing && existing.teamId !== teamId) {
        return { isUnique: false };
    }
    return { isUnique: true };
}
