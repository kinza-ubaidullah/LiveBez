
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const updates = [
        {
            name: 'Bet365',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Bet365_logo.svg/1200px-Bet365_logo.svg.png'
        },
        {
            name: '1xBet',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/1XBET_logo.svg/1200px-1XBET_logo.svg.png'
        },
        {
            name: 'Betway',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Betway_Logo.svg/1200px-Betway_Logo.svg.png'
        },
        {
            name: '22Bet',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/22Bet_Logo.png/1200px-22Bet_Logo.png'
        },
        {
            name: 'Parimatch',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Parimatch_logo.svg/1200px-Parimatch_logo.svg.png'
        }
    ];

    for (const up of updates) {
        const bm = await prisma.bookmakerTranslation.findFirst({
            where: { name: up.name },
            select: { bookmakerId: true }
        });

        if (bm) {
            await prisma.bookmaker.update({
                where: { id: bm.bookmakerId },
                data: { logoUrl: up.logoUrl }
            });
            console.log(`Updated logo for ${up.name}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
