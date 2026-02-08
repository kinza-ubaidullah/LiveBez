"use server";

import prisma from "@/lib/db";
import { oddsApi, SOCCER_SPORTS, Event, OddsEvent } from "@/lib/odds-api";
import { apiSports } from "@/lib/sports-api";
import { revalidatePath } from "next/cache";

interface SyncResult {
    success: boolean;
    created: number;
    updated: number;
    errors: string[];
}

/**
 * Sync fixtures from The Odds API for a specific sport
 */
export async function syncFixtures(sportKey: string = SOCCER_SPORTS.EPL): Promise<SyncResult> {
    const result: SyncResult = {
        success: false,
        created: 0,
        updated: 0,
        errors: [],
    };

    try {
        // Get all languages for translations
        const languages = await prisma.language.findMany();

        // Get league for this sport (or create placeholder)
        let league = await prisma.league.findFirst({
            where: {
                translations: {
                    some: {
                        slug: { contains: sportKey.replace('soccer_', '') }
                    }
                }
            }
        });

        if (!league) {
            // Create a placeholder league
            league = await prisma.league.create({
                data: {
                    country: getSportCountry(sportKey, 'en'),
                    logoUrl: getSportLogo(sportKey),
                    translations: {
                        create: languages.map(lang => ({
                            language: { connect: { code: lang.code } },
                            name: getSportTitle(sportKey, lang.code),
                            slug: `${sportKey.replace('soccer_', '')}-${lang.code}`,
                            description: `Fixtures and predictions for ${getSportTitle(sportKey, lang.code)}`,
                            seo: {
                                create: {
                                    title: getSportTitle(sportKey, lang.code),
                                    description: `Live scores and predictions for ${getSportTitle(sportKey, lang.code)}`,
                                }
                            }
                        }))
                    }
                }
            });
        }

        // Fetch events from API
        const eventsResponse = await oddsApi.getEvents(sportKey);
        const events = eventsResponse.data;

        // Fetch odds for these events
        let oddsData: OddsEvent[] = [];
        try {
            const oddsResponse = await oddsApi.getOdds(sportKey, {
                regions: 'eu',
                markets: 'h2h,btts,totals',
            });
            oddsData = oddsResponse.data;
        } catch (err) {
            result.errors.push('Could not fetch odds data');
        }

        // Fetch API-Sports fixtures for logo enrichment
        const apiSportsLeagueId = getApiSportsLeagueId(sportKey);
        let apiSportsFixtures: any[] = [];
        if (apiSportsLeagueId) {
            try {
                const today = new Date().toISOString().split('T')[0];
                apiSportsFixtures = await apiSports.getLiveScores({
                    league: apiSportsLeagueId.toString(),
                    season: '2025'
                });
            } catch (err) {
                console.error(`[Sync] Failed to fetch logos for ${sportKey}:`, err);
            }
        }

        // Process each event
        for (const event of events) {
            try {
                // Check if match already exists (by API ID stored in a field)
                const existingMatch = await prisma.match.findFirst({
                    where: {
                        date: new Date(event.commence_time),
                        homeTeam: event.home_team,
                        awayTeam: event.away_team
                    },
                    include: { prediction: true }
                });

                // Get odds for this event
                const eventOdds = oddsData.find(o => o.id === event.id);
                const h2hOdds = extractH2HOdds(eventOdds);
                const bttsProb = extractBTTSProb(eventOdds);
                const totalsProb = extractTotalsProb(eventOdds);

                // Find API Logo match
                const apiMatch = apiSportsFixtures.find(f => isMatch(f.teams.home.name, event.home_team) && isMatch(f.teams.away.name, event.away_team));

                // Ensure Teams exist
                const [homeTeam, awayTeam] = await Promise.all([
                    ensureTeam(event.home_team, apiMatch?.teams.home.logo, languages),
                    ensureTeam(event.away_team, apiMatch?.teams.away.logo, languages)
                ]);

                if (existingMatch) {
                    // Update existing match with latest odds and logos if missing

                    if (h2hOdds) {
                        await prisma.prediction.upsert({
                            where: { matchId: existingMatch.id },
                            update: (existingMatch as any).prediction?.isManual ? {} : {
                                winProbHome: h2hOdds.home,
                                winProbDraw: h2hOdds.draw,
                                winProbAway: h2hOdds.away,
                                bttsProb: bttsProb,
                                overProb: totalsProb?.over,
                                underProb: totalsProb?.under,
                            },
                            create: {
                                matchId: existingMatch.id,
                                winProbHome: h2hOdds.home,
                                winProbDraw: h2hOdds.draw,
                                winProbAway: h2hOdds.away,
                                bttsProb: bttsProb,
                                overProb: totalsProb?.over,
                                underProb: totalsProb?.under,
                            }
                        });
                    }

                    // Update logos if not present
                    if (apiMatch) {
                        await prisma.match.update({
                            where: { id: existingMatch.id },
                            data: {
                                homeTeamLogo: apiMatch.teams.home.logo,
                                awayTeamLogo: apiMatch.teams.away.logo,
                                apiSportsId: apiMatch.fixture.id.toString(),
                                homeTeamId: homeTeam.id,
                                awayTeamId: awayTeam.id
                            } as any
                        });
                    }

                    // Ensure translations exist for all languages
                    for (const lang of languages) {
                        const existingTrans = await prisma.matchTranslation.findFirst({
                            where: { matchId: existingMatch.id, languageCode: lang.code }
                        });

                        if (!existingTrans) {
                            await prisma.matchTranslation.create({
                                data: {
                                    match: { connect: { id: existingMatch.id } },
                                    language: { connect: { code: lang.code } },
                                    name: `${event.home_team} vs ${event.away_team}`,
                                    slug: `${event.home_team.toLowerCase().replace(/\s+/g, '-')}-vs-${event.away_team.toLowerCase().replace(/\s+/g, '-')}-${lang.code}-${Date.now()}`,
                                    seo: {
                                        create: {
                                            title: `${event.home_team} vs ${event.away_team} - Predictions`,
                                            description: `Match preview, odds and predictions for ${event.home_team} vs ${event.away_team}`,
                                        }
                                    }
                                }
                            });
                        }
                    }
                    result.updated++;
                } else {
                    // Create new match with logos
                    const apiMatch = apiSportsFixtures.find(f => isMatch(f.teams.home.name, event.home_team) && isMatch(f.teams.away.name, event.away_team));

                    const newMatch = await prisma.match.create({
                        data: {
                            date: new Date(event.commence_time),
                            homeTeam: event.home_team,
                            awayTeam: event.away_team,
                            homeTeamId: homeTeam.id,
                            awayTeamId: awayTeam.id,
                            leagueId: league.id,
                            homeTeamLogo: apiMatch?.teams.home.logo,
                            awayTeamLogo: apiMatch?.teams.away.logo,
                            apiSportsId: apiMatch?.fixture.id.toString(),
                            status: 'SCHEDULED',
                            mainTip: h2hOdds ? getBestTip(h2hOdds) : null,
                            confidence: h2hOdds ? calculateConfidence(h2hOdds) : null,
                            translations: {
                                create: languages.map(lang => ({
                                    language: { connect: { code: lang.code } },
                                    name: `${event.home_team} vs ${event.away_team}`,
                                    slug: `${event.home_team.toLowerCase().replace(/\s+/g, '-')}-vs-${event.away_team.toLowerCase().replace(/\s+/g, '-')}-${lang.code}-${Date.now()}`,
                                    seo: {
                                        create: {
                                            title: `${event.home_team} vs ${event.away_team} - Predictions`,
                                            description: `Match preview, odds and predictions for ${event.home_team} vs ${event.away_team}`,
                                        }
                                    }
                                }))
                            },
                            prediction: h2hOdds ? {
                                create: {
                                    winProbHome: h2hOdds.home,
                                    winProbDraw: h2hOdds.draw,
                                    winProbAway: h2hOdds.away,
                                    bttsProb: bttsProb,
                                    overProb: totalsProb?.over,
                                    underProb: totalsProb?.under,
                                }
                            } : undefined
                        } as any
                    });
                    result.created++;
                }
            } catch (err: any) {
                result.errors.push(`Error processing ${event.home_team} vs ${event.away_team}: ${err.message}`);
            }
        }

        result.success = true;
        revalidatePath('/admin/matches');
        revalidatePath('/[lang]', 'layout');

    } catch (error: any) {
        result.errors.push(`Sync failed: ${error.message}`);
    }

    return result;
}

