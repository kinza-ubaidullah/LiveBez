import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const bookmakers = [
        {
            name: 'Bet365',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Bet365_logo.svg/1200px-Bet365_logo.svg.png',
            rating: 4.9,
            bonusText: '100% up to $100',
            affiliateUrl: 'https://www.bet365.com',
        },
        {
            name: '1xBet',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/1XBET_logo.svg/1200px-1XBET_logo.svg.png',
            rating: 4.8,
            bonusText: 'Exclusive 130% Bonus',
            affiliateUrl: 'https://1xbet.com',
        },
        {
            name: 'Betway',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Betway_Logo.svg/1200px-Betway_Logo.svg.png',
            rating: 4.7,
            bonusText: 'Free Bet up to $30',
            affiliateUrl: 'https://betway.com',
        },
        {
            name: 'Melbet',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Melbet_logo.svg/1200px-Melbet_logo.svg.png',
            rating: 4.6,
            bonusText: 'Huge Multi-tier Bonus',
            affiliateUrl: 'https://melbet.com',
        }
    ];

    const languages = await prisma.language.findMany();

    for (const bmData of bookmakers) {
        // Create or update the bookmaker
        const bm = await prisma.bookmaker.create({
            data: {
                logoUrl: bmData.logoUrl,
                rating: bmData.rating,
                isActive: true,
            }
        });

        for (const lang of languages) {
            await prisma.bookmakerTranslation.create({
                data: {
                    bookmakerId: bm.id,
                    languageCode: lang.code,
                    name: bmData.name,
                    bonusText: bmData.bonusText,
                    affiliateUrl: bmData.affiliateUrl,
                }
            });
        }
    }

    console.log('✅ Sample bookmakers added');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
