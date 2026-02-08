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
            bonusText: string;
            affiliateUrl: string;
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
            await prisma.bookmakerTranslation.upsert({
                where: { bookmakerId_languageCode: { bookmakerId: bookmakerId as string, languageCode: trans.languageCode } },
                update: {
                    name: trans.name,
                    bonusText: trans.bonusText,
                    affiliateUrl: trans.affiliateUrl
                },
                create: {
                    bookmakerId: bookmakerId as string,
                    languageCode: trans.languageCode,
                    name: trans.name,
                    bonusText: trans.bonusText,
                    affiliateUrl: trans.affiliateUrl
                }
            });
        }

        revalidatePath("/admin/bookmakers");
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
