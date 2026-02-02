import { NextRequest, NextResponse } from 'next/server';
import { apiSports } from '@/lib/sports-api';

export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds

export async function GET(request: NextRequest) {
    try {
        // Fetch real-time fixtures from API-Sports
        const fixtures = await apiSports.getLiveScores({ live: 'all' });

        if (!fixtures || fixtures.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
                total: 0,
            });
        }

        // Map API-Sports structure to our internal LiveMatch type
        const liveGames = fixtures.map((fixture: any) => ({
            id: fixture.fixture.id.toString(),
            homeTeam: fixture.teams.home.name,
            awayTeam: fixture.teams.away.name,
            homeScore: fixture.goals.home ?? 0,
            awayScore: fixture.goals.away ?? 0,
            time: fixture.fixture.status.elapsed ? `${fixture.fixture.status.elapsed}'` : 'LIVE',
            status: mapStatus(fixture.fixture.status.short),
            league: fixture.league.name
        }));

        return NextResponse.json({
            success: true,
            data: liveGames.slice(0, 15), // Return top 15 live games
            total: liveGames.length,
        });
    } catch (error: any) {
        console.error('Live scores API error (API-Sports):', error);

        return NextResponse.json(
            { success: false, error: 'Failed to fetch live scores' },
            { status: 500 }
        );
    }
}

function mapStatus(short: string): string {
    const map: Record<string, string> = {
        '1H': 'LIVE',
        '2H': 'LIVE',
        'HT': 'HALFTIME',
        'ET': 'LIVE',
        'P': 'LIVE',
        'FT': 'FINISHED',
        'AET': 'FINISHED',
        'PEN': 'FINISHED',
        'PST': 'POSTPONED',
        'CANC': 'POSTPONED',
        'ABD': 'POSTPONED',
    };
    return map[short] || 'LIVE';
}
