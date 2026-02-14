const API_KEY = 'e8c1d1568e8ceb4ca3eda4cb71cecfe0';
const url = `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${API_KEY}&regions=eu&markets=h2h,totals`;

async function main() {
    const res = await fetch(url);
    console.log('Status:', res.status, res.statusText);
    const data = await res.json();
    if (!res.ok) {
        console.log('Error Body:', JSON.stringify(data));
    } else {
        console.log('Success! Sample Data:', JSON.stringify(data[0], null, 2));
    }
}
main();
