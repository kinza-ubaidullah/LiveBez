import { NextRequest, NextResponse } from 'next/server';
import { apiSports } from '@/lib/sports-api';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // Revalidate every 10 minutes

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fixtureId = searchParams.get('fixtureId');

    if (!fixtureId) {
        return NextResponse.json({ success: false, error: 'fixtureId is required' }, { status: 400 });
    }

    try {
        const oddsData = await apiSports.getOdds(fixtureId);

        // Transform API-Sports odds to our simplified structure
        // API-Sports structure: response[0].bookmakers[].bets[]

        if (!oddsData || oddsData.length === 0) {
            return NextResponse.json({ success: true, odds: null });
        }

        const oddsItem = oddsData[0]; // Usually one item per fixture in response
        const bookmakers = oddsItem?.bookmakers || [];

        // Extract 1x2 and Over/Under
        const bestOdds: any = { h2h: {}, totals: {} };

        // Helper to update best odds
        const updateBest = (marketType: 'h2h' | 'totals', key: string, price: number, bookmaker: string) => {
            const current = bestOdds[marketType][key];
            if (!current || price > current.price) {
                bestOdds[marketType][key] = { price, bookmaker };
            }
        };

        bookmakers.forEach((bk: any) => {
            bk.bets.forEach((bet: any) => {
                if (bet.id === 1) { // Match Winner
                    bet.values.forEach((val: any) => {
                        if (val.value === 'Home') updateBest('h2h', 'Home', parseFloat(val.odd), bk.name);
                        else if (val.value === 'Away') updateBest('h2h', 'Away', parseFloat(val.odd), bk.name);
                        else if (val.value === 'Draw') updateBest('h2h', 'Draw', parseFloat(val.odd), bk.name);
                    });
                } else if (bet.id === 5) { // Goals Over/Under
                    bet.values.forEach((val: any) => {
                        const key = `${val.value}`; // Over 2.5 etc
                        updateBest('totals', key, parseFloat(val.odd), bk.name);
                    });
                }
            });
        });

        // Rename keys to match frontend expectation
        const formattedH2h: any = {};
        if (bestOdds.h2h.Home) formattedH2h[oddsItem.league?.country === 'USA' ? oddsItem.teams?.home?.name : 'Home'] = bestOdds.h2h.Home; // Keep it simple: Home/Draw/Away match logic in frontend expects team names? 
        // Actually frontend expects strictly keys that match team names OR just standard 1/X/2. 
        // Let's standardise to Home/Away/Draw and let Frontend map it?
        // Frontend logic: `const homeMatch = otherEntries.find...`
        // Simplest is to map to Team Names if possible, but API-Sports just gives 'Home'.
        // Let's rely on the frontend falling back or map it here if we have team names.
        // API-Sports odds response usually doesn't have team names in the "odds" part, but we might pass them?
        // Actually simpler: Just return standard keys 'Home', 'Draw', 'Away' and update Frontend to look for these explicitly if names fail.

        // Wait, the frontend `OddsDisplay` uses fuzzy matching on team names. 
        // Let's pass the raw bestOdds.h2h which has keys "Home", "Draw", "Away".
        // And we need to ensure Frontend handles "Home"/"Away" keys.

        return NextResponse.json({
            success: true,
            odds: {
                h2h: bestOdds.h2h,
                totals: bestOdds.totals
            }
        });

    } catch (error: any) {
        console.error('API-Sports Odds error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch odds' },
            { status: 500 }
        );
    }
}
