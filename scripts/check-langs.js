
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLangs() {
    const langs = await prisma.language.findMany();
    console.log("Languages in DB:");
    langs.forEach(l => console.log(`${l.code}: ${l.name} | Visible: ${l.isVisible}`));
    await prisma.$disconnect();
}

checkLangs();
