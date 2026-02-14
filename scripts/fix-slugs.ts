import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('Fixing MatchTranslation slugs...')
    const translations = await prisma.matchTranslation.findMany({
        where: { slug: { equals: "" } },
        include: { match: true }
    })

    for (const trans of translations) {
        const newSlug = `${trans.match.homeTeam.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-vs-${trans.match.awayTeam.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${trans.languageCode}`
        await prisma.matchTranslation.update({
            where: { id: trans.id },
            data: { slug: newSlug }
        })
        console.log(`Updated slug for ${trans.name} to ${newSlug}`)
    }
    console.log('Done.')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
