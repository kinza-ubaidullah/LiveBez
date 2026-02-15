
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listLeagues() {
    try {
        const leagues = await prisma.league.findMany({
            include: { translations: { where: { languageCode: 'en' } } }
        });

        console.log('--- Current Leagues ---');
        leagues.forEach(l => {
            console.log(`ID: ${l.id} | Name: ${l.translations[0]?.name} | Slug: ${l.translations[0]?.slug}`);
        });

    } catch (e) {
        console.error('List leagues failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

listLeagues();
