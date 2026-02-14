import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const bms = await prisma.bookmaker.findMany({
        include: { translations: true }
    })
    console.log('Result:', JSON.stringify(bms[0]?.translations[0], null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
