import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { apiSports } from '@/lib/sports-api';
import { oddsApi, SOCCER_SPORTS } from '@/lib/odds-api';

export const dynamic = 'force-dynamic';

const POPULAR_LEAGUES = [39, 140, 135, 78, 61, 2, 3]; // EPL, La Liga, Serie A, Bundesliga, Ligue 1, UCL, UEL

async function upsertLeague(leagueData: any) {
    const apiLeagueId = leagueData.id.toString();

    let dbLeague = await prisma.league.findUnique({ where: { apiId: apiLeagueId } });

    if (!dbLeague) {
        // Check if slug causes conflict
        const slug = leagueData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        const existingTrans = await prisma.leagueTranslation.findUnique({
            where: { slug },
            include: { league: true }
        });

        if (existingTrans) {
            await prisma.league.update({
                where: { id: existingTrans.leagueId },
                data: { apiId: apiLeagueId, logoUrl: leagueData.logo }
            });
            dbLeague = await prisma.league.findUnique({ where: { id: existingTrans.leagueId } });
        } else {
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
        }
    } else {
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

        // 1. Fetch Odds in background for major leagues
        let allOdds: any[] = [];
        try {
            // Fetch both H2H and BTTS
            const oddsRes = await oddsApi.getOdds('soccer_epl', {
                regions: 'eu',
                markets: 'h2h'
            });
            allOdds = oddsRes.data;
        } catch (e) {
            console.error("Odds fetch failed in sync route:", e);
        }

        // 2. Seed Popular Leagues
        for (const leagueId of POPULAR_LEAGUES) {
            try {
                const standingsData = await apiSports.getStandings(leagueId.toString());
                if (standingsData && standingsData.length > 0) {
                    const leagueInfo = standingsData[0].league;
                    await upsertLeague(leagueInfo);
                }
            } catch (err) {
                console.error(`Failed to seed league ${leagueId}`, err);
            }
        }

        // 3. Fetch Data (Next 50 and Live)
        const upcoming = await apiSports.getLiveScores({ next: '50' });
        const live = await apiSports.getLiveScores({ live: 'all' });

        const allMap = new Map();
        [...upcoming, ...live].forEach(f => allMap.set(f.fixture.id, f));
        const fixtures = Array.from(allMap.values());

        for (const f of fixtures) {
            const dbLeague = await upsertLeague(f.league);
            if (!dbLeague) continue;

            const apiMatchId = f.fixture.id.toString();
            const slug = `${f.teams.home.name}-vs-${f.teams.away.name}-${f.fixture.date}`
                .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

            const existingMatch = await prisma.match.findFirst({
                where: { apiSportsId: apiMatchId }
            });

            // Find matching odds
            const matchOdds = allOdds.find(o =>
                (o.home_team.includes(f.teams.home.name) || f.teams.home.name.includes(o.home_team)) &&
                (o.away_team.includes(f.teams.away.name) || f.teams.away.name.includes(o.away_team))
            );

            let probabilityData = null;
            let bttsProb = null;

            if (matchOdds?.bookmakers?.length > 0) {
                // H2H Extraction
                const h2h = matchOdds.bookmakers[0].markets.find((m: any) => m.key === 'h2h');
                if (h2h) {
                    const homePrice = h2h.outcomes.find((o: any) => o.name === matchOdds.home_team)?.price;
                    const awayPrice = h2h.outcomes.find((o: any) => o.name === matchOdds.away_team)?.price;
                    const drawPrice = h2h.outcomes.find((o: any) => o.name === 'Draw')?.price;

                    if (homePrice && awayPrice && drawPrice) {
                        const hp = 1 / homePrice;
                        const ap = 1 / awayPrice;
                        const dp = 1 / drawPrice;
                        const tot = hp + ap + dp;
                        probabilityData = {
                            home: Math.round((hp / tot) * 100),
                            away: Math.round((ap / tot) * 100),
                            draw: Math.round((dp / tot) * 100),
                        };
                    }
                }

                // BTTS Extraction
                const btts = matchOdds.bookmakers[0].markets.find((m: any) => m.key === 'btts');
                if (btts) {
                    const yesPrice = btts.outcomes.find((o: any) => o.name === 'Yes')?.price;
                    const noPrice = btts.outcomes.find((o: any) => o.name === 'No')?.price;
                    if (yesPrice && noPrice) {
                        const yesP = 1 / yesPrice;
                        const noP = 1 / noPrice;
                        bttsProb = Math.round((yesP / (yesP + noP)) * 100);
                    }
                }
            }

            let matchId = "";

            if (existingMatch) {
                await prisma.match.update({
                    where: { id: existingMatch.id },
                    data: {
                        homeScore: f.goals.home,
                        awayScore: f.goals.away,
                        status: f.fixture.status.short,
                        minute: f.fixture.status.elapsed,
                        homeTeamLogo: f.teams.home.logo,
                        awayTeamLogo: f.teams.away.logo,
                    }
                });
                matchId = existingMatch.id;
            } else {
                const seoMatch = await prisma.seoFields.create({
                    data: { title: `${f.teams.home.name} vs ${f.teams.away.name}` }
                });

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
                        mainTip: probabilityData ? (probabilityData.home > probabilityData.away ? "Home Win" : "Away Win") : "Analysis Pending",
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
                matchId = newMatch.id;
            }

            // Sync Predictions/Odds
            if (probabilityData) {
                // Fetch extra probes for this specific match loop if not already in probabilityData
                // (Note: probabilityData here is h2h, from line 134)

                // Let's refine the probability data extraction inside the loop
                const h2h = matchOdds?.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'h2h');
                const btts = matchOdds?.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'btts');
                const totals = matchOdds?.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'totals');

                let bttsProbValue = 50;
                if (btts) {
                    const yes = btts.outcomes.find((o: any) => o.name === 'Yes')?.price;
                    const no = btts.outcomes.find((o: any) => o.name === 'No')?.price;
                    if (yes && no) bttsProbValue = Math.round((1 / yes / (1 / yes + 1 / no)) * 100);
                }

                let overProbValue = 50;
                let underProbValue = 50;
                if (totals) {
                    const over = totals.outcomes.find((o: any) => o.name === 'Over' && o.point === 2.5)?.price;
                    const under = totals.outcomes.find((o: any) => o.name === 'Under' && o.point === 2.5)?.price;
                    if (over && under) {
                        overProbValue = Math.round((1 / over / (1 / over + 1 / under)) * 100);
                        underProbValue = 100 - overProbValue;
                    }
                }

                await prisma.prediction.upsert({
                    where: { matchId: matchId },
                    update: {
                        winProbHome: probabilityData.home,
                        winProbAway: probabilityData.away,
                        winProbDraw: probabilityData.draw,
                        bttsProb: bttsProbValue,
                        overProb: overProbValue,
                        underProb: underProbValue,
                    },
                    create: {
                        matchId: matchId,
                        winProbHome: probabilityData.home,
                        winProbAway: probabilityData.away,
                        winProbDraw: probabilityData.draw,
                        bttsProb: bttsProbValue,
                        overProb: overProbValue,
                        underProb: underProbValue,
                    }
                });
            }

            syncedCount++;
        }

        await prisma.syncLog.create({
            data: { type: 'Matches', status: 'SUCCESS', count: syncedCount }
        });

        return NextResponse.json({ success: true, count: syncedCount });
    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

