import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const match = await prisma.match.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
                homeScore: true,
                awayScore: true,
                minute: true,
                date: true,
                homeTeam: true,
                awayTeam: true,
                homeTeamLogo: true,
                awayTeamLogo: true
            }
        });

        if (!match) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        return NextResponse.json(match);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
