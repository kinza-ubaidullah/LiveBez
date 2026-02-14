const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Seeding Bookmakers ---');

    // Clear existing to avoid duplicates
    await prisma.bookmakerTranslation.deleteMany();
    await prisma.bookmaker.deleteMany();
    console.log('✔ Cleared existing bookmakers');

    const bookmakers = [
        {
            name: 'Bet365',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Bet365_logo.svg/1200px-Bet365_logo.svg.png',
            rating: 4.9,
            bonusText: '100% Deposit Bonus up to $100',
            affiliateUrl: 'https://www.bet365.com',
            description: 'One of the world\'s leading online gambling companies.'
        },
        {
            name: '1XBet',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/1XBET_logo.svg/1200px-1XBET_logo.svg.png',
            rating: 4.8,
            bonusText: 'Exclusive 130% Welcome Bonus',
            affiliateUrl: 'https://1xbet.com',
            description: 'Innovative betting company with wide range of markets.'
        },
        {
            name: 'Melbet',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Melbet_logo.svg/1200px-Melbet_logo.svg.png',
            rating: 4.7,
            bonusText: 'First Deposit Bonus 100%',
            affiliateUrl: 'https://melbet.com',
            description: 'Fast payouts and high odds on all sports events.'
        },
        {
            name: 'Betway',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Betway_Logo.svg/1200px-Betway_Logo.svg.png',
            rating: 4.6,
            bonusText: 'Bet $10 Get $30 in Free Bets',
            affiliateUrl: 'https://betway.com',
            description: 'Global leader in online sports betting and gaming.'
        },
        {
            name: '888Sport',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/888_holdings_logo.svg/1200px-888_holdings_logo.svg.png',
            rating: 4.5,
            bonusText: 'Bet $10 Get $30 + $10 Casino Bonus',
            affiliateUrl: 'https://www.888sport.com',
            description: 'Premium betting experience with live streaming.'
        }
    ];

    const langCodes = ['en', 'ar', 'fa'];

    for (const bmData of bookmakers) {
        // Create Bookmaker
        const bm = await prisma.bookmaker.create({
            data: {
                logoUrl: bmData.logoUrl,
                rating: bmData.rating,
                isActive: true,
                isDoFollow: true
            }
        });

        // Create Translations
        for (const lang of langCodes) {
            let name = bmData.name;
            let bonus = bmData.bonusText;
            let desc = bmData.description;

            // Simple localization if needed
            if (lang === 'ar') {
                bonus = 'مكافأة ترحيبية مغرية';
                desc = 'واحدة من أفضل منصات المراهنة العالمية.';
            } else if (lang === 'fa') {
                bonus = 'بونوس خوش‌آمدگویی ویژه';
                desc = 'یکی از معتبرترین سایت‌های پیش‌بینی ورزشی.';
            }

            await prisma.bookmakerTranslation.create({
                data: {
                    bookmakerId: bm.id,
                    languageCode: lang,
                    name: name,
                    bonusText: bonus,
                    affiliateUrl: bmData.affiliateUrl,
                    description: desc,
                    sampleOdds: '1.95 | 3.40 | 4.20'
                }
            });
        }
        console.log(`✔ Seeded ${bmData.name}`);
    }

    console.log('--- Done ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