/**
 * Sync live scores from API-Sports
 */
const normalizeName = (name: string) => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]/g, ' ')      // Replace non-alphanumeric with spaces
        .trim()
        .replace(/\s+/g, ' ');           // Collapse multiple spaces
};

const isMatch = (name1: string, name2: string) => {
    const n1 = normalizeName(name1);
    const n2 = normalizeName(name2);
    return n1.includes(n2) || n2.includes(n1);
};

export async function syncLiveScores(): Promise<SyncResult> {
    const result: SyncResult = {
        success: false,
        created: 0,
        updated: 0,
        errors: [],
    };

    try {
        const today = new Date().toISOString().split('T')[0];
        const liveFixtures = await apiSports.getLiveScores({
            date: today,
            season: '2025'
        });

        const dbMatches = await prisma.match.findMany({
            where: {
                status: { in: ['SCHEDULED', 'LIVE'] }
            }
        });

        for (const fixture of liveFixtures) {
            try {
                const homeName = fixture.teams.home.name;
                const awayName = fixture.teams.away.name;

                // Use robust matching
                const match = dbMatches.find(m =>
                    isMatch(m.homeTeam, homeName) && isMatch(m.awayTeam, awayName)
                );

                if (match) {
                    await prisma.match.update({
                        where: { id: match.id },
                        data: {
                            status: mapApiSportsStatus(fixture.fixture.status.short),
                            homeScore: fixture.goals.home,
                            awayScore: fixture.goals.away,
                            minute: fixture.fixture.status.elapsed,
                            apiSportsId: fixture.fixture.id.toString(), // Link it for next time!
                            homeTeamLogo: fixture.teams.home.logo,
                            awayTeamLogo: fixture.teams.away.logo
                        }
                    });
                    result.updated++;
                }
            } catch (err: any) {
                result.errors.push(`Error syncing live fixture ${fixture.teams.home.name}: ${err.message}`);
            }
        }

        result.success = true;
        revalidatePath('/[lang]', 'layout');
    } catch (error: any) {
        result.errors.push(`Live sync failed: ${error.message}`);
    }

    return result;
}

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

