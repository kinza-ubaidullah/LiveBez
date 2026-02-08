import prisma from '../lib/db';
import { syncAndAnalyzeMatch } from '../lib/analysis-service';

async function main() {
    console.log('--- Force Analyzing Matches ---');
    const matches = await prisma.match.findMany({
        take: 5,
        orderBy: { date: 'desc' }
    });

    console.log(`Analyzing ${matches.length} matches...`);

    for (const m of matches) {
        console.log(`- Analyzing: ${m.homeTeam} vs ${m.awayTeam} (ID: ${m.id})`);
        const res = await syncAndAnalyzeMatch(m.id, 'en', true);
        if (res.success) {
            console.log('  ✔ Done');
        } else {
            console.log(`  ❌ Failed: ${res.error}`);
        }
    }
    console.log('--- Done ---');
}

main().catch(console.error);
