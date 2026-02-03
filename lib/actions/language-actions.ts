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
