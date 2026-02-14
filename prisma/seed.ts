import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning database...');
    // Order matters for deletion due to relations
    console.log('🧹 Cleaning translations...');
    await prisma.staticPageTranslation.deleteMany({});
    await prisma.teamTranslation.deleteMany({});
    await prisma.bookmakerTranslation.deleteMany({});
    await prisma.predictionTranslation.deleteMany({});
    await prisma.articleTranslation.deleteMany({});
    await prisma.matchTranslation.deleteMany({});
    await prisma.articleCategoryTranslation.deleteMany({});
    await prisma.leagueTranslation.deleteMany({});

    console.log('🧹 Cleaning entities...');
    await prisma.staticPage.deleteMany({});
    await prisma.bookmaker.deleteMany({});
    await prisma.prediction.deleteMany({});
    await prisma.article.deleteMany({});

    // Core functional data
    await prisma.match.deleteMany({}); // References Team, League
    await prisma.team.deleteMany({});
    await prisma.articleCategory.deleteMany({});
    await prisma.league.deleteMany({});

    // Shared/independent data
    await prisma.seoFields.deleteMany({});
    await prisma.siteSettings.deleteMany({});
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
    const pl = await prisma.league.upsert({
        where: { apiId: '39' },
        update: {},
        create: { country: 'England', apiId: '39' }
    });
    const plSeoEn = await prisma.seoFields.create({ data: { title: 'Premier League Predictions', description: 'Expert analysis for EPL matches.' } });
    await prisma.leagueTranslation.upsert({ where: { slug: 'premier-league' }, update: {}, create: { leagueId: pl.id, languageCode: 'en', name: 'Premier League', slug: 'premier-league', seoId: plSeoEn.id } });
    const plSeoAr = await prisma.seoFields.create({ data: { title: 'توقعات الدوري الإنجليزي', description: 'تحليل الخبراء للدوري الإنجليزي.' } });
    await prisma.leagueTranslation.upsert({ where: { slug: 'premier-league-ar' }, update: {}, create: { leagueId: pl.id, languageCode: 'ar', name: 'الدوري الإنجليزي الممتاز', slug: 'premier-league-ar', seoId: plSeoAr.id } });

    // La Liga
    const laliga = await prisma.league.upsert({
        where: { apiId: '140' },
        update: {},
        create: { country: 'Spain', apiId: '140' }
    });
    const laligaSeoEn = await prisma.seoFields.create({ data: { title: 'La Liga Predictions', description: 'Spanish football expert analysis.' } });
    await prisma.leagueTranslation.upsert({ where: { slug: 'la-liga' }, update: {}, create: { leagueId: laliga.id, languageCode: 'en', name: 'La Liga', slug: 'la-liga', seoId: laligaSeoEn.id } });
    const laligaSeoAr = await prisma.seoFields.create({ data: { title: 'توقعات الليغا', description: 'تحليل كرة القدم الإسبانية.' } });
    await prisma.leagueTranslation.upsert({ where: { slug: 'la-liga-ar' }, update: {}, create: { leagueId: laliga.id, languageCode: 'ar', name: 'الدوري الإسباني', slug: 'la-liga-ar', seoId: laligaSeoAr.id } });

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

    // La Liga Match 2: Real Madrid vs Barcelona
    const match2 = await prisma.match.create({
        data: {
            date: new Date('2026-03-01T20:00:00Z'),
            homeTeam: 'Real Madrid',
            awayTeam: 'Barcelona',
            leagueId: laliga.id,
            status: 'SCHEDULED',
            homeTeamLogo: 'https://media.api-sports.io/football/teams/541.png',
            awayTeamLogo: 'https://media.api-sports.io/football/teams/529.png',
            lineups: 'Real Madrid: Courtois, Carvajal, Militao, Rüdiger, Mendy; Tchouameni, Bellingham, Valverde; Rodrygo, Mbappe, Vinicius Jr\nBarcelona: Ter Stegen, Kounde, Araujo, Cubarsi, Balde; De Jong, Pedri, Gavi; Yamal, Lewandowski, Raphinha',
            stats: 'Head to Head: Real Madrid 3-2 Barcelona (last 5)\nForm: Madrid WWDDW, Barca WWWWW',
            mainTip: 'Both Teams To Score: Yes',
            confidence: 85
        }
    });
    await prisma.prediction.create({ data: { matchId: match2.id, winProbHome: 40, winProbAway: 35, winProbDraw: 25, bttsProb: 75, overProb: 65, underProb: 35 } });
    const m2SeoEn = await prisma.seoFields.create({ data: { title: 'El Clasico Prediction: Real Madrid vs Barcelona', description: 'Expert betting tips for El Clasico.' } });
    await prisma.matchTranslation.create({ data: { matchId: match2.id, languageCode: 'en', name: 'Real Madrid vs Barcelona', slug: 'real-madrid-vs-barcelona-el-clasico', content: '<p>The world stops for El Clasico as Mbappe faces Barcelona for the first time in white.</p>', analysis: '<strong>Prediction:</strong> High scoring affair. With both attacks firing on all cylinders, Over 2.5 Goals looks like a banker.', seoId: m2SeoEn.id } });
    const m2SeoAr = await prisma.seoFields.create({ data: { title: 'توقعات الكلاسيكو: ريال مدريد وبرشلونة', description: 'نصائح الرهان للكلاسيكو.' } });
    await prisma.matchTranslation.create({ data: { matchId: match2.id, languageCode: 'ar', name: 'ريال مدريد ضد برشلونة', slug: 'real-madrid-vs-barcelona-el-clasico-ar', content: '<p>العالم يتوقف من أجل الكلاسيكو حيث يواجه مبابي برشلونة لأول مرة باللون الأبيض.</p>', analysis: '<strong>التوقع:</strong> مباراة عالية التهديف. مع هجوم الفريقين في أفضل حالاته، يبدو أن خيار أكثر من 2.5 هدف رهان مضمون.', seoId: m2SeoAr.id } });

    // ========== ARTICLES ==========
    console.log('📰 Creating Articles...');

    // Article 1: El Clasico Analysis (Linked to Match 2)
    const art1 = await prisma.article.create({ data: { categoryId: catAnalysis.id, published: true, isFeatured: true, matchId: match2.id, featuredImage: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1000' } });

    // Article 2: Man City vs Arsenal (Linked to Match 1)
    const art3 = await prisma.article.create({ data: { categoryId: catAnalysis.id, published: true, matchId: match1.id, featuredImage: 'https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=1000' } });
    const a3SeoEn = await prisma.seoFields.create({ data: { title: 'PL Request A Bet: City vs Arsenal Stats', description: 'Stats pack for the big game.' } });
    await prisma.articleTranslation.create({ data: { articleId: art3.id, languageCode: 'en', title: 'Stats Pack: Man City vs Arsenal', slug: 'city-arsenal-stats-pack', excerpt: 'Everything you need for your Bet Builder.', content: '<h2>Haaland\'s Record</h2><p>Haaland has scored in 4 of his last 5 games against Arsenal. He is priced at 1.80 to score anytime.</p><h2>Card Watch</h2><p>Rodri and Declan Rice are key battles in midfield. Over 4.5 Cards in the match is priced at 2.10.</p>', seoId: a3SeoEn.id } });
    const a3SeoAr = await prisma.seoFields.create({ data: { title: 'إحصائيات السيتي وأرسنال', description: 'حقيبة الإحصائيات للمباراة الكبيرة.' } });
    await prisma.articleTranslation.create({ data: { articleId: art3.id, languageCode: 'ar', title: 'حزمة الإحصائيات: مانشستر سيتي ضد أرسنال', slug: 'city-arsenal-stats-pack-ar', excerpt: 'كل ما تحتاجه لبناء رهانك.', content: '<h2>سجل هالاند</h2><p>سجل هالاند في 4 من آخر 5 مباريات له ضد أرسنال. سعره 1.80 للتسجيل في أي وقت.</p><h2>مراقبة البطاقات</h2><p>رودري وديكلان رايس معارك رئيسية في خط الوسط. أكثر من 4.5 بطاقات في المباراة بسعر 2.10.</p>', seoId: a3SeoAr.id } });

    // Match Today: Liverpool vs Man Utd (To ensure homepage has content)
    const today = new Date();
    today.setHours(20, 0, 0, 0); // Tonight at 8 PM

    const matchToday = await prisma.match.create({
        data: {
            date: today,
            homeTeam: 'Liverpool',
            awayTeam: 'Man Utd',
            leagueId: pl.id, // Reuse Premier League
            status: 'SCHEDULED',
            homeTeamLogo: 'https://media.api-sports.io/football/teams/40.png',
            awayTeamLogo: 'https://media.api-sports.io/football/teams/33.png',
            lineups: 'Liverpool: Alisson, Alexander-Arnold, Konate, Van Dijk, Robertson; Szoboszlai, Mac Allister; Salah, Gakpo, Diaz; Nunez\nMan Utd: Onana, Dalot, Varane, Martinez, Shaw; Mainoo, Casemiro; Garnacho, Fernandes, Rashford; Hojlund',
            stats: 'Head to Head: Liverpool 7-0 Man Utd (Last Meeting)\nForm: Liverpool WWWDW, Man Utd LWWDL',
            mainTip: 'Liverpool to Win & Over 2.5 Goals',
            confidence: 90
        }
    });

    await prisma.prediction.create({
        data: {
            matchId: matchToday.id,
            winProbHome: 65,
            winProbAway: 15,
            winProbDraw: 20,
            bttsProb: 60,
            overProb: 70,
            underProb: 30
        }
    });

    const mtSeoEn = await prisma.seoFields.create({ data: { title: 'Liverpool vs Man Utd Prediction', description: 'North West Derby betting tips.' } });
    const mtSlugEn = `liverpool-vs-man-utd-${today.toISOString().split('T')[0]}`;
    await prisma.matchTranslation.create({
        data: {
            matchId: matchToday.id,
            languageCode: 'en',
            name: 'Liverpool vs Man Utd',
            slug: mtSlugEn,
            content: '<p>The bitter rivals meet again at Anfield. Liverpool will be looking to replicate their historic 7-0 win from last season.</p>',
            analysis: '<strong>Key Factor:</strong> Liverpool\'s high press vs United\'s transition. If United can break the press, they have a chance, but Anfield is a fortress.',
            seoId: mtSeoEn.id,
            status: 'PUBLISHED' // Important for page visibility
        }
    });

    const mtSeoAr = await prisma.seoFields.create({ data: { title: 'توقعات ليفربول ومانشستر يونايتد', description: 'نصائح الرهان لمباراة الديربي.' } });
    const mtSlugAr = `liverpool-vs-man-utd-${today.toISOString().split('T')[0]}-ar`;
    await prisma.matchTranslation.create({
        data: {
            matchId: matchToday.id,
            languageCode: 'ar',
            name: 'ليفربول ضد مانشستر يونايتد',
            slug: mtSlugAr,
            content: '<p>يلتقي الخصمان اللدودان مرة أخرى في آنفيلد.</p>',
            analysis: '<strong>العامل الرئيسي:</strong> ضغط ليفربول العالي.',
            seoId: mtSeoAr.id,
            status: 'PUBLISHED'
        }
    });

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
