"use server";

import prisma from "@/lib/db";
import { apiSports, MatchScore } from "@/lib/sports-api";
import { revalidatePath } from "next/cache";
import { syncAndAnalyzeMatch } from "@/lib/analysis-service";

interface SyncResult {
    success: boolean;
    created: number;
    updated: number;
    errors: string[];
}

const LEAGUE_MAPPING: Record<string, number> = {
    'soccer_epl': 39,
    'soccer_spain_la_liga': 140,
    'soccer_germany_bundesliga': 78,
    'soccer_italy_serie_a': 135,
    'soccer_france_ligue_one': 61,
    'soccer_uefa_champs_league': 2,
    'soccer_uefa_europa_league': 3,
};

/**
 * Sync fixtures from API-Sports
 */
export async function syncFixtures(sportKey: string = 'soccer_epl'): Promise<SyncResult> {
    const result: SyncResult = {
        success: false,
        created: 0,
        updated: 0,
        errors: [],
    };

    const leagueId = LEAGUE_MAPPING[sportKey] || 39; // Default to EPL
    const season = new Date().getFullYear();

    try {
        // 1. Fetch Fixtures (Next 30 days)
        // API-Sports 'next' param is nice but we might want specific season fixtures
        // Let's use 'next' for simplicity and relevance
        const fixtures = await apiSports.getLiveScores({
            league: leagueId.toString(),
            next: '30'
        });

        // 2. Fetch Standings (to ensure League details are up to date)
        let leagueData = null;
        try {
            const standings = await apiSports.getStandings(leagueId.toString(), season.toString());
            if (standings && standings.length > 0) {
                leagueData = standings[0].league;
            }
        } catch (e) {
            console.warn("Could not fetch standings for league info, utilizing fixture data fallback.");
        }

        // 3. Upsert League
        const languages = await prisma.language.findMany();

        // Use league data from standings or fallback to first fixture
        const targetLeague = leagueData || (fixtures.length > 0 ? fixtures[0].league : null);

        if (!targetLeague) {
            console.log("No data found for this league.");
            return { ...result, errors: ["No data found from API-Sports"] };
        }

        const dbLeague = await upsertLeague(targetLeague, languages);

        // 4. Process Matches
        for (const f of fixtures) {
            try {
                // Upsert Teams
                const homeTeam = await ensureTeam(f.teams.home, languages);
                const awayTeam = await ensureTeam(f.teams.away, languages);

                const apiMatchId = f.fixture.id.toString();
                const matchDate = new Date(f.fixture.date);

                // Determine Status
                const status = mapApiSportsStatus(f.fixture.status.short);

                // Upsert Match
                // Check if exists by API ID
                let match = await prisma.match.findFirst({
                    where: { apiSportsId: apiMatchId }
                });

                if (!match) {
                    // Check by slug/names as fallback to prevent dupes from old system
                    match = await prisma.match.findFirst({
                        where: {
                            date: matchDate,
                            homeTeamId: homeTeam.id,
                            awayTeamId: awayTeam.id
                        }
                    });
                }

                const baseSlug = `${f.teams.home.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-vs-${f.teams.away.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${matchDate.toISOString().split('T')[0]}`;

                if (match) {
                    await prisma.match.update({
                        where: { id: match.id },
                        data: {
                            apiSportsId: apiMatchId,
                            status: status,
                            homeScore: f.goals.home,
                            awayScore: f.goals.away,
                            minute: f.fixture.status.elapsed,
                            homeTeamLogo: f.teams.home.logo,
                            awayTeamLogo: f.teams.away.logo,
                            leagueId: dbLeague.id
                        }
                    });
                    result.updated++;
                } else {
                    const newMatch = await prisma.match.create({
                        data: {
                            apiSportsId: apiMatchId,
                            date: matchDate,
                            status: status,
                            homeTeam: f.teams.home.name,
                            awayTeam: f.teams.away.name,
                            homeTeamId: homeTeam.id,
                            awayTeamId: awayTeam.id,
                            leagueId: dbLeague.id,
                            homeScore: f.goals.home,
                            awayScore: f.goals.away,
                            minute: f.fixture.status.elapsed,
                            homeTeamLogo: f.teams.home.logo,
                            awayTeamLogo: f.teams.away.logo,
                            isFeatured: [39, 140, 78, 135, 61, 2].includes(leagueId),
                            translations: {
                                create: languages.map(lang => ({
                                    language: { connect: { code: lang.code } },
                                    name: `${f.teams.home.name} vs ${f.teams.away.name}`,
                                    slug: `${baseSlug}-${lang.code}`,
                                    status: 'PUBLISHED',
                                    seo: {
                                        create: {
                                            title: `${f.teams.home.name} vs ${f.teams.away.name} - Score & Stats`,
                                            description: `Live score, real-time updates and stats for ${f.teams.home.name} vs ${f.teams.away.name}.`
                                        }
                                    }
                                }))
                            }
                        }
                    });

                    // Trigger Analysis for new matches
                    // We can use a lightweight analysis or just skip if no odds/deep data yet
                    // For now, let's trigger it so we have some content
                    setTimeout(() => {
                        syncAndAnalyzeMatch(newMatch.id, 'en', false).catch(console.error);
                    }, 500);

                    result.created++;
                }

            } catch (err: any) {
                console.error(`Error processing match ${f.teams.home.name} vs ${f.teams.away.name}:`, err);
                result.errors.push(err.message);
            }
        }

        result.success = true;
        revalidatePath('/admin/matches');
        revalidatePath('/[lang]', 'layout');

    } catch (error: any) {
        console.error("Sync Fixtures Error:", error);
        result.errors.push(error.message);
    }

    return result;
}

