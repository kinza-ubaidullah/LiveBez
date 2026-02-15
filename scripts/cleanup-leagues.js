
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MAJOR_LEAGUES = [
    { name: 'Premier League', apiId: '39' },
    { name: 'La Liga', apiId: '140' },
    { name: 'Bundesliga', apiId: '78' },
    { name: 'Serie A', apiId: '135' },
    { name: 'Ligue 1', apiId: '61' }
];

async function mergeLeagues() {
    for (const data of MAJOR_LEAGUES) {
        console.log(`Processing ${data.name}...`);

        // Find all leagues with this name
        const leagues = await prisma.league.findMany({
            where: { translations: { some: { name: data.name, languageCode: 'en' } } },
            include: { _count: { select: { matches: true } } }
        });

        if (leagues.length < 1) {
            console.log(`  No leagues found for ${data.name}`);
            continue;
        }

        // Find the one that should be master (either has apiId or most matches)
        let master = leagues.find(l => l.apiId === data.apiId);

        if (!master) {
            // If none have the correct apiId, take the one with most matches
            master = leagues.sort((a, b) => b._count.matches - a._count.matches)[0];
            // Update it to have the apiId
            await prisma.league.update({
                where: { id: master.id },
                data: { apiId: data.apiId }
            });
            console.log(`  Assigned apiId ${data.apiId} to ${master.id}`);
        }

        // Move matches from others to master
        for (const league of leagues) {
            if (league.id === master.id) continue;

            console.log(`  Merging ${league.id} (${league._count.matches} matches) into ${master.id}`);

            // Move matches
            await prisma.match.updateMany({
                where: { leagueId: league.id },
                data: { leagueId: master.id }
            });

            // Delete the old league (Prisma will handle cascading if configured, or we delete translations first)
            try {
                // Delete translations first
                await prisma.leagueTranslation.deleteMany({ where: { leagueId: league.id } });
                await prisma.league.delete({ where: { id: league.id } });
            } catch (e) {
                console.warn(`  Failed to delete old league ${league.id}: ${e.message}`);
            }
        }
    }
}

mergeLeagues().then(() => {
    console.log('Merge complete.');
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
