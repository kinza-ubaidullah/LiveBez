import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { calculateLiveProbability } from '@/lib/live-algorithm';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const match = await prisma.match.findUnique({
            where: { id },
            include: { prediction: true }
        });

        if (!match) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        // Apply Live Algorithm
        let finalPrediction = null;
        if (match.prediction) {
            finalPrediction = calculateLiveProbability(
                {
                    home: match.prediction.winProbHome,
                    draw: match.prediction.winProbDraw,
                    away: match.prediction.winProbAway
                },
                {
                    home: match.homeScore ?? 0,
                    away: match.awayScore ?? 0
                },
                match.minute,
                match.status
            );
        }

        return NextResponse.json({
            ...match,
            prediction: finalPrediction
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