/**
 * Sync Live Scores (Real-time)
 */
export async function syncLiveScores(): Promise<SyncResult> {
    const result: SyncResult = {
        success: false,
        created: 0,
        updated: 0,
        errors: [],
    };

    try {
        const liveFixtures = await apiSports.getLiveScores({ live: 'all' });

        for (const f of liveFixtures) {
            try {
                const apiMatchId = f.fixture.id.toString();

                // Only update matches needed
                /* 
                   We try to find by apiSportsId first. 
                   If not found, we ignore (assuming we only want to track matches we've already imported via syncFixtures 
                   or matches that are relevant to our leagues). 
                   Actually, let's try to update any match we have in DB.
                */

                const match = await prisma.match.findFirst({
                    where: { apiSportsId: apiMatchId }
                });

                if (match) {
                    await prisma.match.update({
                        where: { id: match.id },
                        data: {
                            status: mapApiSportsStatus(f.fixture.status.short),
                            homeScore: f.goals.home,
                            awayScore: f.goals.away,
                            minute: f.fixture.status.elapsed,
                        }
                    });
                    result.updated++;
                }
            } catch (e: any) {
                // ignore individual errors
            }
        }

        result.success = true;
        revalidatePath('/[lang]', 'layout');
    } catch (err: any) {
        result.errors.push(err.message);
    }
    return result;
}

// Reuse helper for Status Mapping
function mapApiSportsStatus(short: string): any {
    const map: Record<string, string> = {
        'TBD': 'SCHEDULED',
        'NS': 'SCHEDULED',
        '1H': 'LIVE',
        'HT': 'LIVE',
        '2H': 'LIVE',
        'ET': 'LIVE',
        'P': 'LIVE',
        'FT': 'FINISHED',
        'AET': 'FINISHED',
        'PEN': 'FINISHED',
        'PST': 'POSTPONED',
        'CANC': 'POSTPONED',
        'ABD': 'POSTPONED',
    };
    return map[short] || 'SCHEDULED';
}

// Helpers
async function upsertLeague(apiLeague: any, languages: any[]) {
    const apiId = apiLeague.id.toString();

    let dbLeague = await prisma.league.findUnique({ where: { apiId } });

    if (!dbLeague) {
        // Try slug match before creating
        // Simplified for brevity, standard upsert logic
        const slug = apiLeague.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        dbLeague = await prisma.league.create({
            data: {
                apiId,
                country: apiLeague.country,
                logoUrl: apiLeague.logo,
                translations: {
                    create: languages.map(lang => ({
                        language: { connect: { code: lang.code } },
                        name: apiLeague.name,
                        slug: `${slug}-${lang.code}`,
                        seo: { create: { title: apiLeague.name, description: `Scores for ${apiLeague.name}` } }
                    }))
                }
            }
        });
    }
    return dbLeague;
}

async function ensureTeam(apiTeam: any, languages: any[]) {
    const apiId = apiTeam.id.toString();
    // We don't have apiId on Team model in previous schema (checked roughly), 
    // but let's assume we match by name if ID field missing or just update logic.
    // Ideally we should add apiId to Team model. For now, name matching is safer with existing schema.

    let team = await (prisma as any).team.findFirst({
        where: {
            translations: { some: { name: apiTeam.name } } // Exact name match
        }
    });

    if (!team) {
        // Create
        team = await (prisma as any).team.create({
            data: {
                logoUrl: apiTeam.logo,
                translations: {
                    create: languages.map(lang => ({
                        language: { connect: { code: lang.code } },
                        name: apiTeam.name,
                        slug: `${apiTeam.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${lang.code}-${Date.now()}`,
                        seo: {
                            create: { title: apiTeam.name, description: `Team ${apiTeam.name}` }
                        }
                    }))
                }
            }
        });
    }
    return team;
}
