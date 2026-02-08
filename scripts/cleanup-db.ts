import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    console.log('🧹 Cleaning up mock data and fixing broken images...');

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
    await (prisma as any).teamTranslation?.deleteMany({});
    await (prisma as any).team?.deleteMany({});

    // 4. Reset sync logs
    await (prisma as any).syncLog?.deleteMany({});

    console.log('✨ Database cleaned. Ready for fresh sync!');
}

cleanup()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
