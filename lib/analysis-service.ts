import prisma from "@/lib/db";
import { generateMatchAnalysis } from "@/lib/ai-service";
import { getFullMatchDetails } from "@/lib/match-service";
import { revalidatePath } from "next/cache";

export async function syncAndAnalyzeMatch(matchId: string, lang: string, forceUpdate: boolean = false) {
    try {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
                league: { include: { translations: { where: { languageCode: lang } } } },
                prediction: true,
                translations: { where: { languageCode: lang } }
            }
        });

        if (!match) return { success: false, error: "Match not found" };
        if (!match.apiSportsId) return { success: false, error: "No API ID" };

        const existingTrans = match.translations[0];

        // If analysis already exists and not forcing update, skip
        if (existingTrans?.analysis && !forceUpdate) {
            return { success: true, message: "Analysis exists" };
        }

        // Fetch fresh stats/h2h
        const fullDetails = await getFullMatchDetails(matchId, match.apiSportsId);

        const safeJsonParse = (str: string | null) => {
            if (!str) return null;
            try { return JSON.parse(str); } catch (e) { return null; }
        };

        const analysis = await generateMatchAnalysis({
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            league: match.league.translations[0]?.name || match.league.country,
            stats: safeJsonParse(fullDetails?.stats || null),
            h2h: safeJsonParse((fullDetails as any)?.h2h || null),
            prediction: match.prediction,
            currentScore: `${match.homeScore}-${match.awayScore}`,
            lang
        });

        const status = existingTrans?.status || (match.isFeatured ? 'PUBLISHED' : 'DRAFT');

        const seo = await prisma.seoFields.create({
            data: {
                title: `${match.homeTeam} vs ${match.awayTeam} Prediction & Analysis`,
                description: `Get the latest ${match.homeTeam} vs ${match.awayTeam} prediction and tactical analysis.`,
            }
        });

        await (prisma.matchTranslation as any).upsert({
            where: { matchId_languageCode: { matchId, languageCode: lang } },
            update: {
                analysis,
                status: status as any
            },
            create: {
                match: { connect: { id: matchId } },
                language: { connect: { code: lang } },
                name: `${match.homeTeam} vs ${match.awayTeam}`,
                slug: `${match.homeTeam.toLowerCase().replace(/\s+/g, '-')}-vs-${match.awayTeam.toLowerCase().replace(/\s+/g, '-')}-${lang}`,
                analysis,
                status: status as any,
                seo: {
                    connect: { id: seo.id }
                }
            }
        });

        revalidatePath(`/admin/matches/${matchId}`);
        revalidatePath(`/[lang]/predictions`, 'page');
        revalidatePath(`/[lang]/blog`, 'page');

        // --- NEW: Sync with Articles table ---
        try {
            let category = await prisma.articleCategory.findUnique({ where: { key: 'predictions' } });
            if (!category) {
                category = await prisma.articleCategory.create({ data: { key: 'predictions' } });

                const catData = [
                    { lang: 'en', name: 'Match Previews' },
                    { lang: 'ar', name: 'توقعات المباريات' },
                    { lang: 'fa', name: 'پیش‌بینی مسابقات' },
                ];

                for (const cd of catData) {
                    const seo = await prisma.seoFields.create({ data: { title: cd.name } });
                    await prisma.articleCategoryTranslation.create({
                        data: {
                            categoryId: category.id,
                            languageCode: cd.lang,
                            name: cd.name,
                            slug: `match-previews-${cd.lang}`,
                            seoId: seo.id
                        }
                    });
                }
            }

            let article = await prisma.article.findFirst({ where: { matchId: matchId } });
            const isPublished = status === 'PUBLISHED';

            if (!article) {
                article = await prisma.article.create({
                    data: {
                        matchId: matchId,
                        categoryId: category.id,
                        published: isPublished,
                        isFeatured: match.isFeatured,
                        featuredImage: match.homeTeamLogo
                    }
                });
            } else {
                await prisma.article.update({
                    where: { id: article.id },
                    data: { published: isPublished, isFeatured: match.isFeatured }
                });
            }

            const artTitle = `${match.homeTeam} vs ${match.awayTeam} ${lang === 'en' ? 'Prediction' : 'پیش‌بینی'}`;
            const artSlug = `analysis-${match.homeTeam.toLowerCase().replace(/\s+/g, '-')}-vs-${match.awayTeam.toLowerCase().replace(/\s+/g, '-')}-${lang}`;

            const existingArtTrans = await prisma.articleTranslation.findUnique({
                where: { articleId_languageCode: { articleId: article.id, languageCode: lang } }
            });

            if (existingArtTrans) {
                await prisma.articleTranslation.update({
                    where: { id: existingArtTrans.id },
                    data: { title: artTitle, content: analysis, slug: artSlug }
                });
            } else {
                const seo = await prisma.seoFields.create({
                    data: { title: artTitle, description: artTitle }
                });
                await prisma.articleTranslation.create({
                    data: {
                        article: { connect: { id: article.id } },
                        language: { connect: { code: lang } },
                        title: artTitle,
                        content: analysis,
                        slug: artSlug,
                        seo: { connect: { id: seo.id } },
                        excerpt: `${match.homeTeam} vs ${match.awayTeam} expert match analysis and betting tips.`
                    }
                });
            }
        } catch (artErr) {
            console.error("Failed to link match to Article:", artErr);
        }
        // --- END Sync ---

        return { success: true, analysis };
    } catch (error: any) {
        console.error("Auto Analysis failed:", error);
        return { success: false, error: error.message };
    }
}
