import { NextRequest, NextResponse } from "next/server";
import { apiSports } from "@/lib/sports-api";
import prisma from "@/lib/db";
import { calculateLiveProbability } from "@/lib/live-algorithm";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const lang = searchParams.get('lang') || 'en';

        console.log(`🔌 Connecting to Real Sports API for Live Scores (Lang: ${lang})...`);

        // Fetch live matches
        const liveMatches = await apiSports.getLiveScores({ live: 'all' });
        console.log(`✅ API Response Received: ${liveMatches?.length || 0} live matches found.`);

        if (!liveMatches || liveMatches.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // Get predictions for these matches from our DB
        const apiMatchIds = liveMatches.map((m: any) => m.fixture.id.toString());

        const dbMatches = await prisma.match.findMany({
            where: { apiSportsId: { in: apiMatchIds } },
            include: {
                prediction: true,
                translations: {
                    where: { languageCode: lang }
                }
            }
        });

        const predictionsMap = new Map();
        dbMatches.forEach(m => {
            if (m.apiSportsId && m.prediction) {
                predictionsMap.set(m.apiSportsId, m.prediction);
            }
        });

        // Group by League
        const leaguesMap = new Map();

        liveMatches.forEach((m: any) => {
            const leagueId = m.league.id;
            const leagueName = m.league.name;
            const leagueLogo = m.league.logo;

            if (!leaguesMap.has(leagueId)) {
                leaguesMap.set(leagueId, {
                    id: leagueId,
                    name: leagueName,
                    logo: leagueLogo,
                    matches: []
                });
            }

            const pred = predictionsMap.get(m.fixture.id.toString());

            // Apply Live Algorithm
            let finalPredictions = null;
            let liveTip = null;
            if (pred) {
                finalPredictions = calculateLiveProbability(
                    { home: pred.winProbHome, draw: pred.winProbDraw, away: pred.winProbAway },
                    { home: m.goals.home ?? 0, away: m.goals.away ?? 0 },
                    m.fixture.status.elapsed,
                    m.fixture.status.short
                );

                // Derive tip from live probabilities
                if (finalPredictions.home >= 50) liveTip = "Home Win";
                else if (finalPredictions.away >= 50) liveTip = "Away Win";
                else if (finalPredictions.draw >= 50) liveTip = "Draw";
                else if (finalPredictions.home > finalPredictions.away) liveTip = "Home or Draw";
                else liveTip = "Away or Draw";
            }

            // Get match slug for the requested language
            const matchRecord = dbMatches.find(d => d.apiSportsId === m.fixture.id.toString());
            const matchSlug = matchRecord?.translations[0]?.slug;

            leaguesMap.get(leagueId).matches.push({
                id: m.fixture.id.toString(),
                homeTeam: m.teams.home.name,
                homeTeamLogo: m.teams.home.logo,
                awayTeam: m.teams.away.name,
                awayTeamLogo: m.teams.away.logo,
                homeScore: m.goals.home ?? 0,
                awayScore: m.goals.away ?? 0,
                time: m.fixture.status.elapsed ? `${m.fixture.status.elapsed}'` : 'LIVE',
                status: m.fixture.status.short,
                prediction: finalPredictions ?? null,
                liveTip: liveTip,
                matchSlug: matchSlug
            });
        });

        const result = Array.from(leaguesMap.values());

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Live Score API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch live scores" }, { status: 500 });
    }
}