// Helper functions
function getSportCountry(sportKey: string, lang: string = 'en'): string {
    const map: Record<string, Record<string, string>> = {
        'soccer_epl': { en: 'England', fa: 'انگلستان', ar: 'إنجلترا' },
        'soccer_spain_la_liga': { en: 'Spain', fa: 'اسپانیا', ar: 'إسبانيا' },
        'soccer_germany_bundesliga': { en: 'Germany', fa: 'آلمان', ar: 'ألمانيا' },
        'soccer_italy_serie_a': { en: 'Italy', fa: 'ایتالیا', ar: 'إيطاليا' },
        'soccer_france_ligue_one': { en: 'France', fa: 'فرانسه', ar: 'فرنسا' },
    };
    return map[sportKey]?.[lang] || map[sportKey]?.['en'] || 'International';
}

function getSportTitle(sportKey: string, lang: string = 'en'): string {
    const map: Record<string, Record<string, string>> = {
        'soccer_epl': { en: 'Premier League', fa: 'لیگ برتر', ar: 'الدوري الإنجليزي الممتاز' },
        'soccer_spain_la_liga': { en: 'La Liga', fa: 'لالیگا', ar: 'الدوري الإسباني' },
        'soccer_germany_bundesliga': { en: 'Bundesliga', fa: 'بوندسلیگا', ar: 'الدوري الألماني' },
        'soccer_italy_serie_a': { en: 'Serie A', fa: 'سری آ', ar: 'الدوري الإيطالي' },
        'soccer_france_ligue_one': { en: 'Ligue 1', fa: 'لوشامپیونه', ar: 'الدوري الفرنسي' },
    };
    return map[sportKey]?.[lang] || map[sportKey]?.['en'] || sportKey;
}

function getSportLogo(sportKey: string): string {
    const map: Record<string, string> = {
        'soccer_epl': 'https://media.api-sports.io/football/leagues/39.png',
        'soccer_spain_la_liga': 'https://media.api-sports.io/football/leagues/140.png',
        'soccer_germany_bundesliga': 'https://media.api-sports.io/football/leagues/78.png',
        'soccer_italy_serie_a': 'https://media.api-sports.io/football/leagues/135.png',
        'soccer_france_ligue_one': 'https://media.api-sports.io/football/leagues/61.png',
    };
    return map[sportKey] || '';
}

