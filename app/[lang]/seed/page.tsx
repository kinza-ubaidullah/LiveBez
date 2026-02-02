import prisma from "@/lib/db";
import { getDictionary } from "@/lib/i18n";

export default async function SeedPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;

    console.log('🚀 Hot-Seeding Articles...');

    const langs = await prisma.language.findMany();

    const articlesData = [
        {
            category: 'Analysis',
            img: '/images/art-title-race.png',
            en: { title: 'The 2026 Title Race Analysis', slug: 'title-race-2026', excerpt: 'Who stands the best chance?', content: '<h2>The Contenders</h2><p>With just 10 games remaining, the title race is wide open.</p>' },
            ar: { title: 'تحليل سباق لقب 2026', slug: 'title-race-2026-ar', excerpt: 'من لديه الفرصة الأفضل؟', content: '<h2>المتنافسون</h2><p>مع تبقي 10 مباريات فقط، سباق اللقب مفتوح على مصراعيه.</p>' }
        },
        {
            category: 'Transfer',
            img: '/images/art-transfers.png',
            en: { title: 'Top 10 Summer Transfers to Watch', slug: 'summer-transfers-2026', excerpt: 'The biggest moves expected this summer.', content: '<h2>Market Overview</h2><p>The summer transfer window promises to be one of the most exciting in years.</p>' },
            ar: { title: 'نافذة الانتقالات الصيفية', description: 'أهم الانتقالات المتوقعة.', title_ar: 'أفضل 10 انتقالات صيفية متوقعة', slug: 'summer-transfers-2026-ar', excerpt: 'أكبر الصفقات المتوقعة هذا الصيف.', content: '<h2>نظرة على السوق</h2><p>تعد نافذة الانتقالات الصيفية بأن تكون من أكثر النوافذ إثارة منذ سنوات.</p>' }
        },
        {
            category: 'Profile',
            img: '/images/art-bellingham.png',
            en: { title: 'Jude Bellingham: The Complete Midfielder', slug: 'bellingham-profile', excerpt: 'How Bellingham became world class.', content: '<h2>From Birmingham to the Bernabeu</h2><p>Jude Bellingham\'s journey is remarkable.</p>' },
            ar: { title: 'جود بيلينغهام: لاعب الوسط الكامل', slug: 'bellingham-profile-ar', excerpt: 'كيف أصبح بيلينغهام نجمًا عالميًا.', content: '<h2>من برمنغهام إلى البرنابيو</h2><p>رحلة جود بيلينغهام رائعة.</p>' }
        }
    ];

    let count = 0;
    for (const art of articlesData) {
        const existing = await prisma.article.findFirst({
            where: { translations: { some: { slug: art.en.slug } } }
        });

        if (!existing) {
            const translations = [];
            for (const l of langs) {
                const data = l.code === 'ar' ? art.ar : art.en;
                const seo = await prisma.seoFields.create({
                    data: {
                        title: data.title,
                        description: data.excerpt
                    }
                });
                translations.push({
                    languageCode: l.code,
                    title: data.title,
                    slug: data.slug,
                    excerpt: data.excerpt,
                    content: data.content,
                    seoId: seo.id
                });
            }

            await prisma.article.create({
                data: {
                    category: art.category,
                    featuredImage: art.img,
                    published: true,
                    translations: {
                        create: translations
                    }
                }
            });
            count++;
        }
    }

    return (
        <div className="p-20 text-center">
            <h1 className="text-4xl font-black mb-4">Seed Status</h1>
            <p>Seeded {count} articles successfully.</p>
            <a href={`/${lang}`} className="text-blue-600 underline mt-8 block">Back to Home</a>
        </div>
    );
}
