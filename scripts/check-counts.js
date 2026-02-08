const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function count() {
    const matches = await prisma.match.count();
    const leagues = await prisma.league.count();
    const articles = await prisma.article.count();
    console.log(`Matches: ${matches}, Leagues: ${leagues}, Articles: ${articles}`);
}
count().finally(() => prisma.$disconnect());
