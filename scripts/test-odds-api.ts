import { oddsApi, SOCCER_SPORTS } from './lib/odds-api'

async function main() {
    try {
        const res = await oddsApi.getOdds(SOCCER_SPORTS.EPL, {
            regions: 'eu',
            markets: 'h2h,btts,totals'
        })
        console.log('Success!', res.data.length, 'events with odds.')
    } catch (err: any) {
        console.error('Odds API Error:', err.message)
    }
}

main().catch(console.error)
