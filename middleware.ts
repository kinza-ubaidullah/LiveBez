import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "ar", "fa"];
const defaultLocale = "en";

export default withAuth(
    function middleware(request: NextRequest) {
        const { pathname } = request.nextUrl;

        // 1. Skip static assets, internal files, and API routes
        if (
            pathname.startsWith("/_next") ||
            pathname.includes(".") ||
            pathname.startsWith("/api") ||
            pathname.startsWith("/admin") ||
            pathname === "/favicon.ico" ||
            pathname === "/robots.txt" ||
            pathname === "/sitemap.xml"
        ) {
            return;
        }

        // 2. Language Guardrail: Check if the current pathname has a supported locale
        // In a production environment with dynamic languages, this list would be 
        // synchronized with the database or cached in a global variable.
        const pathnameHasLocale = locales.some(
            (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
        );

        if (pathnameHasLocale) {
            // Further guardrail: If the locale exists but is "hidden" in database, 
            // you would redirect to defaultLocale here.
            return;
        }

        // 3. Redirect if there is no locale
        // We use a permanent or temporary redirect based on requirements
        const url = request.nextUrl.clone();
        url.pathname = `/${defaultLocale}${pathname}`;
        return NextResponse.redirect(url);
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;
                // Only require authentication for paths starting with /admin (excluding login)
                if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
                    return !!token;
                }
                return true;
            },
        },
        pages: {
            signIn: "/admin/login",
        },
    }
);

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};

