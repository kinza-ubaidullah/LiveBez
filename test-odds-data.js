
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function testOddsData() {
    const apiKey = process.env.THE_ODDS_API_KEY;
    if (!apiKey) {
        console.error('❌ THE_ODDS_API_KEY is missing');
        return;
    }

    const sport = 'soccer_epl'; // Premier League
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h`;

    console.log(`📡 Fetching odds for ${sport}...`);

    try {
        const response = await fetch(url);
        console.log('Status:', response.status);

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ Success! Found ${data.length} matches.`);
            if (data.length > 0) {
                console.log('First Match Preview:', {
                    home: data[0].home_team,
                    away: data[0].away_team,
                    commence: data[0].commence_time,
                    bookmakers: data[0].bookmakers.length
                });
            } else {
                console.log('⚠️ No active matches found for this league right now.');
            }
        } else {
            console.error('❌ Error Response:', data);
        }
    } catch (error) {
        console.error('❌ Fetch error:', error);
    }
}

testOddsData();
