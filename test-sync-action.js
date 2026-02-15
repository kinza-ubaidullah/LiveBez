
const { syncFixtures } = require('./lib/actions/sync-actions');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testSync() {
    console.log('Testing syncFixtures for EPL...');
    const result = await syncFixtures('soccer_epl');
    console.log('Sync Result:', JSON.stringify(result, null, 2));
    process.exit(0);
}

testSync();
