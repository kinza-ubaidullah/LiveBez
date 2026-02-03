import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBookmakers() {
    console.log('🎰 Seeding bookmakers...');

    const languages = await prisma.language.findMany();

    const bookmakers = [
        {
            rating: 4.8,
            logoUrl: 'https://via.placeholder.com/150x150/0052FF/FFFFFF?text=Bet365',
            translations: {
                en: { name: 'Bet365', bonusText: 'Up to $200 Bonus', affiliateUrl: 'https://www.bet365.com' },
                ar: { name: 'بيت365', bonusText: 'مكافأة تصل إلى 200 دولار', affiliateUrl: 'https://www.bet365.com' },
                es: { name: 'Bet365', bonusText: 'Hasta $200 de Bono', affiliateUrl: 'https://www.bet365.com' }
            }
        },
        {
            rating: 4.7,
            logoUrl: 'https://via.placeholder.com/150x150/00C851/FFFFFF?text=1xBet',
            translations: {
                en: { name: '1xBet', bonusText: '100% up to $130', affiliateUrl: 'https://www.1xbet.com' },
                ar: { name: '1xBet', bonusText: '100٪ حتى 130 دولار', affiliateUrl: 'https://www.1xbet.com' },
                es: { name: '1xBet', bonusText: '100% hasta $130', affiliateUrl: 'https://www.1xbet.com' }
            }
        },
        {
            rating: 4.6,
            logoUrl: 'https://via.placeholder.com/150x150/FF6B6B/FFFFFF?text=Betway',
            translations: {
                en: { name: 'Betway', bonusText: '$30 Free Bet', affiliateUrl: 'https://www.betway.com' },
                ar: { name: 'بيتواي', bonusText: 'رهان مجاني 30 دولار', affiliateUrl: 'https://www.betway.com' },
                es: { name: 'Betway', bonusText: 'Apuesta Gratis $30', affiliateUrl: 'https://www.betway.com' }
            }
        },
        {
            rating: 4.5,
            logoUrl: 'https://via.placeholder.com/150x150/4ECDC4/FFFFFF?text=22Bet',
            translations: {
                en: { name: '22Bet', bonusText: '100% up to €122', affiliateUrl: 'https://www.22bet.com' },
                ar: { name: '22Bet', bonusText: '100٪ حتى 122 يورو', affiliateUrl: 'https://www.22bet.com' },
                es: { name: '22Bet', bonusText: '100% hasta €122', affiliateUrl: 'https://www.22bet.com' }
            }
        },
        {
            rating: 4.4,
            logoUrl: 'https://via.placeholder.com/150x150/FFD93D/000000?text=Parimatch',
            translations: {
                en: { name: 'Parimatch', bonusText: 'Welcome Bonus $100', affiliateUrl: 'https://www.parimatch.com' },
                ar: { name: 'باريماتش', bonusText: 'مكافأة ترحيبية 100 دولار', affiliateUrl: 'https://www.parimatch.com' },
                es: { name: 'Parimatch', bonusText: 'Bono de Bienvenida $100', affiliateUrl: 'https://www.parimatch.com' }
            }
        }
    ];

    for (const bm of bookmakers) {
        const created = await prisma.bookmaker.create({
            data: {
                rating: bm.rating,
                logoUrl: bm.logoUrl,
                translations: {
                    create: languages.map(lang => ({
                        languageCode: lang.code,
                        name: bm.translations[lang.code as keyof typeof bm.translations]?.name || bm.translations.en.name,
                        bonusText: bm.translations[lang.code as keyof typeof bm.translations]?.bonusText || bm.translations.en.bonusText,
                        affiliateUrl: bm.translations[lang.code as keyof typeof bm.translations]?.affiliateUrl || bm.translations.en.affiliateUrl,
                    }))
                }
            }
        });
        console.log(`✅ Created: ${bm.translations.en.name}`);
    }

    console.log('✨ Bookmakers seeded successfully!');
}

seedBookmakers()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
