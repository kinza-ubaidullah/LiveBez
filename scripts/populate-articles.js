const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('--- Syncing Existing Analyses to Articles ---');

    try {
        // 1. Ensure Category
        let category = await prisma.articleCategory.findUnique({ where: { key: 'predictions' } });
        if (!category) {
            category = await prisma.articleCategory.create({
                data: {
                    key: 'predictions'
                }
            });
            console.log('✔ Created Predictions Category');
        }

        // Ensure category translations
        const langCodes = ['en', 'ar', 'fa'];
        for (const code of langCodes) {
            const name = code === 'en' ? 'Match Previews' : code === 'ar' ? 'أخبار وتوقعات' : 'تحلیل مسابقات';
            const slug = `cat-predictions-${code}`;
            const existing = await prisma.articleCategoryTranslation.findUnique({
                where: { categoryId_languageCode: { categoryId: category.id, languageCode: code } }
            });
            if (!existing) {
                const seo = await prisma.seoFields.create({ data: { title: name, description: name } });
                await prisma.articleCategoryTranslation.create({
                    data: { categoryId: category.id, languageCode: code, name, slug, seoId: seo.id }
                });
            }
        }

        // 2. Fetch matches with published analysis
        const analyses = await prisma.matchTranslation.findMany({
            where: {
                status: 'PUBLISHED',
                analysis: { not: null, not: '' }
            },
            include: {
                match: true
            },
            take: 20 // Let's do 20 for now to avoid overload
        });

        console.log(`Found ${analyses.length} match analyses to turn into articles.`);

        for (const mt of analyses) {
            const match = mt.match;
            if (!match) continue;

            // Link to Article
            let article = await prisma.article.findFirst({ where: { matchId: match.id } });
            if (!article) {
                article = await prisma.article.create({
                    data: {
                        matchId: match.id,
                        categoryId: category.id,
                        published: true,
                        isFeatured: match.isFeatured,
                        featuredImage: match.homeTeamLogo
                    }
                });
            }

            const artTitle = `${match.homeTeam} vs ${match.awayTeam} ${mt.languageCode === 'en' ? 'Prediction' : 'پیش‌بینی'}`;
            const artSlug = `analysis-${match.homeTeam.toLowerCase().replace(/\s+/g, '-')}-vs-${match.awayTeam.toLowerCase().replace(/\s+/g, '-')}-${mt.languageCode}`;

            const existingArtTrans = await prisma.articleTranslation.findUnique({
                where: { articleId_languageCode: { articleId: article.id, languageCode: mt.languageCode } }
            });

            if (!existingArtTrans) {
                const seo = await prisma.seoFields.create({
                    data: { title: artTitle, description: artTitle }
                });
                await prisma.articleTranslation.create({
                    data: {
                        articleId: article.id,
                        languageCode: mt.languageCode,
                        title: artTitle,
                        content: mt.analysis,
                        slug: artSlug,
                        seoId: seo.id,
                        excerpt: `${match.homeTeam} vs ${match.awayTeam} expert analysis.`
                    }
                });
                console.log(`+ Created article for ${match.homeTeam} vs ${match.awayTeam} (${mt.languageCode})`);
            }
        }

    } catch (err) {
        console.error('ERROR:', err);
    }

    console.log('--- Done ---');
}

main().finally(() => prisma.$disconnect());
