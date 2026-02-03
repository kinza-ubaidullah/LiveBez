"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createLeagueAction(data: any) {
    try {
        const league = await prisma.league.create({
            data: {
                country: data.country,
                logoUrl: data.logoUrl,
                translations: {
                    create: data.translations.map((t: any) => ({
                        languageCode: t.languageCode,
                        name: t.name,
                        slug: t.slug,
                        description: t.description,
                        seo: {
                            create: {
                                title: t.seo.title,
                                description: t.seo.description,
                                h1: t.seo.h1,
                                canonical: t.seo.canonical,
                                ogTitle: t.seo.ogTitle,
                                ogDescription: t.seo.ogDescription,
                                ogImage: t.seo.ogImage,
                                noIndex: t.seo.noIndex,
                            }
                        }
                    }))
                }
            }
        });

        revalidatePath('/admin/leagues');
        return { success: true, id: league.id };
    } catch (error: any) {
        console.error("League Create Error:", error);
        return { success: false, error: error.message };
    }
}
