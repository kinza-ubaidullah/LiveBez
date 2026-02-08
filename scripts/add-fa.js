
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addPersian() {
    console.log("Adding Persian language to database...");

    try {
        const fa = await prisma.language.upsert({
            where: { code: 'fa' },
            update: { name: 'Persian', isVisible: true },
            create: { code: 'fa', name: 'Persian', isVisible: true }
        });
        console.log("Persian language added/updated successfully.");

        // Now trigger the fix-translations script logic for FA too
        const languages = [fa];
        const matches = await prisma.match.findMany({
            include: { translations: true }
        });

        let fixedCount = 0;
        for (const match of matches) {
            if (!match.translations.some(t => t.languageCode === 'fa')) {
                const enTrans = match.translations.find(t => t.languageCode === 'en');
                const baseName = enTrans?.name || `${match.homeTeam} vs ${match.awayTeam}`;
                const baseSlug = enTrans?.slug || `${match.homeTeam}-vs-${match.awayTeam}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                await prisma.matchTranslation.create({
                    data: {
                        match: { connect: { id: match.id } },
                        language: { connect: { code: 'fa' } },
                        name: baseName,
                        slug: `${baseSlug}-fa-${Date.now()}`,
                        seo: {
                            create: {
                                title: baseName,
                                description: `پیش‌بینی بازی ${baseName}`
                            }
                        }
                    }
                });
                fixedCount++;
            }
        }
        console.log(`Created ${fixedCount} Persian translations for existing matches.`);

    } catch (error) {
        console.error("Error adding Persian:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

addPersian();
