"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function registerUser(data: any) {
    try {
        const { name, email, password } = data;

        // Check if user exists
        const existingUser = await (prisma as any).appUser.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { success: false, error: "User already exists with this email" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await (prisma as any).appUser.create({
            data: {
                name,
                email,
                password: hashedPassword,
                verificationCode,
                verificationExpiry: expiry,
                isVerified: false,
            }
        });

        // TODO: Send Email Logic Here
        console.log(`VERIFICATION CODE FOR ${email}: ${verificationCode}`);

        // If you have Resend or Nodemailer configured:
        /*
        await sendVerificationEmail(email, name, verificationCode);
        */

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function verifyEmailCode(email: string, code: string) {
    try {
        const user = await (prisma as any).appUser.findUnique({
            where: { email }
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        if (user.verificationCode !== code) {
            return { success: false, error: "Invalid verification code" };
        }

        if (user.verificationExpiry && user.verificationExpiry < new Date()) {
            return { success: false, error: "Verification code expired" };
        }

        await (prisma as any).appUser.update({
            where: { email },
            data: {
                isVerified: true,
                emailVerified: new Date(),
                verificationCode: null,
                verificationExpiry: null
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Verification error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function loginUser(data: any) {
    // This is handled by NextAuth usually, but you can add custom logic here if needed
}
