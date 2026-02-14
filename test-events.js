
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function testOddsApi() {
    const apiKey = process.env.THE_ODDS_API_KEY;
    if (!apiKey) return;

    const sportKeys = ['soccer_epl', 'soccer_spain_la_liga', 'soccer_germany_bundesliga'];

    for (const sportKey of sportKeys) {
        const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/events/?apiKey=${apiKey}`;
        console.log(`Fetching events for ${sportKey}...`);

        try {
            const response = await fetch(url);
            console.log(`${sportKey} Status:`, response.status);
            const data = await response.json();

            if (response.ok) {
                console.log(`Success! Found ${data.length} events for ${sportKey}.`);
            } else {
                console.error(`Error Response for ${sportKey}:`, data);
            }
        } catch (error) {
            console.error(`Fetch error for ${sportKey}:`, error);
        }
    }
}

testOddsApi();
