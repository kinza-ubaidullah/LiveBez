
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLeagueApiIds() {
    try {
        const leagues = await prisma.league.findMany({
            where: { apiId: { not: null } },
            include: { translations: { where: { languageCode: 'en' } } }
        });

        console.log('--- Leagues with API IDs ---');
        leagues.forEach(l => {
            console.log(`ID: ${l.id} | apiId: ${l.apiId} | Name: ${l.translations[0]?.name}`);
        });

    } catch (e) {
        console.error('Check failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkLeagueApiIds();
