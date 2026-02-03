"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateSiteSettings(data: any) {
    try {
        const settings = await prisma.siteSettings.findFirst();

        if (settings) {
            await prisma.siteSettings.update({
                where: { id: settings.id },
                data: {
                    siteName: data.siteName,
                    globalTitle: data.globalTitle,
                    globalDesc: data.globalDesc,
                    globalBrandColor: data.brandColor,
                    headScripts: data.headScripts,
                    bodyScripts: data.bodyScripts,
                }
            });
        } else {
            await prisma.siteSettings.create({
                data: {
                    siteName: data.siteName,
                    globalTitle: data.globalTitle,
                    globalDesc: data.globalDesc,
                    globalBrandColor: data.brandColor,
                    headScripts: data.headScripts,
                    bodyScripts: data.bodyScripts,
                }
            });
        }

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error("Settings Update Error:", error);
        return { success: false, error: error.message };
    }
}
