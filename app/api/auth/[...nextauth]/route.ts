import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // First try to find regular user
                const user = await (prisma as any).appUser.findUnique({
                    where: { email: credentials.email }
                });

                if (user) {
                    if (!user.isVerified) {
                        throw new Error("PLEASE_VERIFY");
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (isValid) {
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: "USER",
                        };
                    }
                }

                // If not found or invalid, try admin user
                const admin = await prisma.adminUser.findUnique({
                    where: { email: credentials.email }
                });

                if (admin) {
                    const isValid = await bcrypt.compare(credentials.password, admin.password);
                    if (isValid) {
                        return {
                            id: admin.id,
                            email: admin.email,
                            name: admin.name,
                            role: admin.role,
                        };
                    }
                }

                return null;
            }
        })
    ],
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session.user) {
                session.user.role = token.role;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt" as const,
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
