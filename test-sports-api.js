
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function testApiSports() {
    const apiKey = process.env.SPORTS_API_KEY || process.env.API_SPORTS_KEY;
    console.log('Using API Key:', apiKey ? 'FOUND' : 'NOT FOUND');
    if (!apiKey) return;

    const url = `https://v3.football.api-sports.io/status`;
    console.log('Fetching status...');

    try {
        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });
        console.log('Status:', response.status);
        const data = await response.json();

        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testApiSports();
