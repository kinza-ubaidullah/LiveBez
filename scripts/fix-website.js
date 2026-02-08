const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Global Fix (v4) ---');

    try {
        console.log('Step 0: Ensuring Languages...');
        const langCodes = ['en', 'ar', 'fa'];
        for (const code of langCodes) {
            await prisma.language.upsert({
                where: { code },
                update: { isVisible: true },
                create: { code, name: code === 'en' ? 'English' : code === 'ar' ? 'Arabic' : 'Persian', isVisible: true }
            });
        }
        console.log('✔ Languages ensured');

        console.log('Step 1: Ensuring Category...');
        let category = await prisma.articleCategory.upsert({
            where: { key: 'news' },
            create: { key: 'news' },
            update: {}
        });

        for (const code of langCodes) {
            const name = code === 'en' ? 'News & Analysis' : code === 'ar' ? 'أخبار وتحليلات' : 'اخبار و تحلیل';
            const slug = `category-news-${code}`;
            const existingTrans = await prisma.articleCategoryTranslation.findUnique({
                where: { categoryId_languageCode: { categoryId: category.id, languageCode: code } }
            });
            if (!existingTrans) {
                const seo = await prisma.seoFields.create({ data: { title: name, description: `Read ${name}` } });
                await prisma.articleCategoryTranslation.create({
                    data: { categoryId: category.id, languageCode: code, name, slug, seoId: seo.id }
                });
            }
        }
        console.log('✔ Category ensured');

        console.log('Step 2: Checking Articles...');
        const count = await prisma.article.count();
        console.log(`Current article count: ${count}`);

        if (count === 0) {
            console.log('Seeding one article...');
            const article = await prisma.article.create({
                data: { categoryId: category.id, published: true, isFeatured: true }
            });

            const seo = await prisma.seoFields.create({ data: { title: 'Welcome', description: 'Welcome' } });
            await prisma.articleTranslation.create({
                data: {
                    articleId: article.id,
                    languageCode: 'en',
                    title: 'Welcome to LiveBaz',
                    content: 'This is your new sports platform.',
                    slug: 'welcome-livebaz',
                    seoId: seo.id
                }
            });
            console.log('✔ Article seeded');
        }

        console.log('Step 3: Publishing Matches...');
        const res = await prisma.matchTranslation.updateMany({
            where: { status: 'DRAFT' },
            data: { status: 'PUBLISHED' }
        });
        console.log(`✔ Published ${res.count} match translations`);

        console.log('Step 4: Site Settings...');
        const s = await prisma.siteSettings.findFirst();
        if (!s) {
            await prisma.siteSettings.create({
                data: { siteName: 'LiveBaz', globalTitle: 'LiveBaz', globalDesc: 'Sports Analysis', globalBrandColor: '#2563eb' }
            });
        }
        console.log('✔ Site settings ensured');

    } catch (err) {
        console.error('ERROR during fix:', err);
    }

    console.log('--- Global Fix Complete ---');
}

main().finally(() => prisma.$disconnect());
