import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { apiSports } from '@/lib/sports-api';

export const dynamic = 'force-dynamic';

const POPULAR_LEAGUES = [39, 140, 135, 78, 61, 2, 3]; // EPL, La Liga, Serie A, Bundesliga, Ligue 1, UCL, UEL

async function upsertLeague(leagueData: any) {
    const apiLeagueId = leagueData.id.toString();

    let dbLeague = await prisma.league.findUnique({ where: { apiId: apiLeagueId } });

    if (!dbLeague) {
        // Check if slug causes conflict (e.g. 'premier-league' used by another league?)
        const slug = leagueData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        // Find existing league via translation slug
        const existingTrans = await prisma.leagueTranslation.findUnique({
            where: { slug },
            include: { league: true }
        });

        if (existingTrans) {
            // Link the API ID to this existing league!
            console.log(`⚠️ Found existing league by slug (${slug}), updating API ID...`);
            await prisma.league.update({
                where: { id: existingTrans.leagueId },
                data: { apiId: apiLeagueId, logoUrl: leagueData.logo }
            });
            dbLeague = await prisma.league.findUnique({ where: { id: existingTrans.leagueId } });
        } else {
            // Create New
            const seo = await prisma.seoFields.create({
                data: { title: leagueData.name, description: `Betting tips for ${leagueData.name}` }
            });

            dbLeague = await prisma.league.create({
                data: {
                    apiId: apiLeagueId,
                    country: leagueData.country,
                    logoUrl: leagueData.logo,
                    translations: {
                        create: {
                            languageCode: 'en',
                            name: leagueData.name,
                            slug: slug,
                            seoId: seo.id
                        }
                    }
                }
            });
            console.log(`✅ Created League: ${leagueData.name}`);
        }
    } else {
        // Update Logo if changed
        if (dbLeague.logoUrl !== leagueData.logo) {
            await prisma.league.update({
                where: { id: dbLeague.id },
                data: { logoUrl: leagueData.logo }
            });
        }
    }
    return dbLeague;
}

export async function GET(request: NextRequest) {
    try {
        let syncedCount = 0;

        // 0. Seed Popular Leagues
        for (const leagueId of POPULAR_LEAGUES) {
            try {
                // Fetch standings to get league info (Name, Country, Logo)
                const standingsData = await apiSports.getStandings(leagueId.toString());
                if (standingsData && standingsData.length > 0) {
                    const leagueInfo = standingsData[0].league; // API-Sports structure: response[0].league
                    await upsertLeague(leagueInfo);
                }
            } catch (err) {
                console.error(`Failed to seed league ${leagueId}`, err);
            }
        }

        // 1. Fetch Data (Next 20 and Live)
        const upcoming = await apiSports.getLiveScores({ next: '20' });
        const live = await apiSports.getLiveScores({ live: 'all' });

        // Merge and deduplicate by fixture ID
        const allMap = new Map();
        [...upcoming, ...live].forEach(f => allMap.set(f.fixture.id, f));
        const fixtures = Array.from(allMap.values());

        for (const f of fixtures) {
            // 1. Sync League
            const dbLeague = await upsertLeague(f.league);

            // 2. Sync Match
            if (!dbLeague) {
                console.warn(`Skipping match sync for league ${f.league.id} (League creation failed)`);
                continue;
            }

            const apiMatchId = f.fixture.id.toString();
            const slug = `${f.teams.home.name}-vs-${f.teams.away.name}-${f.fixture.date}`
                .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

            // Check if match exists by API ID
            const existingMatch = await prisma.match.findFirst({
                where: { apiSportsId: apiMatchId }
            });

            if (existingMatch) {
                // Update Score & Status
                await prisma.match.update({
                    where: { id: existingMatch.id },
                    data: {
                        homeScore: f.goals.home,
                        awayScore: f.goals.away,
                        status: f.fixture.status.short, // e.g. "FT", "1H"
                        minute: f.fixture.status.elapsed,
                        homeTeamLogo: f.teams.home.logo,
                        awayTeamLogo: f.teams.away.logo,
                    }
                });
            } else {
                // Create New Match
                const seoMatch = await prisma.seoFields.create({
                    data: { title: `${f.teams.home.name} vs ${f.teams.away.name}` }
                });

                await prisma.match.create({
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
                        mainTip: "TBD", // Placeholder
                        translations: {
                            create: {
                                languageCode: 'en',
                                name: `${f.teams.home.name} vs ${f.teams.away.name}`,
                                slug: slug,
                                seoId: seoMatch.id
                            }
                        }
                    }
                });
            }
            syncedCount++;
        }

        return NextResponse.json({ success: true, count: syncedCount });
    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
