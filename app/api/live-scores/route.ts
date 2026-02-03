import { NextResponse } from "next/server";
import { apiSports } from "@/lib/sports-api";

export async function GET() {
    try {
        console.log("🔌 Connecting to Real Sports API for Live Scores...");
        // Fetch live matches
        const liveMatches = await apiSports.getLiveScores({ live: 'all' });
        console.log(`✅ API Response Received: ${liveMatches?.length || 0} live matches found.`);

        if (!liveMatches || liveMatches.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        const formattedMatches = liveMatches.map((m: any) => ({
            id: m.fixture.id,
            homeTeam: m.teams.home.name,
            awayTeam: m.teams.away.name,
            homeScore: m.goals.home ?? 0,
            awayScore: m.goals.away ?? 0,
            time: m.fixture.status.elapsed ? `${m.fixture.status.elapsed}'` : 'LIVE',
            status: 'LIVE' // Simplifying for the ticker
        }));

        return NextResponse.json({ success: true, data: formattedMatches });
    } catch (error) {
        console.error("Live Score API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch live scores" }, { status: 500 });
    }
}
