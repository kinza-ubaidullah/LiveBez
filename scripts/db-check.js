
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    const langCounts = await Promise.all([
        prisma.matchTranslation.count({ where: { languageCode: 'en' } }),
        prisma.matchTranslation.count({ where: { languageCode: 'fa' } }),
        prisma.matchTranslation.count({ where: { languageCode: 'ar' } }),
    ]);
    console.log(`Translation Counts: EN: ${langCounts[0]} | FA: ${langCounts[1]} | AR: ${langCounts[2]}`);
    console.log("\n--- League Data ---");
    const leagues = await prisma.league.findMany({
        include: { translations: true },
        take: 5
    });
    leagues.forEach(l => {
        console.log(`ID: ${l.id} | Country: ${l.country} | Logo: ${l.logoUrl ? '✓' : '✗'}`);
        l.translations.forEach(t => console.log(`  - [${t.languageCode}] ${t.name}`));
    });

    console.log("\n--- Match Data ---");
    const matches = await prisma.match.findMany({
        take: 5,
        include: { prediction: true }
    });
    matches.forEach(m => {
        console.log(`${m.homeTeam} vs ${m.awayTeam} | Logo: ${m.homeTeamLogo ? '✓' : '✗'}/${m.awayTeamLogo ? '✓' : '✗'} | API ID: ${m.apiSportsId || 'NONE'}`);
        if (m.prediction) {
            console.log(`  - Prediction: H:${m.prediction.winProbHome}% D:${m.prediction.winProbDraw}% A:${m.prediction.winProbAway}%`);
        } else {
            console.log(`  - Prediction: MISSING`);
        }
    });

    console.log("\n--- Article Data ---");
    const articles = await prisma.article.findMany({
        include: { translations: true },
        take: 3
    });
    articles.forEach(a => {
        console.log(`ID: ${a.id} | Published: ${a.published}`);
        a.translations.forEach(t => console.log(`  - [${t.languageCode}] ${t.title}`));
    });

    await prisma.$disconnect();
}

checkData();
