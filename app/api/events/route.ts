import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    try {
        // Fetch upcoming scheduled matches from DB
        const matches = await prisma.match.findMany({
            where: {
                status: 'SCHEDULED',
                date: { gte: new Date() }
            },
            take: limit,
            orderBy: {
                date: 'asc'
            },
            include: {
                league: {
                    include: {
                        translations: {
                            where: { languageCode: 'en' }
                        }
                    }
                },
                translations: {
                    where: { languageCode: 'en' }
                }
            }
        });

        // Map to a format similar to what the frontend might expect, or a cleaner one
        const events = matches.map(m => ({
            id: m.id,
            sport_key: m.league.translations[0]?.slug || 'soccer', // approximated
            sport_title: m.league.translations[0]?.name || 'Soccer',
            commence_time: m.date.toISOString(),
            home_team: m.homeTeam,
            away_team: m.awayTeam,
            api_id: m.apiSportsId
        }));

        return NextResponse.json({
            success: true,
            data: events,
            total: events.length,
        });
    } catch (error: any) {
        console.error('Events DB Error:', error.message);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}
