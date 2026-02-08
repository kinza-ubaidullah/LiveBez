"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateStaticPage(pageId: string, data: Record<string, { title: string; content: string }>) {
    try {
        const languages = await prisma.language.findMany();

        for (const lang of languages) {
            const langData = data[lang.code];
            if (!langData) continue;

            await prisma.staticPageTranslation.upsert({
                where: {
                    pageId_languageCode: {
                        pageId,
                        languageCode: lang.code
                    }
                },
                update: {
                    title: langData.title,
                    content: langData.content
                },
                create: {
                    pageId,
                    languageCode: lang.code,
                    title: langData.title,
                    content: langData.content
                }
            });
        }

        revalidatePath("/admin/pages");
        revalidatePath("/[lang]/about-us", "page");
        revalidatePath("/[lang]/privacy-policy", "page");
        revalidatePath("/[lang]/terms-of-service", "page");

        return { success: true };
    } catch (error: any) {
        console.error("Failed to update static page:", error);
        return { success: false, error: error.message };
    }
}
