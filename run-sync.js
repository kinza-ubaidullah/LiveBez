
const { syncFixtures } = require('./lib/actions/sync-actions');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function runSync() {
    console.log('Starting sync for EPL...');
    try {
        const result = await syncFixtures('soccer_epl');
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Sync failed with error:', error);
    }
}

runSync();
