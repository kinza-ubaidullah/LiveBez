"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBookmaker(data: any) {
    const { logoUrl, rating, translations } = data;

    await prisma.bookmaker.create({
        data: {
            logoUrl,
            rating: parseFloat(rating),
            translations: {
                create: translations // Array of { languageCode, name, bonusText, affiliateUrl }
            }
        }
    });

    revalidatePath('/admin/bookmakers');
    revalidatePath('/[lang]', 'layout');
}

export async function updateBookmaker(id: string, data: any) {
    const { logoUrl, rating, translations } = data;

    // Update global fields
    await prisma.bookmaker.update({
        where: { id },
        data: {
            logoUrl,
            rating: parseFloat(rating),
        }
    });

    // Update translations
    for (const trans of translations) {
        await prisma.bookmakerTranslation.upsert({
            where: {
                bookmakerId_languageCode: {
                    bookmakerId: id,
                    languageCode: trans.languageCode
                }
            },
            update: {
                name: trans.name,
                bonusText: trans.bonusText,
                affiliateUrl: trans.affiliateUrl
            },
            create: {
                bookmakerId: id,
                languageCode: trans.languageCode,
                name: trans.name,
                bonusText: trans.bonusText,
                affiliateUrl: trans.affiliateUrl
            }
        });
    }

    revalidatePath('/admin/bookmakers');
    revalidatePath('/[lang]', 'layout');
}

export async function deleteBookmaker(id: string) {
    await prisma.bookmakerTranslation.deleteMany({
        where: { bookmakerId: id }
    });
    await prisma.bookmaker.delete({
        where: { id }
    });
    revalidatePath('/admin/bookmakers');
    revalidatePath('/[lang]', 'layout');
}
