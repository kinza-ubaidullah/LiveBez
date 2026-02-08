import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning database...');
    // Order matters for deletion due to relations
    await prisma.bookmakerTranslation.deleteMany({});
    await prisma.bookmaker.deleteMany({});
    await prisma.predictionTranslation.deleteMany({});
    await prisma.articleTranslation.deleteMany({});
    await prisma.articleCategoryTranslation.deleteMany({});
    await prisma.matchTranslation.deleteMany({});
    await prisma.leagueTranslation.deleteMany({});
    await prisma.seoFields.deleteMany({});
    await prisma.prediction.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.article.deleteMany({});
    await prisma.articleCategory.deleteMany({});
    await prisma.league.deleteMany({});
    await prisma.language.deleteMany({});
    await prisma.adminUser.deleteMany({});

    // Create Admin User
    console.log('👤 Creating Admin User...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.adminUser.create({
        data: {
            email: 'admin@livebaz.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN'
        }
    });

    // Languages
    console.log('🌐 Creating Languages...');
    await prisma.language.create({ data: { code: 'en', name: 'English', isVisible: true } });
    await prisma.language.create({ data: { code: 'ar', name: 'Arabic', isVisible: true } });
    await prisma.language.create({ data: { code: 'fa', name: 'Persian', isVisible: true } });

    // ========== CATEGORIES ==========
    console.log('📁 Creating Article Categories...');

    // Analysis Category
    const catAnalysis = await prisma.articleCategory.create({ data: { key: 'analysis' } });
    const catAnalysisSeoEn = await prisma.seoFields.create({ data: { title: 'Football Analysis & Insights', description: 'Deep dives and tactical analysis.' } });
    await prisma.articleCategoryTranslation.create({ data: { categoryId: catAnalysis.id, languageCode: 'en', name: 'Analysis', slug: 'analysis', seoId: catAnalysisSeoEn.id } });
    const catAnalysisSeoAr = await prisma.seoFields.create({ data: { title: 'تحليل كرة القدم', description: 'تحليلات عميقة وتكتيكية.' } });
    await prisma.articleCategoryTranslation.create({ data: { categoryId: catAnalysis.id, languageCode: 'ar', name: 'تحليل', slug: 'analysis-ar', seoId: catAnalysisSeoAr.id } });
    const catAnalysisSeoFa = await prisma.seoFields.create({ data: { title: 'تحلیل فوتبال', description: 'تجزیه و تحلیل عمیق و تاکتیکی.' } });
    await prisma.articleCategoryTranslation.create({ data: { categoryId: catAnalysis.id, languageCode: 'fa', name: 'تحلیل', slug: 'analysis-fa', seoId: catAnalysisSeoFa.id } });

    // Transfer Category
    const catTransfer = await prisma.articleCategory.create({ data: { key: 'transfer' } });
    const catTransferSeoEn = await prisma.seoFields.create({ data: { title: 'Transfer News & Rumors', description: 'Latest football transfer updates.' } });
    await prisma.articleCategoryTranslation.create({ data: { categoryId: catTransfer.id, languageCode: 'en', name: 'Transfer', slug: 'transfer-news', seoId: catTransferSeoEn.id } });
    const catTransferSeoAr = await prisma.seoFields.create({ data: { title: 'أخبار الانتقالات', description: 'آخر تحديثات انتقالات كرة القدم.' } });
    await prisma.articleCategoryTranslation.create({ data: { categoryId: catTransfer.id, languageCode: 'ar', name: 'انتقالات', slug: 'transfer-news-ar', seoId: catTransferSeoAr.id } });

    // News Category
    const catNews = await prisma.articleCategory.create({ data: { key: 'news' } });
    const catNewsSeoEn = await prisma.seoFields.create({ data: { title: 'Football News Today', description: 'Real-time football news updates.' } });
    await prisma.articleCategoryTranslation.create({ data: { categoryId: catNews.id, languageCode: 'en', name: 'News', slug: 'football-news', seoId: catNewsSeoEn.id } });
    const catNewsSeoAr = await prisma.seoFields.create({ data: { title: 'أخبار كرة القدم', description: 'تحديثات أخبار كرة القدم في الوقت الفعلي.' } });
    await prisma.articleCategoryTranslation.create({ data: { categoryId: catNews.id, languageCode: 'ar', name: 'أخبار', slug: 'football-news-ar', seoId: catNewsSeoAr.id } });


    // ========== LEAGUES ==========
    console.log('🏆 Creating Leagues...');

    // Premier League
    const pl = await prisma.league.create({ data: { country: 'England' } });
    const plSeoEn = await prisma.seoFields.create({ data: { title: 'Premier League Predictions', description: 'Expert analysis for EPL matches.' } });
    await prisma.leagueTranslation.create({ data: { leagueId: pl.id, languageCode: 'en', name: 'Premier League', slug: 'premier-league', seoId: plSeoEn.id } });
    const plSeoAr = await prisma.seoFields.create({ data: { title: 'توقعات الدوري الإنجليزي', description: 'تحليل الخبراء للدوري الإنجليزي.' } });
    await prisma.leagueTranslation.create({ data: { leagueId: pl.id, languageCode: 'ar', name: 'الدوري الإنجليزي الممتاز', slug: 'premier-league-ar', seoId: plSeoAr.id } });

    // La Liga
    const laliga = await prisma.league.create({ data: { country: 'Spain' } });
    const laligaSeoEn = await prisma.seoFields.create({ data: { title: 'La Liga Predictions', description: 'Spanish football expert analysis.' } });
    await prisma.leagueTranslation.create({ data: { leagueId: laliga.id, languageCode: 'en', name: 'La Liga', slug: 'la-liga', seoId: laligaSeoEn.id } });
    const laligaSeoAr = await prisma.seoFields.create({ data: { title: 'توقعات الليغا', description: 'تحليل كرة القدم الإسبانية.' } });
    await prisma.leagueTranslation.create({ data: { leagueId: laliga.id, languageCode: 'ar', name: 'الدوري الإسباني', slug: 'la-liga-ar', seoId: laligaSeoAr.id } });

    // ========== MATCHES ==========
    console.log('⚽ Creating Matches...');

    // PL Match 1: Man City vs Arsenal
    const match1 = await prisma.match.create({
        data: { date: new Date('2026-02-15T20:00:00Z'), homeTeam: 'Man City', awayTeam: 'Arsenal', leagueId: pl.id, status: 'SCHEDULED', lineups: 'Man City: Ederson, Walker, Dias, Stones, Gvardiol; Rodri, De Bruyne, Bernardo; Foden, Haaland, Grealish\nArsenal: Raya, White, Saliba, Gabriel, Zinchenko; Rice, Odegaard, Havertz; Saka, Jesus, Martinelli', stats: 'Head to Head: City 3-1 Arsenal (last 5)\nForm: City WWWDW, Arsenal WDWWW' }
    });
    await prisma.prediction.create({ data: { matchId: match1.id, winProbHome: 45, winProbAway: 30, winProbDraw: 25 } });
    const m1SeoEn = await prisma.seoFields.create({ data: { title: 'Man City vs Arsenal Prediction', description: 'Title decider at Etihad Stadium.' } });
    await prisma.matchTranslation.create({ data: { matchId: match1.id, languageCode: 'en', name: 'Man City vs Arsenal', slug: 'man-city-vs-arsenal', content: '<p>The biggest match of the season as City host the Gunners in a title showdown.</p>', analysis: '<strong>Key Battle:</strong> Haaland vs Saliba will be decisive. Expect a tactical masterclass from both managers.', seoId: m1SeoEn.id } });
    const m1SeoAr = await prisma.seoFields.create({ data: { title: 'توقع السيتي وأرسنال', description: 'مواجهة حاسمة على ملعب الاتحاد.' } });
    await prisma.matchTranslation.create({ data: { matchId: match1.id, languageCode: 'ar', name: 'مانشستر سيتي ضد أرسنال', slug: 'man-city-vs-arsenal-ar', content: '<p>أكبر مباراة في الموسم حيث يستضيف السيتي الغانرز في مواجهة حاسمة على اللقب.</p>', analysis: '<strong>المواجهة الحاسمة:</strong> هالاند ضد ساليبا ستكون حاسمة. توقعوا درسًا تكتيكيًا من المدربين.', seoId: m1SeoAr.id } });

    // ========== ARTICLES ==========
    console.log('📰 Creating Articles...');

    // Article 1: Title Race Analysis
    const art1 = await prisma.article.create({ data: { categoryId: catAnalysis.id, published: true } });
    const a1SeoEn = await prisma.seoFields.create({ data: { title: '2026 Title Race Guide', description: 'Full breakdown of the title race.' } });
    await prisma.articleTranslation.create({ data: { articleId: art1.id, languageCode: 'en', title: 'The 2026 Title Race Analysis', slug: 'title-race-2026', excerpt: 'Who stands the best chance?', content: '<h2>The Contenders</h2><p>With just 10 games remaining, the title race is wide open. Man City leads by 2 points from Arsenal, with Liverpool just 4 points behind.</p>', seoId: a1SeoEn.id } });
    const a1SeoAr = await prisma.seoFields.create({ data: { title: 'تحليل سباق اللقب 2026', description: 'تحليل شامل لسباق اللقب.' } });
    await prisma.articleTranslation.create({ data: { articleId: art1.id, languageCode: 'ar', title: 'تحليل سباق لقب 2026', slug: 'title-race-2026-ar', excerpt: 'من لديه الفرصة الأفضل؟', content: '<h2>المتنافسون</h2><p>مع تبقي 10 مباريات فقط، سباق اللقب مفتوح على مصراعيه. السيتي يتصدر بفارق نقطتين عن أرسنال، وليفربول على بعد 4 نقاط فقط.</p>', seoId: a1SeoAr.id } });

    // Article 2: Transfer News
    const art2 = await prisma.article.create({ data: { categoryId: catTransfer.id, published: true } });
    const a2SeoEn = await prisma.seoFields.create({ data: { title: 'Summer Transfer Window Preview', description: 'Top transfers to watch.' } });
    await prisma.articleTranslation.create({ data: { articleId: art2.id, languageCode: 'en', title: 'Top 10 Summer Transfers to Watch', slug: 'summer-transfers-2026', excerpt: 'The biggest moves expected this summer.', content: '<h2>Market Overview</h2><p>The summer transfer window promises to be one of the most exciting in years.</p>', seoId: a2SeoEn.id } });
    const a2SeoAr = await prisma.seoFields.create({ data: { title: 'نافذة الانتقالات الصيفية', description: 'أهم الانتقالات المتوقعة.' } });
    await prisma.articleTranslation.create({ data: { articleId: art2.id, languageCode: 'ar', title: 'أفضل 10 انتقالات صيفية متوقعة', slug: 'summer-transfers-2026-ar', excerpt: 'أكبر الصفقات المتوقعة هذا الصيف.', content: '<h2>نظرة على السوق</h2><p>تعد نافذة الانتقالات الصيفية بأن تكون من أكثر النوافذ إثارة منذ سنوات.</p>', seoId: a2SeoAr.id } });


    console.log('✅ Seeding completed successfully!');
    console.log('📧 Admin Login: admin@livebaz.com / admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
