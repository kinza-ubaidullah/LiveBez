
const { syncFixtures } = require('../lib/actions/sync-actions');
const { SOCCER_SPORTS } = require('../lib/odds-api');

async function testSync() {
  console.log("Testing EPL Sync Action...");
  try {
    const result = await syncFixtures(SOCCER_SPORTS.EPL);
    console.log("Sync Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Sync Action Error:", error);
  }
}

testSync().then(() => process.exit(0));
