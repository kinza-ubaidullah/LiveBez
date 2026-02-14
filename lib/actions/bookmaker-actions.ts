"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateBookmakerAction(
    id: string | null,
    data: {
        logoUrl?: string;
        rating: number;
        isDoFollow: boolean;
        isActive: boolean;
        translations: {
            languageCode: string;
            name: string;
            slug: string;
            bonusText: string;
            sampleOdds?: string | null;
            description?: string | null;
            affiliateUrl: string;
            seo: {
                title?: string;
                description?: string;
                canonical?: string;
            };
        }[];
    }
) {
    try {
        let bookmakerId = id;

        if (bookmakerId) {
            // Update
            await prisma.bookmaker.update({
                where: { id: bookmakerId },
                data: {
                    logoUrl: data.logoUrl,
                    rating: data.rating,
                    isDoFollow: data.isDoFollow,
                    isActive: data.isActive
                }
            });
        } else {
            // Create
            const newBm = await prisma.bookmaker.create({
                data: {
                    logoUrl: data.logoUrl,
                    rating: data.rating,
                    isDoFollow: data.isDoFollow,
                    isActive: data.isActive
                }
            });
            bookmakerId = newBm.id;
        }

        // Handle Translations
        for (const trans of data.translations) {
            const currentTrans = await prisma.bookmakerTranslation.findFirst({
                where: { bookmakerId: bookmakerId as string, languageCode: trans.languageCode }
            });

            if (currentTrans) {
                await (prisma.bookmakerTranslation as any).update({
                    where: { id: currentTrans.id },
                    data: {
                        name: trans.name,
                        slug: trans.slug,
                        bonusText: trans.bonusText,
                        sampleOdds: trans.sampleOdds,
                        description: trans.description,
                        affiliateUrl: trans.affiliateUrl,
                        seo: {
                            update: {
                                title: trans.seo.title,
                                description: trans.seo.description,
                                canonical: trans.seo.canonical
                            }
                        }
                    }
                });
            } else {
                const newSeo = await prisma.seoFields.create({
                    data: {
                        title: trans.seo.title,
                        description: trans.seo.description,
                        canonical: trans.seo.canonical
                    }
                });

                await (prisma.bookmakerTranslation as any).create({
                    data: {
                        bookmakerId: bookmakerId as string,
                        languageCode: trans.languageCode,
                        name: trans.name,
                        slug: trans.slug,
                        bonusText: trans.bonusText,
                        sampleOdds: trans.sampleOdds,
                        description: trans.description,
                        affiliateUrl: trans.affiliateUrl,
                        seoId: newSeo.id
                    }
                });
            }
        }

        revalidatePath("/admin/bookmakers");
        revalidatePath("/[lang]/bookmakers", "page");
        return { success: true };
    } catch (error: any) {
        console.error("Bookmaker update failed:", error);
        return { error: error.message || "Operation failed" };
    }
}

export async function deleteBookmakerAction(id: string) {
    try {
        await prisma.bookmakerTranslation.deleteMany({ where: { bookmakerId: id } });
        await prisma.bookmaker.delete({ where: { id } });
        revalidatePath("/admin/bookmakers");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Delete failed" };
    }
}
