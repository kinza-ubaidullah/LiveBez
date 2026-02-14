"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleLanguageVisibility(code: string, isVisible: boolean) {
    try {
        await prisma.language.update({
            where: { code },
            data: { isVisible }
        });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createLanguage(data: { name: string; code: string; isVisible?: boolean }) {
    try {
        const existing = await prisma.language.findUnique({
            where: { code: data.code }
        });

        if (existing) {
            return { success: false, error: "Language code already exists" };
        }

        await prisma.language.create({
            data: {
                name: data.name,
                code: data.code,
                isVisible: data.isVisible ?? false
            }
        });

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateLanguage(code: string, data: { name: string }) {
    try {
        await prisma.language.update({
            where: { code },
            data: { name: data.name }
        });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
