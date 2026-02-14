"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateStaticPage(pageId: string, data: Record<string, { title: string; content: string; seoTitle?: string; seoDescription?: string }>) {
    try {
        const languages = await prisma.language.findMany();

        for (const lang of languages) {
            const langData = data[lang.code];
            if (!langData) continue;

            const existingTrans = await prisma.staticPageTranslation.findUnique({
                where: {
                    pageId_languageCode: {
                        pageId,
                        languageCode: lang.code
                    }
                }
            });

            if (existingTrans) {
                // Update SEO
                if (existingTrans.seoId) {
                    await prisma.seoFields.update({
                        where: { id: existingTrans.seoId },
                        data: {
                            title: langData.seoTitle || langData.title,
                            description: langData.seoDescription || langData.content.substring(0, 160)
                        }
                    });
                } else {
                    const newSeo = await prisma.seoFields.create({
                        data: {
                            title: langData.seoTitle || langData.title,
                            description: langData.seoDescription || langData.content.substring(0, 160)
                        }
                    });
                    await prisma.staticPageTranslation.update({
                        where: { id: existingTrans.id },
                        data: { seoId: newSeo.id }
                    });
                }

                await prisma.staticPageTranslation.update({
                    where: { id: existingTrans.id },
                    data: {
                        title: langData.title,
                        content: langData.content
                    }
                });
            } else {
                // Create SEO first
                const newSeo = await prisma.seoFields.create({
                    data: {
                        title: langData.seoTitle || langData.title,
                        description: langData.seoDescription || langData.content.substring(0, 160),
                    }
                });

                await prisma.staticPageTranslation.create({
                    data: {
                        pageId,
                        languageCode: lang.code,
                        title: langData.title,
                        content: langData.content,
                        seoId: newSeo.id
                    }
                });
            }
        }

        revalidatePath("/admin/pages");
        revalidatePath("/[lang]", "layout");
        revalidatePath("/[lang]/about-us", "page");
        revalidatePath("/[lang]/privacy-policy", "page");
        revalidatePath("/[lang]/terms-of-service", "page");

        return { success: true };
    } catch (error: any) {
        console.error("Failed to update static page:", error);
        return { success: false, error: error.message };
    }
}

