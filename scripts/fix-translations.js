
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMissingTranslations() {
    console.log("Fixing missing translations for matches...");

    const languages = await prisma.language.findMany({ where: { isVisible: true } });
    const matches = await prisma.match.findMany({
        include: { translations: true }
    });

    console.log(`Checking ${matches.length} matches...`);

    let fixedCount = 0;

    for (const match of matches) {
        const existingCodes = match.translations.map(t => t.languageCode);
        const missingLangs = languages.filter(l => !existingCodes.includes(l.code));

        if (missingLangs.length > 0) {
            console.log(`Fixing ${match.homeTeam} vs ${match.awayTeam} - Missing: ${missingLangs.map(l => l.code).join(', ')}`);

            for (const lang of missingLangs) {
                // Find 'en' translation to base others on
                const enTrans = match.translations.find(t => t.languageCode === 'en');
                const baseName = enTrans?.name || `${match.homeTeam} vs ${match.awayTeam}`;
                const baseSlug = enTrans?.slug || `${match.homeTeam}-vs-${match.awayTeam}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                try {
                    await prisma.matchTranslation.create({
                        data: {
                            match: { connect: { id: match.id } },
                            language: { connect: { code: lang.code } },
                            name: baseName,
                            slug: `${baseSlug}-${lang.code}-${Date.now()}`,
                            seo: {
                                create: {
                                    title: baseName,
                                    description: `Predictions for ${baseName}`
                                }
                            }
                        }
                    });
                    fixedCount++;
                } catch (e) {
                    console.error(`Error fixing ${match.id} for lang ${lang.code}: ${e.message}`);
                }
            }
        }
    }

    console.log(`Cleanup finished. Created ${fixedCount} translations.`);
    await prisma.$disconnect();
}

fixMissingTranslations();
