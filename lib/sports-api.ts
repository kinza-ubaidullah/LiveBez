import { config } from 'dotenv';

// Try to load .env if we are running in a script environment
try {
    config();
} catch (e) {
    // Ignore error if dotenv is not available or fails
}

const BASE_URL = process.env.FOOTBALL_API_URL?.trim() || 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_SPORTS_KEY?.trim();

export interface ApiSportsResponse<T> {
    get: string;
    parameters: any;
    errors: any[];
    results: number;
    paging: {
        current: number;
        total: number;
    };
    response: T;
}

export interface MatchScore {
    homeScore: number;
    awayScore: number;
    status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED';
    minute?: number;
}

class ApiSportsClient {
    private apiKey: string;

    constructor() {
        if (!API_KEY) {
            console.warn('⚠️ API_SPORTS_KEY is not set in environment variables. API-Sports calls will fail.');
        }
        this.apiKey = API_KEY || '';
    }

    private async request<T>(endpoint: string, params: Record<string, string> = {}, revalidate: number = 60): Promise<ApiSportsResponse<T>> {
        if (!this.apiKey) {
            throw new Error('MISSING_API_KEY: API_SPORTS_KEY is not configured.');
        }

        const url = new URL(`${BASE_URL}${endpoint}`);
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }

        const hiddenUrl = url.toString();
        console.log(`📡 API-Sports Request: ${endpoint} ${JSON.stringify(params)}`);

        const maxRetries = 3;
        const timeout = 12000; // 12 seconds

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(url.toString(), {
                    headers: {
                        'x-apisports-key': this.apiKey,
                        'x-rapidapi-host': 'v3.football.api-sports.io'
                    },
                    next: { revalidate },
                    signal: controller.signal,
                } as any);

                clearTimeout(timeoutId);

                if (response.status === 401 || response.status === 403) {
                    console.error('❌ API-Sports: Unauthorized/Invalid API Key');
                    throw new Error('API_KEY_INVALID');
                }

                if (!response.ok) {
                    const errorText = await response.text().catch(() => 'No error body');
                    throw new Error(`API-Sports request failed [${response.status} ${response.statusText}]: ${errorText}`);
                }

                const data = await response.json();

                if (data.errors && Object.keys(data.errors).length > 0 && !Array.isArray(data.errors)) {
                    // API-Sports sometimes returns errors in an object
                    console.error('❌ API-Sports Error:', data.errors);
                    throw new Error(JSON.stringify(data.errors));
                }

                if (Array.isArray(data.errors) && data.errors.length > 0) {
                    console.error('❌ API-Sports Errors:', data.errors);
                    throw new Error(data.errors.join(', '));
                }

                return data;
            } catch (error: any) {
                const isLastAttempt = attempt === maxRetries;
                const isNetworkError = error.code === 'ENOTFOUND' ||
                    error.cause?.code === 'ENOTFOUND' ||
                    error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
                    error.name === 'AbortError' ||
                    error.message.includes('fetch failed');

                if (isNetworkError) {
                    console.warn(`⚠️ API-Sports attempt ${attempt}/${maxRetries} failed: ${error.cause?.code || error.name || error.message}`);

                    if (isLastAttempt) {
                        console.error(`❌ API-Sports: Connectivity error. Cannot reach ${BASE_URL}. Check your internet connection or DNS.`);
                        throw new Error('API_NETWORK_ERROR');
                    }

                    // Exponential backoff
                    const backoffMs = Math.pow(2, attempt - 1) * 1500;
                    console.log(`⏳ Retrying in ${backoffMs}ms...`);
                    await new Promise(resolve => setTimeout(resolve, backoffMs));
                    continue;
                }

                console.error('❌ API-Sports request failed:', error.message || error);
                throw error;
            }
        }

        throw new Error('API_NETWORK_ERROR');
    }


    /**
     * Get live scores or fixtures for a specific day/league
     */
    async getLiveScores(params: { league?: string; live?: string; date?: string; season?: string; next?: string; last?: string } = { live: 'all' }): Promise<any[]> {
        const response = await this.request<any[]>('/fixtures', params as Record<string, string>, 30);
        return response.response;
    }

    /**
     * Get specific fixture by ID
     */
    async getFixture(id: string): Promise<any> {
        const response = await this.request<any[]>('/fixtures', { id }, 30);
        return response.response[0] || null;
    }

    /**
     * Get predictions for a fixture
     */
    async getPredictions(fixtureId: string): Promise<any> {
        const response = await this.request<any[]>('/predictions', { fixture: fixtureId }, 3600);
        return response.response[0] || null;
    }

    async getStandings(leagueId: string, season: string = '2024'): Promise<any[]> {
        const response = await this.request<any[]>('/standings', { league: leagueId, season }, 86400); // 24hr cache
        return response.response;
    }

    /**
     * Get odds for a fixture
     */
    async getOdds(fixtureId: string): Promise<any[]> {
        // Fetch pre-match odds
        const response = await this.request<any[]>('/odds', { fixture: fixtureId }, 3600);
        return response.response;
    }

    /**
     * Get lineups for a fixture
     */
    async getLineups(fixtureId: string): Promise<any[]> {
        const response = await this.request<any[]>('/fixtures/lineups', { fixture: fixtureId }, 3600);
        return response.response;
    }

    /**
     * Get statistics for a fixture
     */
    async getFixtureStatistics(fixtureId: string): Promise<any[]> {
        const response = await this.request<any[]>('/fixtures/statistics', { fixture: fixtureId }, 60);
        return response.response;
    }

    /**
     * Get events for a fixture
     */
    async getFixtureEvents(fixtureId: string): Promise<any[]> {
        const response = await this.request<any[]>('/fixtures/events', { fixture: fixtureId }, 60);
        return response.response;
    }

    /**
     * Get head to head records between two teams
     */
    async getH2H(team1Id: string, team2Id: string): Promise<any[]> {
        const response = await this.request<any[]>('/fixtures/headtohead', { h2h: `${team1Id}-${team2Id}`, last: '10' }, 86400);
        return response.response;
    }
}

export const apiSports = new ApiSportsClient();

/**
 * Legacy wrapper for compatibility
 */
export async function fetchLiveScore(matchId: string): Promise<MatchScore | null> {
    try {
        const fixture = await apiSports.getFixture(matchId);
        if (!fixture) return null;

        return {
            homeScore: fixture.goals.home,
            awayScore: fixture.goals.away,
            status: mapStatus(fixture.fixture.status.short),
            minute: fixture.fixture.status.elapsed
        };
    } catch (error) {
        return null;
    }
}

function mapStatus(short: string): MatchScore['status'] {
    const map: Record<string, MatchScore['status']> = {
        'TBD': 'SCHEDULED',
        'NS': 'SCHEDULED',
        '1H': 'LIVE',
        'HT': 'LIVE',
        '2H': 'LIVE',
        'ET': 'LIVE',
        'P': 'LIVE',
        'FT': 'FINISHED',
        'AET': 'FINISHED',
        'PEN': 'FINISHED',
        'PST': 'POSTPONED',
        'CANC': 'POSTPONED',
        'ABD': 'POSTPONED',
    };
    return map[short] || 'SCHEDULED';
}
