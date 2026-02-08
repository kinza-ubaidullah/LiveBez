const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const articles = await prisma.article.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { translations: true }
    });

    console.log(`Found ${articles.length} recent articles.`);
    articles.forEach(art => {
        console.log(`- Article ID: ${art.id}`);
        art.translations.forEach(t => {
            console.log(`  [${t.languageCode}] Title: ${t.title}`);
            console.log(`  Content length: ${t.content.length}`);
            console.log(`  Snippet: ${t.content.substring(0, 100)}...`);
        });
    });
}

check().catch(console.error).finally(() => prisma.$disconnect());
