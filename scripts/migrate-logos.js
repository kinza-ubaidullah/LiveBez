const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

// Reliable backup URLs for the problematic 404s
const FALLBACKS = {
    '1xbet': 'https://res.cloudinary.com/dk7zp0mcj/image/upload/v1707475100/1xbet_fallback.png',
    'betway': 'https://res.cloudinary.com/dk7zp0mcj/image/upload/v1707475101/betway_fallback.png'
};

// Searching for direct, stable images to host on Cloudinary
const STABLE_MAP = {
    '1xbet': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/1XBET_logo.svg',
    'betway': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Betway_Logo.svg',
    'bet365': 'https://upload.wikimedia.org/wikipedia/commons/2/22/Bet365_logo.svg',
    'melbet': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Melbet_logo.svg',
    '22bet': 'https://upload.wikimedia.org/wikipedia/commons/c/c3/22Bet_Logo.png'
};

async function fixLogos() {
    console.log('--- Logo Cloudinary Migration & Fix ---');

    const bookmakers = await prisma.bookmaker.findMany({
        include: {
            translations: {
                where: { languageCode: 'en' }
            }
        }
    });

    for (const bm of bookmakers) {
        const name = bm.translations[0]?.name || 'Unknown';
        let currentLogo = bm.logoUrl;

        console.log(`\nChecking: ${name}`);

        if (currentLogo && currentLogo.includes('cloudinary.com')) {
            console.log(`✅ Already hosted on Cloudinary.`);
            continue;
        }

        // Check if we need to swap failing URLs with stable ones before migration
        const key = name.toLowerCase().replace(/\s+/g, '');
        if (STABLE_MAP[key]) {
            console.log(`🔄 Swapping brittle URL for stable source for ${name}`);
            currentLogo = STABLE_MAP[key];
        }

        if (!currentLogo) {
            console.log(`⚠️ No logo URL found for ${name}. Skipping.`);
            continue;
        }

        try {
            console.log(`📤 Uploading to Cloudinary: ${currentLogo}`);
            const result = await cloudinary.uploader.upload(currentLogo, {
                folder: 'livebez/bookmakers',
                public_id: name.toLowerCase().replace(/\s+/g, '_'),
                overwrite: true,
            });

            await prisma.bookmaker.update({
                where: { id: bm.id },
                data: { logoUrl: result.secure_url }
            });

            console.log(`✨ DONE: ${result.secure_url}`);
        } catch (error) {
            console.error(`❌ Migration failed for ${name}:`, error.message);
            // If it failed because the URL was 404, we might need a placeholder or specific fix
        }
    }
}

fixLogos()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
