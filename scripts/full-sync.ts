import { config } from 'dotenv';
import path from 'path';

// Load .env explicitly for script execution
config({ path: path.join(__dirname, '../.env') });

import { syncAllLeagues } from '../lib/actions/sync-actions'

async function main() {
    console.log('🚀 Starting full synchronization (Odds API & Sports API)...')
    try {
        const result = await syncAllLeagues()
        console.log('✅ Batch sync result:', JSON.stringify(result, null, 2))
        console.log('✨ Synchronization complete.')
    } catch (error: any) {
        console.error('❌ Sync failed:', error.message);
    }
}

main().catch(console.error)

