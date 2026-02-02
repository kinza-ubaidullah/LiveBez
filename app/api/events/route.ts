import { NextRequest, NextResponse } from 'next/server';
import { oddsApi, SOCCER_SPORTS, Event } from '@/lib/odds-api';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // Revalidate every 10 minutes (this is a free endpoint)

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport') || SOCCER_SPORTS.EPL;

    try {
        const response = await oddsApi.getEvents(sport);

        // Sort by commence time (upcoming first)
        const events = response.data.sort((a, b) =>
            new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime()
        );

        return NextResponse.json({
            success: true,
            data: events,
            total: events.length,
        });
    } catch (error: any) {
        console.error('Events API error:', error.message);

        // Return empty data for network errors (graceful degradation)
        if (error.message === 'API_NETWORK_ERROR' || error.message === 'API_RATE_LIMIT_EXCEEDED') {
            return NextResponse.json({
                success: true,
                data: [],
                total: 0,
                message: 'Live data temporarily unavailable. Showing cached content.',
            });
        }

        return NextResponse.json(
            { success: false, error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}
