import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { apiSports } from '@/lib/sports-api';
import { syncAndAnalyzeMatch } from '@/lib/analysis-service';

export const dynamic = 'force-dynamic';

const POPULAR_LEAGUES = [39, 140, 135, 78, 61, 2, 3]; // EPL, La Liga, Serie A, Bundesliga, Ligue 1, UCL, UEL

async function upsertLeagueCached(leagueData: any, cache: Map<string, any>, languages: any[]) {
    const apiLeagueId = leagueData.id.toString();

    // Check cache
    if (cache.has(apiLeagueId)) {
        return cache.get(apiLeagueId);
    }

    let dbLeague = await prisma.league.findUnique({ where: { apiId: apiLeagueId } });

    if (!dbLeague) {
        const slug = leagueData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        const existingTrans = await prisma.leagueTranslation.findUnique({
            where: { slug: `${slug}-en` }, // Check EN slug
            include: { league: true }
        });

        if (existingTrans) {
            await prisma.league.update({
                where: { id: existingTrans.leagueId },
                data: { apiId: apiLeagueId, logoUrl: leagueData.logo }
            });
            dbLeague = await prisma.league.findUnique({ where: { id: existingTrans.leagueId } });
        } else {
            try {
                dbLeague = await prisma.league.create({
                    data: {
                        apiId: apiLeagueId,
                        country: leagueData.country,
                        logoUrl: leagueData.logo,
                        translations: {
                            create: languages.map(lang => ({
                                language: { connect: { code: lang.code } },
                                name: leagueData.name,
                                slug: `${slug}${lang.code === 'en' ? '' : '-' + lang.code}`,
                                seo: {
                                    create: {
                                        title: leagueData.name,
                                        description: `Live scores and stats for ${leagueData.name}`
                                    }
                                }
                            }))
                        }
                    }
                });
            } catch (error: any) {
                // Return existing league if race condition occurs (P2002)
                if (error.code === 'P2002') {
                    dbLeague = await prisma.league.findUnique({ where: { apiId: apiLeagueId } });
                } else {
                    console.error('Error creating league:', error);
                    // Return null to skip if we trigger an unrecoverable error
                    return null;
                }
            }
        }
    } else {
        // Optional: Update logo if changed
        if (dbLeague.logoUrl !== leagueData.logo) {
            await prisma.league.update({
                where: { id: dbLeague.id },
                data: { logoUrl: leagueData.logo }
            });
        }
    }

    if (dbLeague) {
        cache.set(apiLeagueId, dbLeague);
    }
    return dbLeague;
}

