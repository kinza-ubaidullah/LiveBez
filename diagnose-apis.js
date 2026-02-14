
const { config } = require('dotenv');
const path = require('path');
config({ path: path.join(__dirname, '.env') });

async function checkApis() {
    console.log('🔍 Starting API Connectivity Diagnosis...\n');

    // 1. Check Odds API
    const oddsKey = process.env.THE_ODDS_API_KEY;
    console.log('--- The Odds API ---');
    if (!oddsKey) {
        console.error('❌ THE_ODDS_API_KEY is missing from .env');
    } else {
        console.log('✅ API Key found (ends with: ...' + oddsKey.slice(-4) + ')');
        try {
            const res = await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${oddsKey.trim()}`);
            if (res.ok) {
                const data = await res.json();
                console.log(`✅ Connection Successful! Found ${data.length} sports.`);
                console.log(`📊 Quota: ${res.headers.get('x-requests-remaining')} requests remaining.`);
            } else {
                const text = await res.text();
                console.error(`❌ API returned status ${res.status}: ${text}`);
            }
        } catch (e) {
            console.error(`❌ Network Error: Could not reach api.the-odds-api.com. Detailed error: ${e.message}`);
        }
    }

    console.log('\n--- API-Sports (Football) ---');
    const sportsKey = process.env.API_SPORTS_KEY || process.env.SPORTS_API_KEY;
    if (!sportsKey) {
        console.error('❌ API_SPORTS_KEY is missing from .env');
    } else {
        console.log('✅ API Key found (ends with: ...' + sportsKey.slice(-4) + ')');
        try {
            const res = await fetch('https://v3.football.api-sports.io/status', {
                headers: { 'x-apisports-key': sportsKey.trim() }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.errors && Object.keys(data.errors).length > 0) {
                    console.error(`❌ API reports errors: ${JSON.stringify(data.errors)}`);
                } else {
                    console.log(`✅ Connection Successful! Plan: ${data.response.subscription.plan}`);
                    console.log(`📊 Usage: ${data.response.requests.current}/${data.response.requests.limit_day} today.`);
                }
            } else {
                console.error(`❌ API returned status ${res.status}`);
            }
        } catch (e) {
            console.error(`❌ Network Error: Could not reach v3.football.api-sports.io. Detailed error: ${e.message}`);
        }
    }

    console.log('\n--- Database ---');
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.$connect();
        const leagues = await prisma.league.count();
        console.log(`✅ Database Connected! Found ${leagues} leagues.`);
        await prisma.$disconnect();
    } catch (e) {
        console.error(`❌ Database Error: ${e.message}`);
    }

    console.log('\n✨ Diagnosis Complete.');
}

checkApis();
