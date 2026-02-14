
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function testOdds() {
    const apiKey = process.env.THE_ODDS_API_KEY;
    const sportKey = 'soccer_epl';
    const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h,totals`;

    console.log(`Fetching odds for ${sportKey}...`);

    try {
        const response = await fetch(url);
        console.log(`Status:`, response.status);
        const data = await response.json();

        if (response.ok) {
            console.log(`Success! Found ${data.length} events with odds.`);
            if (data.length > 0) {
                console.log('Sample Bookmaker:', data[0].bookmakers?.[0]?.title);
                console.log('Sample Markets:', data[0].bookmakers?.[0]?.markets?.map(m => m.key).join(', '));
            }
        } else {
            console.error(`Error Response:`, data);
        }
    } catch (error) {
        console.error(`Fetch error:`, error);
    }
}

testOdds();
