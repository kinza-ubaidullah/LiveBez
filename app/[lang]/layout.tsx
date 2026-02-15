import prisma from "@/lib/db";
import "../globals.css";
import { Inter, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getDictionary } from "@/lib/i18n";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import Navbar from "@/components/Navbar";
import { Shield } from "lucide-react";
import { Toaster } from "react-hot-toast";

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
});

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    variable: '--font-outfit',
});

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const t = getDictionary(lang);
    const isRTL = ['ar', 'fa'].includes(lang);

    // Fetch Site Settings & Visible Languages with safe fallbacks
    let settings = null;
    let languages: any[] = [];
    let topLeagues: any[] = [];
    let topBookmakers: any[] = [];

    // Safe fetch helpers to prevent layout-level crashes
    const safeFetch = async (fetcher: () => Promise<any>, fallback: any) => {
        try {
            if (!prisma) return fallback;
            const result = await fetcher();
            return result || fallback;
        } catch (e) {
            console.error("Database query failed in layout.tsx:", e);
            return fallback;
        }
    };

    settings = await safeFetch(() => prisma.siteSettings.findFirst(), null);
    languages = await safeFetch(() => prisma.language.findMany({
        where: { isVisible: true },
        orderBy: { name: 'asc' }
    }), []);
    topLeagues = await safeFetch(() => prisma.league.findMany({
        where: { isFeatured: true } as any,
        include: { translations: { where: { languageCode: lang } } },
        take: 6
    }), []);
    topBookmakers = await safeFetch(() => prisma.bookmaker.findMany({
        where: { isActive: true } as any,
        include: { translations: { where: { languageCode: lang } } },
        orderBy: { rating: 'desc' },
        take: 5
    }), []);


    const displayTitle = settings?.globalTitle || "LiveBaz | Live Scores & Predictions";
    const brandColor = settings?.globalBrandColor || "#2563eb";

    return (
        <html lang={lang} dir={isRTL ? 'rtl' : 'ltr'} className="scroll-smooth overflow-x-hidden" suppressHydrationWarning>
            <head>
                {settings?.headScripts && (
                    <script dangerouslySetInnerHTML={{ __html: settings.headScripts }} />
                )}
                <title>{displayTitle}</title>
                <meta name="description" content={settings?.globalDesc || ""} />
                <meta name="theme-color" content={brandColor} />
            </head>
            <body className={`${inter.variable} ${outfit.variable} font-inter bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-100 selection:text-blue-900`} suppressHydrationWarning>
                {settings?.bodyScripts && (
                    <script dangerouslySetInnerHTML={{ __html: settings.bodyScripts }} />
                )}
                <ThemeProvider>
                    <Toaster position="top-center" />
                    <Navbar
                        lang={lang}
                        t={t}
                        languages={languages}
                        leagues={topLeagues}
                        bookmakers={topBookmakers}
                    />

                    <main className="pt-[80px] xl:pt-[140px] min-h-screen">
                        {children}
                    </main>

                    <footer className="bg-[#0f172a] text-white pt-24 pb-12 mt-20 border-t border-white/5">
                        <div className="container mx-auto px-4 lg:px-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
                                <div className="md:col-span-5">
                                    <Link href={`/${lang}`} className="block relative h-12 w-56 mb-8 hover:scale-105 transition-transform duration-500">
                                        <Image
                                            src="/logo.png"
                                            alt={settings?.siteName || "LiveBaz"}
                                            fill
                                            className="object-contain ltr:object-left rtl:object-right brightness-0 invert"
                                        />
                                    </Link>

                                    <p className="text-slate-400 max-w-sm leading-relaxed mb-10 text-sm font-medium italic">
                                        {t.footer.tagline}
                                    </p>

                                    <div className="flex items-center gap-4">
                                        {['Facebook', 'Twitter', 'Instagram', 'Telegram'].map((social) => (
                                            <div key={social} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black hover:bg-white/10 hover:border-blue-500 transition-all cursor-pointer uppercase tracking-tighter">
                                                {social[0]}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-8 italic">Platform Explore</h4>
                                    <ul className="space-y-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        <li><Link href={`/${lang}/leagues`} className="hover:text-white transition-colors flex items-center gap-2"> {'>'} {t.footer.leagues}</Link></li>
                                        <li><Link href={`/${lang}/blog`} className="hover:text-white transition-colors flex items-center gap-2"> {'>'} {t.footer.newsAnalysis}</Link></li>
                                        <li><Link href={`/${lang}/predictions`} className="hover:text-white transition-colors flex items-center gap-2"> {'>'} {t.footer.predictions}</Link></li>
                                    </ul>
                                </div>

                                <div className="md:col-span-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-8 italic">Legal & Support</h4>
                                    <ul className="space-y-6 text-xs font-black uppercase tracking-widest text-slate-400">
                                        <li><Link href={`/${lang}/about-us`} className="hover:text-white transition-colors px-4 py-2 border border-white/5 rounded-xl block text-center italic">{t.footer.aboutUs}</Link></li>
                                        <li><Link href={`/${lang}/live-score`} className="hover:text-white transition-colors px-4 py-2 border border-white/5 rounded-xl block text-center italic">{t.footer.liveScoreGuide}</Link></li>
                                        <li><Link href={`/${lang}/privacy-policy`} className="hover:text-white transition-colors px-4 py-2 border border-white/5 rounded-xl block text-center italic">{t.footer.privacyPolicy}</Link></li>
                                        <li><Link href={`/${lang}/terms-of-service`} className="hover:text-white transition-colors px-4 py-2 border border-white/5 rounded-xl block text-center italic">{t.footer.termsOfService}</Link></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic">
                                    {t.footer.copyright}
                                </p>
                                <div className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">
                                    <Shield className="w-3 h-3" />
                                    SECURE SSL ENCRYPTED GATEWAY
                                </div>
                            </div>
                        </div>
                    </footer>
                </ThemeProvider>
            </body>
        </html>
    );
}


