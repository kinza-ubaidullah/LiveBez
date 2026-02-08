const { PrismaClient } = require('@prisma/client');
const { generateMatchAnalysis } = require('../lib/ai-service');
const { getFullMatchDetails } = require('../lib/match-service');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Force Analyzing Matches (JS) ---');
    const matches = await prisma.match.findMany({
        take: 3,
        orderBy: { date: 'desc' },
        include: {
            league: { include: { translations: { where: { languageCode: 'en' } } } },
            prediction: true,
            translations: { where: { languageCode: 'en' } }
        }
    });

    console.log(`Analyzing ${matches.length} matches...`);

    for (const match of matches) {
        console.log(`- Analyzing: ${match.homeTeam} vs ${match.awayTeam}`);
        try {
            const fullDetails = await getFullMatchDetails(match.id, match.apiSportsId);
            const safeJsonParse = (str) => {
                if (!str) return null;
                try { return JSON.parse(str); } catch (e) { return null; }
            };

            const analysis = await generateMatchAnalysis({
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                league: match.league.translations[0]?.name || match.league.country,
                stats: safeJsonParse(fullDetails?.stats || null),
                h2h: safeJsonParse(fullDetails?.h2h || null),
                prediction: match.prediction,
                currentScore: `${match.homeScore}-${match.awayScore}`,
                lang: 'en'
            });

            console.log(`  ✔ AI Analysis generated (Length: ${analysis.length})`);

            // Update Match Translation
            await prisma.matchTranslation.upsert({
                where: { matchId_languageCode: { matchId: match.id, languageCode: 'en' } },
                update: { analysis, status: 'PUBLISHED' },
                create: {
                    matchId: match.id,
                    languageCode: 'en',
                    name: `${match.homeTeam} vs ${match.awayTeam}`,
                    slug: `analysis-${match.homeTeam}-${match.awayTeam}-${Date.now()}`.toLowerCase().replace(/ /g, '-'),
                    analysis,
                    status: 'PUBLISHED',
                    seo: { create: { title: `${match.homeTeam} vs ${match.awayTeam}` } }
                }
            });

            // Sync to Articles
            let category = await prisma.articleCategory.findUnique({ where: { key: 'predictions' } });
            if (!category) {
                category = await prisma.articleCategory.create({ data: { key: 'predictions' } });
            }

            let article = await prisma.article.findFirst({ where: { matchId: match.id } });
            if (!article) {
                article = await prisma.article.create({
                    data: {
                        matchId: match.id,
                        categoryId: category.id,
                        published: true,
                        isFeatured: true,
                        featuredImage: match.homeTeamLogo
                    }
                });
            }

            const artTitle = `${match.homeTeam} vs ${match.awayTeam} Prediction`;
            const artSlug = `article-${match.homeTeam}-${match.awayTeam}-${Date.now()}`.toLowerCase().replace(/ /g, '-');

            await prisma.articleTranslation.upsert({
                where: { articleId_languageCode: { articleId: article.id, languageCode: 'en' } },
                update: { title: artTitle, content: analysis, slug: artSlug },
                create: {
                    articleId: article.id,
                    languageCode: 'en',
                    title: artTitle,
                    content: analysis,
                    slug: artSlug,
                    seo: { create: { title: artTitle } },
                    excerpt: `${match.homeTeam} vs ${match.awayTeam} expert tips.`
                }
            });

            console.log('  ✔ Linked to Article');
        } catch (err) {
            console.error(`  ❌ Failed:`, err);
        }
    }
    console.log('--- Done ---');
}

main().finally(() => prisma.$disconnect());
