import prisma from './db';
import { apiSports } from './sports-api';

export async function getFullMatchDetails(matchId: string, apiSportsId: string) {
    // 1. Fetch from DB first
    const match = await prisma.match.findUnique({
        where: { id: matchId },
    });

    if (!match) return null;

    // Check if we already have stats/lineups/h2h and if they are fresh (e.g., less than 1 hour old or match is finished)
    if (match.stats && match.lineups && (match as any).h2h) {
        // If match is finished, don't refetch
        if (match.status === 'FT') return match;
    }

    if (!apiSportsId) {
        console.log(`[MatchService] Skipping API sync for match ${matchId} - No apiSportsId provided.`);
        return match;
    }

    try {
        const [stats, lineups, fixture, predictions] = await Promise.all([
            apiSports.getFixtureStatistics(apiSportsId),
            apiSports.getLineups(apiSportsId),
            apiSports.getFixture(apiSportsId),
            apiSports.getPredictions(apiSportsId)
        ]);

        let h2hData = null;
        if (fixture && fixture.teams) {
            h2hData = await apiSports.getH2H(fixture.teams.home.id.toString(), fixture.teams.away.id.toString());
        }

        // Update DB
        const updatedMatch = await prisma.match.update({
            where: { id: matchId },
            data: {
                stats: JSON.stringify(stats),
                lineups: JSON.stringify(lineups),
                h2h: JSON.stringify(h2hData),
                comparison: JSON.stringify(predictions?.comparison || null),
                predictionsFull: JSON.stringify(predictions || null),
                status: fixture?.fixture?.status?.short || match.status,
                homeScore: fixture?.goals?.home ?? match.homeScore,
                awayScore: fixture?.goals?.away ?? match.awayScore,
                minute: fixture?.fixture?.status?.elapsed ?? match.minute,
            } as any
        });

        return updatedMatch;
    } catch (error) {
        console.error('Error fetching full match details:', error);
        return match;
    }
}
