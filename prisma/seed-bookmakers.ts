import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBookmakers() {
    console.log('🎰 Refreshing bookmakers with ultra-reliable data...');

    const languages = await prisma.language.findMany();
    const langCodes = languages.map(l => l.code);

    const bookmakers = [
        {
            rating: 4.9,
            logoUrl: 'https://logos-world.net/wp-content/uploads/2020/08/Bet365-Logo.png',
            translations: {
                en: {
                    name: 'Bet365',
                    bonusText: 'Up to $200 in Bet Credits for New Customers',
                    affiliateUrl: 'https://www.bet365.com/olp/open-account',
                    description: 'One of the worlds leading online gambling companies. The most comprehensive In-Play service. Deposit Bonus for New Customers. Watch Live Sport. Streaming available on desktop, mobile and tablet. Bet on Sports. Bet Now on Sports. Services: Live Streaming, Cash Out, Edit Bet.',
                    sampleOdds: 'Home: 2.10 | Draw: 3.40 | Away: 3.20'
                },
                ar: {
                    name: 'Bet365',
                    bonusText: 'ما يصل إلى 200 دولار في أرصدة الرهان للعملاء الجدد',
                    affiliateUrl: 'https://www.bet365.com/olp/open-account',
                    description: 'واحدة من الشركات الرائدة في العالم في مجال المقامرة عبر الإنترنت. الخدمة الأكثر شمولاً أثناء اللعب. مكافأة الإيداع للعملاء الجدد.',
                    sampleOdds: 'فوز صاحب الأرض: 2.10 | تعادل: 3.40 | فوز الضيف: 3.20'
                },
                fa: {
                    name: 'بت 365',
                    bonusText: 'تا ۲۰۰ دلار اعتبار شرط‌بندی برای مشتریان جدید',
                    affiliateUrl: 'https://www.bet365.com/olp/open-account',
                    description: 'یکی از شرکت‌های پیشرو در زمینه قمار آنلاین در جهان. جامع‌ترین خدمات شرط‌بندی زنده. بونوس واریز برای مشتریان جدید.',
                    sampleOdds: 'میزبان: ۲.۱۰ | مساوی: ۳.۴۰ | میهمان: ۳.۲۰'
                }
            }
        },
        {
            rating: 4.8,
            logoUrl: 'https://logos-world.net/wp-content/uploads/2020/08/1xBet-Logo.png',
            translations: {
                en: {
                    name: '1xBet',
                    bonusText: 'Exclusive 100% First Deposit Bonus up to $130',
                    affiliateUrl: 'https://1xbet.com/en/registration/',
                    description: '1xBet is a top-level international betting company. It offers a huge variety of betting options on sports, games and more. Fast payouts, 24/7 support and high odds.',
                    sampleOdds: 'Home: 2.15 | Draw: 3.35 | Away: 3.15'
                },
                ar: {
                    name: '1xBet',
                    bonusText: 'مكافأة الإيداع الأول الحصرية بنسبة 100% حتى 130 دولارًا',
                    affiliateUrl: 'https://1xbet.com/ar/registration/',
                    description: '1xBet هي شركة مراهنات دولية رفيعة المستوى. يقدم مجموعة كبيرة ومتنوعة من خيارات الرهان على الرياضة والألعاب والمزيد.',
                    sampleOdds: 'فوز صاحب الأرض: 2.15 | تعادل: 3.35 | فوز الضيف: 3.15'
                },
                fa: {
                    name: 'وان ایکس بت',
                    bonusText: 'بونوس اختصاصی ۱۰۰٪ اولین واریز تا ۱۳۰ دلار',
                    affiliateUrl: 'https://1xbet.com/fa/registration/',
                    description: 'وان ایکس بت یک شرکت شرط‌بندی بین‌المللی سطح بالا است. تنوع بسیار زیادی از گزینه‌های شرط‌بندی روی ورزش‌ها، بازی‌ها و موارد دیگر را ارائه می‌دهد.',
                    sampleOdds: 'میزبان: ۲.۱۵ | مساوی: ۳.۳۵ | میهمان: ۳.۱۵'
                }
            }
        },
        {
            rating: 4.7,
            logoUrl: 'https://logos-world.net/wp-content/uploads/2020/08/Betway-Logo.png',
            translations: {
                en: {
                    name: 'Betway',
                    bonusText: '$30 Free Bet Welcome Offer',
                    affiliateUrl: 'https://betway.com/en/sports',
                    description: 'Experience the thrill of online betting with Betway. We offer a wide range of sports markets, competitive odds, and exciting promotions. Join today and start winning.',
                    sampleOdds: 'Home: 2.05 | Draw: 3.45 | Away: 3.25'
                },
                ar: {
                    name: 'Betway',
                    bonusText: 'عرض ترحيب بـ 30 دولار رهان مجاني',
                    affiliateUrl: 'https://betway.com/ar/sports',
                    description: 'جرب إثارة المراهنة عبر الإنترنت مع Betway. نحن نقدم مجموعة واسعة من الأسواق الرياضية، واحتمالات تنافسية، وعروض ترويجية مثيرة.',
                    sampleOdds: 'فوز صاحب الأرض: 2.05 | تعادل: 3.45 | فوز الضيف: 3.25'
                },
                fa: {
                    name: 'بت‌وی',
                    bonusText: '۳۰ دلار پیشنهاد خوش‌آمدگویی رهان رایگان',
                    affiliateUrl: 'https://betway.com/fa/sports',
                    description: 'هیجان شرط‌بندی آنلاین را با بت‌وی تجربه کنید. ما طیف گسترده‌ای از بازارهای ورزشی، ضرایب رقابتی و تبلیغات هیجان‌انگیز را ارائه می‌دهیم.',
                    sampleOdds: 'میزبان: ۲.۰۵ | مساوی: ۳.۴۵ | میهمان: ۳.۲۵'
                }
            }
        },
        {
            rating: 4.6,
            logoUrl: 'https://logos-world.net/wp-content/uploads/2020/08/22Bet-Logo.png',
            translations: {
                en: {
                    name: '22Bet',
                    bonusText: '100% Bonus up to €122 on Sports',
                    affiliateUrl: 'https://22bet.com/en/line',
                    description: '22Bet offers the best odds and a wide range of sports events. Fast registration, high bonuses, and secure payments. Bet on your favorite teams now.',
                    sampleOdds: 'Home: 2.20 | Draw: 3.30 | Away: 3.10'
                },
                ar: {
                    name: '22Bet',
                    bonusText: 'بونص 100% حتى 122 يورو على الرياضة',
                    affiliateUrl: 'https://22bet.com/ar/line',
                    description: 'تقدم 22Bet أفضل الاحتمالات ومجموعة واسعة من الأحداث الرياضية. تسجيل سريع، مكافآت عالية، ومدفوعات آمنة.',
                    sampleOdds: 'فوز صاحب الأرض: 2.20 | تعادل: 3.30 | فوز الضيف: 3.10'
                },
                fa: {
                    name: '۲۲ بت',
                    bonusText: '۱۰۰٪ بونوس تا ۱۲۲ یورو روی ورزش‌ها',
                    affiliateUrl: 'https://22bet.com/fa/line',
                    description: '۲۲ بت بهترین ضرایب و طیف گسترده‌ای از رویدادهای ورزشی را ارائه می‌دهد. ثبت‌نام سریع، بونوس‌های بالا و پرداخت‌های امن.',
                    sampleOdds: 'میزبان: ۲.۲۰ | مساوی: ۳.۳۰ | میهمان: ۳.۱۰'
                }
            }
        },
        {
            rating: 4.5,
            logoUrl: 'https://logos-world.net/wp-content/uploads/2020/08/Parimatch-Logo.png',
            translations: {
                en: {
                    name: 'Parimatch',
                    bonusText: 'Welcome Bonus up to $150',
                    affiliateUrl: 'https://parimatch.com/en/sports',
                    description: 'Parimatch is a global sports betting brand. We provide high odds, a variety of betting markets, and instant 24/7 support. Join the winners circle today.',
                    sampleOdds: 'Home: 2.00 | Draw: 3.50 | Away: 3.30'
                },
                ar: {
                    name: 'باريماتش',
                    bonusText: 'مكافأة ترحيبية تصل إلى 150 دولار',
                    affiliateUrl: 'https://parimatch.com/ar/sports',
                    description: 'باريماتش هي علامة تجارية عالمية للمراهنات الرياضية. نحن نقدم احتمالات عالية ومجموعة متنوعة من أسواق الرهان ودعمًا فوريًا على مدار الساعة طوال أيام الأسبوع.',
                    sampleOdds: 'فوز صاحب الأرض: 2.00 | تعادل: 3.50 | فوز الضيف: 3.30'
                },
                fa: {
                    name: 'پاری مچ',
                    bonusText: 'بونوس خوش‌آمدگویی تا ۱۵۰ دلار',
                    affiliateUrl: 'https://parimatch.com/fa/sports',
                    description: 'پاری مچ یک برند جهانی شرط‌بندی ورزشی است. ما ضرایب بالا، تنوع بازارهای شرط‌بندی و پشتیبانی فوری ۲۴/۷ را ارائه می‌دهیم.',
                    sampleOdds: 'میزبان: ۲.۰۰ | مساوی: ۳.۵۰ | میهمان: ۳.۳۰'
                }
            }
        }
    ];

    // Clear existing
    await prisma.bookmakerTranslation.deleteMany({});
    await prisma.bookmaker.deleteMany({});

    for (const bm of bookmakers) {
        const createdBm = await prisma.bookmaker.create({
            data: {
                rating: bm.rating,
                logoUrl: bm.logoUrl,
                isActive: true,
            }
        });

        for (const langCode of langCodes) {
            const trans = (bm.translations as any)[langCode] || bm.translations.en;

            const seo = await prisma.seoFields.create({
                data: {
                    title: `${trans.name} | Official Sports Betting & Bonus`,
                    description: trans.description.substring(0, 160)
                }
            });

            await prisma.bookmakerTranslation.create({
                data: {
                    bookmakerId: createdBm.id,
                    languageCode: langCode,
                    name: trans.name,
                    slug: `${trans.name.toLowerCase().replace(/\s+/g, '-')}-${langCode}`,
                    bonusText: trans.bonusText,
                    affiliateUrl: trans.affiliateUrl,
                    description: trans.description,
                    sampleOdds: trans.sampleOdds,
                    seoId: seo.id
                }
            });
        }
        console.log(`✅ Seeded: ${bm.translations.en.name}`);
    }

    console.log('✨ Bookmakers synced with reliable data and official links!');
}

seedBookmakers()
    .catch((e) => {
        console.error('❌ Refill failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