export async function GET(request: NextRequest) {
    try {
        let syncedCount = 0;
        let analysisCount = 0;

        // 1. Fetch Fixtures (Next 50 and Live) from API-Sports
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const autoAnalyze = searchParams.get('analyze') === 'true';

        console.log(`[Sync] Starting sync. Date: ${dateParam || 'Next 50'}`);

        const upcoming = await apiSports.getLiveScores(dateParam ? { date: dateParam } : { next: '50' });
        const live = dateParam ? [] : await apiSports.getLiveScores({ live: 'all' });

        // Deduplicate by ID
        const allMap = new Map();
        [...upcoming, ...live].forEach(f => allMap.set(f.fixture.id, f));
        const fixtures = Array.from(allMap.values());

        console.log(`[Sync] Found ${fixtures.length} fixtures to process.`);

        const languages = await prisma.language.findMany({ where: { isVisible: true } });
        const leagueCache = new Map<string, any>();

        // 2. Batch Fetch Existing Matches by API ID
        const apiMatchIds = fixtures.map(f => f.fixture.id.toString());
        const existingMatches = await prisma.match.findMany({
            where: { apiSportsId: { in: apiMatchIds } }
        });
        const matchMap = new Map<string, any>();
        existingMatches.forEach(m => matchMap.set(m.apiSportsId!, m));

        // 3. Prepare fallback check for missing matches (by slug)
        // Identify fixtures that are NOT in matchMap
        const missingMatchFixtures = fixtures.filter(f => !matchMap.has(f.fixture.id.toString()));
        const slugLookupMap = new Map<string, any>(); // Slug -> Fixture

        if (missingMatchFixtures.length > 0) {
            // Check finding matches by slug to link API ID
            const slugsToCheck: string[] = [];

            missingMatchFixtures.forEach(f => {
                const slugDate = new Date(f.fixture.date).toISOString().split('T')[0];
                const slugBase = `${f.teams.home.name}-vs-${f.teams.away.name}-${slugDate}`
                    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                // Check default language (en) or first available
                const checkSlug = `${slugBase}-${languages[0]?.code || 'en'}`;
                slugsToCheck.push(checkSlug);
                slugLookupMap.set(checkSlug, f);
            });

            const foundTranslations = await prisma.matchTranslation.findMany({
                where: { slug: { in: slugsToCheck } },
                select: { matchId: true, slug: true }
            });

            foundTranslations.forEach(t => {
                // Determine which fixture this corresponds to
                const f = slugLookupMap.get(t.slug);
                if (f) {
                    // We found a match ID for this fixture via slug
                    // Add to matchMap with a placeholder object or handle in loop
                    // Let's create a secondary map for "Found By Slug"
                    slugLookupMap.set('FOUND_' + f.fixture.id, t.matchId);
                }
            });
        }

        // 4. Processing Loop
        for (const f of fixtures) {
            const dbLeague = await upsertLeagueCached(f.league, leagueCache, languages);
            if (!dbLeague) continue;

            const apiMatchId = f.fixture.id.toString();
            let matchId = "";
            let isNew = false;

            if (matchMap.has(apiMatchId)) {
                // Update Existing by API ID
                const existing = matchMap.get(apiMatchId);
                matchId = existing.id;

                await prisma.match.update({
                    where: { id: matchId },
                    data: {
                        homeScore: f.goals.home,
                        awayScore: f.goals.away,
                        status: f.fixture.status.short,
                        minute: f.fixture.status.elapsed,
                        homeTeamLogo: f.teams.home.logo,
                        awayTeamLogo: f.teams.away.logo,
                    }
                });
            } else {
                // Check if found by slug
                const foundMatchId = slugLookupMap.get('FOUND_' + f.fixture.id);

                if (foundMatchId) {
                    matchId = foundMatchId;
                    // Link API ID and update
                    await prisma.match.update({
                        where: { id: matchId },
                        data: {
                            apiSportsId: apiMatchId,
                            homeScore: f.goals.home,
                            awayScore: f.goals.away,
                            status: f.fixture.status.short,
                            minute: f.fixture.status.elapsed,
                        }
                    });
                } else {
                    // Create New Match
                    isNew = true;
                    // Re-calculate slug for creation
                    const slugDate = new Date(f.fixture.date).toISOString().split('T')[0];
                    const slugBase = `${f.teams.home.name}-vs-${f.teams.away.name}-${slugDate}`
                        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

                    try {
                        const newMatch = await prisma.match.create({
                            data: {
                                date: new Date(f.fixture.date),
                                homeTeam: f.teams.home.name,
                                awayTeam: f.teams.away.name,
                                homeScore: f.goals.home,
                                awayScore: f.goals.away,
                                leagueId: dbLeague.id,
                                status: f.fixture.status.short,
                                minute: f.fixture.status.elapsed,
                                apiSportsId: apiMatchId,
                                homeTeamLogo: f.teams.home.logo,
                                awayTeamLogo: f.teams.away.logo,
                                mainTip: null, // No odds for now
                                isFeatured: POPULAR_LEAGUES.includes(Number(f.league.id)),
                                translations: {
                                    create: languages.map(lang => ({
                                        language: { connect: { code: lang.code } },
                                        name: `${f.teams.home.name} vs ${f.teams.away.name}`,
                                        slug: `${slugBase}-${lang.code}`,
                                        status: 'PUBLISHED',
                                        seo: {
                                            create: {
                                                title: `${f.teams.home.name} vs ${f.teams.away.name}`,
                                                description: `Live score and stats for ${f.teams.home.name} vs ${f.teams.away.name}`
                                            }
                                        }
                                    }))
                                }
                            }
                        });
                        matchId = newMatch.id;
                    } catch (createErr: any) {
                        if (createErr.code === 'P2002') {
                            continue;
                        }
                        console.error("Create Match Error:", createErr);
                    }
                }
            }

            // 4. Auto-Generate Articles (Analysis)
            const isPopular = POPULAR_LEAGUES.includes(Number(f.league.id));
            const isLiveUpdate = !!matchId && !isNew && (f.fixture.status.short === '1H' || f.fixture.status.short === '2H' || f.fixture.status.short === 'FT');

            if (matchId && (autoAnalyze || (isPopular && (isNew || isLiveUpdate)))) {
                // Analyzing EN by default to populate the blog
                await syncAndAnalyzeMatch(matchId, 'en', autoAnalyze || isLiveUpdate);
                analysisCount++;
            }

            syncedCount++;
        }

        await prisma.syncLog.create({
            data: { type: 'Matches', status: 'SUCCESS', count: syncedCount }
        });

        return NextResponse.json({ success: true, synced: syncedCount, analyzed: analysisCount });
    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
