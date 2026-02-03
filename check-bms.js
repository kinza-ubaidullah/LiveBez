const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const bms = await prisma.bookmaker.findMany({
            include: { translations: true }
        });
        const result = bms.map(bm => ({
            name: bm.translations[0]?.name,
            logoUrl: bm.logoUrl,
            affiliateUrl: bm.translations[0]?.affiliateUrl
        }));
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
