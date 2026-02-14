
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function testOddsApi() {
    const apiKey = process.env.THE_ODDS_API_KEY;
    console.log('Using API Key:', apiKey ? 'FOUND' : 'NOT FOUND');
    if (!apiKey) return;

    const url = `https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`;
    console.log('Fetching sports...');

    try {
        const response = await fetch(url);
        console.log('Status:', response.status);
        const data = await response.json();

        if (response.ok) {
            console.log('Success! Found', data.length, 'sports.');
            console.log('Remaining requests:', response.headers.get('x-requests-remaining'));
        } else {
            console.error('Error Response:', data);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testOddsApi();
