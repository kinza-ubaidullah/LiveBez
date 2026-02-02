/**
 * API-Sports Client
 * Handles direct communication with v3.football.api-sports.io
 */

const BASE_URL = process.env.FOOTBALL_API_URL || 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_SPORTS_KEY;

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
            console.warn('API_SPORTS_KEY is not set. API-Sports calls will fail.');
        }
        this.apiKey = API_KEY || '';
    }

    private async request<T>(endpoint: string, params: Record<string, string> = {}, revalidate: number = 60): Promise<ApiSportsResponse<T>> {
        const url = new URL(`${BASE_URL}${endpoint}`);
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }

        try {
            const response = await fetch(url.toString(), {
                headers: {
                    'x-apisports-key': this.apiKey,
                },
                next: { revalidate }
            });

            if (!response.ok) {
                throw new Error(`API-Sports request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.errors && Object.keys(data.errors).length > 0) {
                console.error('API-Sports Error:', data.errors);
                throw new Error(JSON.stringify(data.errors));
            }

            return data;
        } catch (error: any) {
            console.error('API-Sports request failed:', error.message || error);
            throw error;
        }
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

    /**
     * Get league standings
     */
    /**
     * Get league standings
     */
    async getStandings(leagueId: string, season: string = '2024'): Promise<any[]> {
        const response = await this.request<any[]>('/standings', { league: leagueId, season }, 86400); // 24hr cache
        return response.response;
    }
}

export const apiSports = new ApiSportsClient();

/**
 * Legacy wrapper for compatibility
 */
export async function fetchLiveScore(matchId: string): Promise<MatchScore | null> {
    try {
        // matchId here might be internal DB ID or API-Sports ID
        // Assuming we store api-sports-id in the match model
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
