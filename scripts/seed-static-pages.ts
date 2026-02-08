import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const pages = [
        { slug: 'about-us', title: 'About Us', content: 'Initial About Us content...' },
        { slug: 'privacy-policy', title: 'Privacy Policy', content: 'Initial Privacy Policy content...' },
        { slug: 'terms-of-service', title: 'Terms of Service', content: 'Initial Terms of Service content...' },
    ];

    const languages = await prisma.language.findMany();

    for (const pageData of pages) {
        const page = await prisma.staticPage.upsert({
            where: { slug: pageData.slug },
            update: {},
            create: { slug: pageData.slug },
        });

        for (const lang of languages) {
            await prisma.staticPageTranslation.upsert({
                where: {
                    pageId_languageCode: {
                        pageId: page.id,
                        languageCode: lang.code,
                    },
                },
                update: {},
                create: {
                    pageId: page.id,
                    languageCode: lang.code,
                    title: pageData.title,
                    content: pageData.content,
                },
            });
        }
    }

    console.log('✅ Static pages seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
