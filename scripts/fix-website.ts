import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Global Fix (v2) ---');

    // 0. Ensure Languages exist
    const langCodes = ['en', 'ar', 'fa'];
    const langNames: Record<string, string> = { en: 'English', ar: 'Arabic', fa: 'Persian' };

    for (const code of langCodes) {
        await prisma.language.upsert({
            where: { code },
            update: { isVisible: true },
            create: { code, name: langNames[code], isVisible: true }
        });
    }
    console.log('✔ Languages ensured');

    // 1. Ensure Article Category exists with translations and SEO
    let category = await prisma.articleCategory.findUnique({ where: { key: 'news' } });
    if (!category) {
        category = await prisma.articleCategory.create({
            data: { key: 'news' }
        });
    }

    for (const code of langCodes) {
        const name = code === 'en' ? 'News & Analysis' : code === 'ar' ? 'أخبار وتحليلات' : 'اخبار و تحلیل';
        const slug = `category-news-${code}`;

        const existingTrans = await prisma.articleCategoryTranslation.findUnique({
            where: { categoryId_languageCode: { categoryId: category.id, languageCode: code } }
        });

        if (!existingTrans) {
            const seo = await prisma.seoFields.create({
                data: { title: name, description: `Read the latest ${name}` }
            });
            await prisma.articleCategoryTranslation.create({
                data: {
                    categoryId: category.id,
                    languageCode: code,
                    name,
                    slug,
                    seoId: seo.id
                }
            });
        }
    }
    console.log('✔ Article Category ensured');

    // 2. Add sample articles if empty
    const articleCount = await prisma.article.count();
    if (articleCount === 0) {
        const samples = [
            {
                en: { title: 'Tactical Breakdown: High Pressing in Modern Football', content: 'Modern football has evolved significantly with the introduction of high-intensity pressing systems. Teams like Manchester City and Liverpool have set the standard for off-the-ball work rate and tactical discipline.' },
                ar: { title: 'التحليل التكتيكي: الضغط العالي في كرة القدم الحديثة', content: 'تطورت كرة القدم الحديثة بشكل كبير مع إدخال أنظمة الضغط عالية الكثافة. لقد وضعت فرق مثل مانشستر سيتي وليفربول المعيار لمعدل العمل خارج الكرة والانضباط التكتيكي.' },
                fa: { title: 'تجزیه و تحلیل تاکتیکی: پرس شدید در فوتبال مدرن', content: 'فوتبال مدرن با معرفی سیستم‌های پرس با شدت بالا به طور قابل توجهی تکامل یافته است. تیم‌هایی مانند منچسترسیتی و لیورپول استاندارد نرخ کار بدون توپ و انضباط تاکتیکی را تعیین کرده‌اند.' },
                slug: 'tactical-pressing-evolution'
            },
            {
                en: { title: 'The Impact of Data Analytics on Betting Strategy', content: 'Professional betting has been transformed by big data. Understanding complex metrics like Expected Goals (xG) and Expected Assists (xA) is now crucial for identifying value in the markets.' },
                ar: { title: 'تأثير تحليل البيانات على استراتيجية المراهنة', content: 'تم تحويل المراهنة الاحترافية بواسطة البيانات الضخمة. يعد فهم المقاييس المعقدة مثل الأهداف المتوقعة (xG) والتمريرات الحاسمة المتوقعة (xA) أمرًا بالغ الأهمية الآن لتحديد القيمة في الأسواق.' },
                fa: { title: 'تأثیر تجزیه و تحلیل داده‌ها بر استراتژی شرط‌بندی', content: 'شرط‌بندی حرفه‌ای توسط داده‌های بزرگ متحول شده است. درک معیارهای پیچیده مانند گل‌های مورد انتظار (xG) و پاس گل‌های مورد انتظار (xA) اکنون برای شناسایی ارزش در بازارها بسیار مهم است.' },
                slug: 'data-analytics-impact'
            }
        ];

        for (const sample of samples) {
            const article = await prisma.article.create({
                data: { categoryId: category.id, published: true, isFeatured: true }
            });

            for (const code of langCodes) {
                const data = (sample as any)[code];
                const seo = await prisma.seoFields.create({
                    data: { title: data.title, description: data.content.substring(0, 150) }
                });
                await prisma.articleTranslation.create({
                    data: {
                        articleId: article.id,
                        languageCode: code,
                        title: data.title,
                        content: data.content,
                        slug: `${sample.slug}-${code}`,
                        seoId: seo.id,
                        excerpt: data.content.substring(0, 100) + '...'
                    }
                });
            }
        }
        console.log('✔ Sample articles seeded');
    }

    // 3. Publish all matches and ensure they have SEO
    const matchesToPublish = await prisma.matchTranslation.findMany({
        where: { status: { not: 'PUBLISHED' } }
    });

    for (const mt of matchesToPublish) {
        await prisma.matchTranslation.update({
            where: { id: mt.id },
            data: { status: 'PUBLISHED' }
        });
    }
    console.log(`✔ Published ${matchesToPublish.length} matches`);

    // 4. Ensure Site Settings
    const settings = await prisma.siteSettings.findFirst();
    if (!settings) {
        await prisma.siteSettings.create({
            data: {
                siteName: 'LiveBaz',
                globalTitle: 'LiveBaz | Expert Predictions',
                globalDesc: 'Professional football analysis and real-time scores.',
                globalBrandColor: '#2563eb'
            }
        });
        console.log('✔ Site settings created');
    }

    console.log('--- Global Fix Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
