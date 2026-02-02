import { NextRequest, NextResponse } from 'next/server';
import { oddsApi, SOCCER_SPORTS } from '@/lib/odds-api';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport') || SOCCER_SPORTS.EPL;
    const markets = searchParams.get('markets') || 'h2h';

    try {
        const response = await oddsApi.getOdds(sport, {
            regions: 'eu,uk',
            markets: markets,
        });

        // Transform data for frontend consumption
        const events = response.data.map(event => ({
            id: event.id,
            homeTeam: event.home_team,
            awayTeam: event.away_team,
            commenceTime: event.commence_time,
            sportKey: event.sport_key,
            sportTitle: event.sport_title,
            odds: extractBestOdds(event.bookmakers, markets),
            bookmakers: event.bookmakers.slice(0, 5), // Top 5 bookmakers
        }));

        return NextResponse.json({
            success: true,
            data: events,
            quotaRemaining: response.remainingRequests,
        });
    } catch (error: any) {
        console.error('Odds API error:', error);

        if (error.message === 'API_RATE_LIMIT_EXCEEDED') {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to fetch odds' },
            { status: 500 }
        );
    }
}

function extractBestOdds(bookmakers: any[], markets: string) {
    const marketKeys = markets.split(',');
    const bestOdds: Record<string, any> = {};

    for (const marketKey of marketKeys) {
        let best: Record<string, { price: number; bookmaker: string }> = {};

        for (const bookmaker of bookmakers) {
            const market = bookmaker.markets?.find((m: any) => m.key === marketKey);
            if (!market) continue;

            for (const outcome of market.outcomes) {
                const key = outcome.name;
                if (!best[key] || outcome.price > best[key].price) {
                    best[key] = {
                        price: outcome.price,
                        bookmaker: bookmaker.title,
                    };
                }
            }
        }

        bestOdds[marketKey] = best;
    }

    return bestOdds;
}
