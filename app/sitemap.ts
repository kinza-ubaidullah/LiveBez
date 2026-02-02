import { MetadataRoute } from 'next';
import prisma from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sports-platform.vercel.app';

    try {
        const [leagues, matches, articles, languages] = await Promise.all([
            prisma.leagueTranslation.findMany({
                select: {
                    slug: true,
                    languageCode: true,
                    league: { select: { updatedAt: true } }
                }
            }),
            prisma.matchTranslation.findMany({
                select: {
                    slug: true,
                    languageCode: true,
                    match: { select: { updatedAt: true, league: { select: { translations: { where: { languageCode: 'en' }, select: { slug: true } } } } } }
                }
            }),
            prisma.articleTranslation.findMany({ select: { slug: true, languageCode: true, article: { select: { updatedAt: true } } } }),
            prisma.language.findMany({ where: { isVisible: true }, select: { code: true } })
        ]);

        const sitemapEntries: MetadataRoute.Sitemap = [];

        // Static pages for each language
        languages.forEach(lang => {
            sitemapEntries.push({
                url: `${baseUrl}/${lang.code}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            });
            sitemapEntries.push({
                url: `${baseUrl}/${lang.code}/blog`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.8,
            });
        });

        // League pages
        leagues.forEach(l => {
            sitemapEntries.push({
                url: `${baseUrl}/${l.languageCode}/league/${l.slug}`,
                lastModified: l.league?.updatedAt || new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        });

        // Match pages
        matches.forEach(m => {
            const leagueSlug = m.match?.league?.translations?.[0]?.slug || 'top-league';
            sitemapEntries.push({
                url: `${baseUrl}/${m.languageCode}/league/${leagueSlug}/${m.slug}`,
                lastModified: m.match?.updatedAt || new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            });
        });

        // Article pages
        articles.forEach(a => {
            sitemapEntries.push({
                url: `${baseUrl}/${a.languageCode}/blog/${a.slug}`,
                lastModified: a.article?.updatedAt || new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            });
        });

        return sitemapEntries;
    } catch (error) {
        console.error("Sitemap generation failed due to DB error:", error);
        // Return minimal sitemap to ensure build success
        return [{
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        }];
    }
}
