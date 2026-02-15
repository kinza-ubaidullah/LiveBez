import prisma from './db';
import { apiSports } from './sports-api';

export async function getFullMatchDetails(matchId: string, apiSportsId: string) {
    // 1. Fetch from DB first
    const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { league: true }
    });

    if (!match) return null;

    // Check if we already have stats/lineups/h2h and if they are fresh (e.g., less than 1 hour old or match is finished)
    if (match.stats && match.lineups && (match as any).h2h) {
        // If match is finished, don't refetch
        if (match.status === 'FT') {
            return {
                ...match,
                standings: (match.league as any)?.standings || null
            };
        }
    }

    if (!apiSportsId) {
        console.log(`[MatchService] Skipping API sync for match ${matchId} - No apiSportsId provided.`);
        return match;
    }

    try {
        const [stats, lineups, fixture, predictions, events] = await Promise.all([
            apiSports.getFixtureStatistics(apiSportsId),
            apiSports.getLineups(apiSportsId),
            apiSports.getFixture(apiSportsId),
            apiSports.getPredictions(apiSportsId),
            apiSports.getFixtureEvents(apiSportsId)
        ]);

        let h2hData = null;
        if (fixture && fixture.teams) {
            h2hData = await apiSports.getH2H(fixture.teams.home.id.toString(), fixture.teams.away.id.toString());
        }

        let standings = null;
        if (fixture?.league?.id) {
            const stands = await apiSports.getStandings(fixture.league.id.toString(), fixture.league.season?.toString());
            standings = stands;

            // Update League with standings if we found the league in our DB
            if (match.leagueId && standings) {
                // await prisma.league.update({
                //     where: { id: match.leagueId },
                //     data: { standings: JSON.stringify(standings) } as any
                // }).catch(err => console.error("Failed to update league standings", err));
            }
        }

        // Update DB
        const updatedMatch = await prisma.match.update({
            where: { id: matchId },
            data: {
                stats: JSON.stringify(stats),
                lineups: JSON.stringify(lineups),
                events: JSON.stringify(events),
                h2h: JSON.stringify(h2hData),
                comparison: JSON.stringify(predictions?.comparison || null),
                predictionsFull: JSON.stringify(predictions || null),
                status: fixture?.fixture?.status?.short || match.status,
                homeScore: fixture?.goals?.home ?? match.homeScore,
                awayScore: fixture?.goals?.away ?? match.awayScore,
                minute: fixture?.fixture?.status?.elapsed ?? match.minute,
            } as any
        });

        // Append standings to returned object (even though not on match model)
        return {
            ...updatedMatch,
            standings: standings ? JSON.stringify(standings) : null
        };
    } catch (error) {
        console.error('Error fetching full match details:', error);
        return match;
    }
}

export async function ensureMatchFromApi(apiId: string) {
    if (!apiId) return null;

    try {
        // Try to find in DB first by apiSportsId (requires schema change OR findFirst manual scan if apiSportsId is not indexed/unique, but let's assume valid apiSportsId)
        // Since apiSportsId is just a string field (not unique constraint in schema), findFirst is appropriate.
        let match = await prisma.match.findFirst({
            where: { apiSportsId: apiId },
            include: { translations: true, league: true }
        });

        if (match) return match;

        // Fetch fixture details
        const fixture = await apiSports.getFixture(apiId);
        if (!fixture) return null;

        // Ensure League Exists
        const leagueApiId = fixture.league.id;
        let league = await prisma.league.findFirst({
            where: { apiId: leagueApiId?.toString() }
        });

        if (!league) {
            // Fallback 1: Try to find "International" or similar
            league = await prisma.league.findFirst({
                where: { translations: { some: { name: { contains: 'International' } } } }
            });

            // Fallback 2: Find ANY league to attach to (better than crashing)
            if (!league) {
                league = await prisma.league.findFirst();
            }

            // Fallback 3: Create a placeholder league if DB is empty
            if (!league) {
                league = await prisma.league.create({
                    data: {
                        apiId: leagueApiId?.toString() || '0',
                        country: fixture.league.country || 'World',
                        logoUrl: fixture.league.logo,
                        translations: {
                            create: [{
                                language: { connect: { code: 'en' } },
                                name: fixture.league.name || 'Live Matches',
                                slug: `live-matches-${Date.now()}`,
                                seo: { create: { title: 'Live Matches', description: 'Live matches' } }
                            }]
                        }
                    }
                });
            }
        }

        // Create Match Stub
        const matchName = `${fixture.teams.home.name} vs ${fixture.teams.away.name}`;
        const slugBase = matchName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const langCode = 'en'; // Default

        // Check if slug exists
        const existingSlug = await prisma.matchTranslation.findUnique({
            where: { slug: `${slugBase}-${langCode}` }
        });

        const finalSlug = existingSlug ? `${slugBase}-${langCode}-${Date.now()}` : `${slugBase}-${langCode}`;

        match = await prisma.match.create({
            data: {
                date: new Date(fixture.fixture.date),
                homeTeam: fixture.teams.home.name,
                awayTeam: fixture.teams.away.name,
                leagueId: league.id,
                apiSportsId: apiId,
                status: fixture.fixture.status.short,
                homeScore: fixture.goals.home,
                awayScore: fixture.goals.away,
                homeTeamLogo: fixture.teams.home.logo,
                awayTeamLogo: fixture.teams.away.logo,
                translations: {
                    create: [{
                        language: { connect: { code: langCode } },
                        name: matchName,
                        slug: finalSlug,
                        seo: {
                            create: {
                                title: matchName,
                                description: `Live score and result for ${matchName}`
                            }
                        }
                    }]
                }
            },
            include: { translations: true, league: true }
        }) as any;

        return match;

    } catch (error) {
        console.error("Error ensuring match from API:", error);
        return null;
    }
}
