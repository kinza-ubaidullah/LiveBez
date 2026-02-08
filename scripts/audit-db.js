const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRealData() {
    console.log('--- Database Audit ---');
    try {
        const matchCount = await prisma.match.count();
        const leagueCount = await prisma.league.count();
        const syncLogs = await prisma.syncLog.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
        const recentMatches = await prisma.match.findMany({
            take: 3,
            include: { league: true },
            orderBy: { date: 'desc' }
        });

        console.log(`Total Matches: ${matchCount}`);
        console.log(`Total Leagues: ${leagueCount}`);
        console.log('\n--- Recent Sync Logs ---');
        syncLogs.forEach(log => console.log(`${log.createdAt.toISOString()} | ${log.type} | ${log.status} | Count: ${log.count}`));

        console.log('\n--- Real Match Sample ---');
        recentMatches.forEach(m => {
            console.log(`Match: ${m.homeTeam} vs ${m.awayTeam}`);
            console.log(`League: ${m.league?.translations?.[0]?.name || m.league?.apiId || 'Unknown'}`);
            console.log(`Logos: ${m.homeTeamLogo ? 'YES' : 'NO'} / ${m.awayTeamLogo ? 'YES' : 'NO'}`);
            console.log('---');
        });
    } catch (e) {
        console.error('Audit failed:', e.message);
    }
}

checkRealData().finally(() => prisma.$disconnect());
