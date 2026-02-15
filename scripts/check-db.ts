
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    try {
        const matchesCount = await prisma.match.count();
        const predictionsCount = await prisma.prediction.count();
        const leaguesCount = await prisma.league.count();

        console.log('--- Database Stats ---');
        console.log('Total Leagues:', leaguesCount);
        console.log('Total Matches:', matchesCount);
        console.log('Total Predictions:', predictionsCount);

        if (predictionsCount === 0 && matchesCount > 0) {
            console.log('⚠️ Warning: You have matches but 0 predictions. Odds sync might be failing.');
        } else {
            console.log('✅ Predictions are present in the database.');
        }

        const samplePrediction = await prisma.prediction.findFirst();
        console.log('Sample Prediction:', JSON.stringify(samplePrediction, null, 2));

    } catch (e) {
        console.error('DB Check failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