function getApiSportsLeagueId(sportKey: string): number {
    const map: Record<string, number> = {
        'soccer_epl': 39,
        'soccer_spain_la_liga': 140,
        'soccer_germany_bundesliga': 78,
        'soccer_italy_serie_a': 135,
        'soccer_france_ligue_one': 61,
    };
    return map[sportKey] || 0;
}

function extractH2HOdds(event?: OddsEvent): { home: number; draw: number; away: number } | null {
    if (!event?.bookmakers?.length) return null;

    // Get first bookmaker with h2h market
    for (const bookmaker of event.bookmakers) {
        const h2hMarket = bookmaker.markets?.find(m => m.key === 'h2h');
        if (!h2hMarket) continue;

        const homeOutcome = h2hMarket.outcomes.find(o => o.name === event.home_team);
        const awayOutcome = h2hMarket.outcomes.find(o => o.name === event.away_team);
        const drawOutcome = h2hMarket.outcomes.find(o => o.name === 'Draw');

        if (homeOutcome && awayOutcome) {
            // Convert decimal odds to implied probability
            const homeProb = (1 / homeOutcome.price) * 100;
            const awayProb = (1 / awayOutcome.price) * 100;
            const drawProb = drawOutcome ? (1 / drawOutcome.price) * 100 : 0;

            // Normalize to 100%
            const total = homeProb + awayProb + drawProb;
            return {
                home: Math.round((homeProb / total) * 100),
                draw: Math.round((drawProb / total) * 100),
                away: Math.round((awayProb / total) * 100),
            };
        }
    }

    return null;
}

function extractBTTSProb(event?: OddsEvent): number | null {
    if (!event?.bookmakers?.length) return null;

    for (const bookmaker of event.bookmakers) {
        const bttsMarket = bookmaker.markets?.find(m => m.key === 'btts');
        if (!bttsMarket) continue;

        const yesOutcome = bttsMarket.outcomes.find(o => o.name === 'Yes');
        const noOutcome = bttsMarket.outcomes.find(o => o.name === 'No');

        if (yesOutcome && noOutcome) {
            const yesProb = 1 / yesOutcome.price;
            const noProb = 1 / noOutcome.price;
            return Math.round((yesProb / (yesProb + noProb)) * 100);
        }
    }
    return null;
}

function extractTotalsProb(event?: OddsEvent): { over: number; under: number } | null {
    if (!event?.bookmakers?.length) return null;

    for (const bookmaker of event.bookmakers) {
        const totalsMarket = bookmaker.markets?.find(m => m.key === 'totals');
        if (!totalsMarket) continue;

        // Specifically look for Over/Under 2.5
        const over25 = totalsMarket.outcomes.find(o => o.name === 'Over' && o.point === 2.5);
        const under25 = totalsMarket.outcomes.find(o => o.name === 'Under' && o.point === 2.5);

        if (over25 && under25) {
            const overProb = 1 / over25.price;
            const underProb = 1 / under25.price;
            const total = overProb + underProb;
            return {
                over: Math.round((overProb / total) * 100),
                under: Math.round((underProb / total) * 100)
            };
        }
    }
    return null;
}

function getBestTip(odds: { home: number; draw: number; away: number }): string {
    if (odds.home > odds.away && odds.home > odds.draw) return 'Home Win';
    if (odds.away > odds.home && odds.away > odds.draw) return 'Away Win';
    return 'Draw';
}

function calculateConfidence(odds: { home: number; draw: number; away: number }): number {
    return Math.max(odds.home, odds.draw, odds.away);
}

async function ensureTeam(name: string, logo: string | undefined, languages: any[]) {
    let team = await (prisma as any).team.findFirst({
        where: {
            translations: {
                some: { name: name }
            }
        }
    });

    if (!team) {
        team = await (prisma as any).team.create({
            data: {
                logoUrl: logo,
                translations: {
                    create: languages.map(lang => ({
                        language: { connect: { code: lang.code } },
                        name: name,
                        slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${lang.code}-${Date.now()}`,
                        seo: {
                            create: {
                                title: `${name} - Team Profile & Predictions`,
                                description: `Latest scores, form and predictions for ${name}.`,
                            } as any
                        }
                    }))
                }
            }
        });
    } else if (logo && !team.logoUrl) {
        await (prisma as any).team.update({
            where: { id: team.id },
            data: { logoUrl: logo }
        });
    }

    return team;
}
