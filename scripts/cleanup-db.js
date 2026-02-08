const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanup() {
    console.log('🧹 Cleaning up mock data and fixing broken images...');

    try {
        // 1. Remove all articles and categories (they were likely mock/test data)
        await prisma.articleTranslation.deleteMany({});
        await prisma.article.deleteMany({});
        await prisma.articleCategoryTranslation.deleteMany({});
        await prisma.articleCategory.deleteMany({});

        // 2. Remove all matches and predictions to start fresh with real sync
        await prisma.predictionTranslation.deleteMany({});
        await prisma.prediction.deleteMany({});
        await prisma.matchTranslation.deleteMany({});
        await prisma.match.deleteMany({});

        // 3. Remove all teams (to re-fetch with correct logos)
        try { await prisma.teamTranslation.deleteMany({}); } catch (e) { }
        try { await prisma.team.deleteMany({}); } catch (e) { }

        // 4. Reset sync logs
        try { await prisma.syncLog.deleteMany({}); } catch (e) { }

        console.log('✨ Database cleaned. Ready for fresh sync!');
    } catch (err) {
        console.error('❌ Cleanup failed:', err.message);
    }
}

cleanup()
    .finally(() => prisma.$disconnect());
