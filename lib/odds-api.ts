/**
 * The Odds API Client
 * Provides methods for fetching live scores, odds, and events from The Odds API v4
 */

const BASE_URL = 'https://api.the-odds-api.com/v4';
const API_KEY = process.env.THE_ODDS_API_KEY;

export interface OddsApiResponse<T> {
    data: T;
    remainingRequests: number | null;
    usedRequests: number | null;
}

export interface Sport {
    key: string;
    group: string;
    title: string;
    description: string;
    active: boolean;
    has_outrights: boolean;
}

export interface Event {
    id: string;
    sport_key: string;
    sport_title: string;
    commence_time: string;
    home_team: string;
    away_team: string;
}

export interface Score {
    id: string;
    sport_key: string;
    sport_title: string;
    commence_time: string;
    completed: boolean;
    home_team: string;
    away_team: string;
    scores: { name: string; score: string }[] | null;
    last_update: string | null;
}

export interface Outcome {
    name: string;
    price: number;
    point?: number;
}

export interface Market {
    key: string;
    last_update: string;
    outcomes: Outcome[];
}

export interface Bookmaker {
    key: string;
    title: string;
    last_update: string;
    markets: Market[];
}

export interface OddsEvent extends Event {
    bookmakers: Bookmaker[];
}

class OddsApiClient {
    private apiKey: string;

    constructor() {
        if (!API_KEY) {
            console.warn('THE_ODDS_API_KEY is not set. API calls will fail.');
        }
        this.apiKey = API_KEY || '';
    }

    private async request<T>(endpoint: string, params: Record<string, string> = {}, revalidate: number = 60): Promise<OddsApiResponse<T>> {
        const url = new URL(`${BASE_URL}${endpoint}`);
        url.searchParams.set('apiKey', this.apiKey);

        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }

        console.log(`📡 Odds API Request: ${url.toString().replace(this.apiKey, 'HIDDEN')}`);

        try {
            const response = await fetch(url.toString(), {
                next: { revalidate }
            });

            if (response.status === 429) {
                console.error('Odds API rate limit exceeded');
                throw new Error('API_RATE_LIMIT_EXCEEDED');
            }

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            return {
                data,
                remainingRequests: parseInt(response.headers.get('x-requests-remaining') || '0'),
                usedRequests: parseInt(response.headers.get('x-requests-used') || '0'),
            };
        } catch (error: any) {
            // Handle network errors gracefully
            if (error.code === 'ENOTFOUND' || error.cause?.code === 'ENOTFOUND') {
                console.error('Odds API: Network error - cannot reach api.the-odds-api.com');
                throw new Error('API_NETWORK_ERROR');
            }
            console.error('Odds API request failed:', error.message || error);
            throw error;
        }
    }

    /**
     * Get all available sports
     */
    async getSports(): Promise<OddsApiResponse<Sport[]>> {
        return this.request<Sport[]>('/sports', {}, 86400); // Cache for 24 hours
    }

    /**
     * Get events for a sport (FREE - doesn't count against quota)
     */
    async getEvents(sport: string): Promise<OddsApiResponse<Event[]>> {
        return this.request<Event[]>(`/sports/${sport}/events`, {}, 3600); // Cache for 1 hour
    }

    /**
     * Get live scores for a sport
     */
    async getScores(sport: string, daysFrom?: number): Promise<OddsApiResponse<Score[]>> {
        const params: Record<string, string> = {};
        if (daysFrom) params.daysFrom = daysFrom.toString();
        return this.request<Score[]>(`/sports/${sport}/scores`, params, 30); // Cache for 30 seconds (Live)
    }

    /**
     * Get odds for a sport
     */
    async getOdds(
        sport: string,
        options: {
            regions?: string;
            markets?: string;
            bookmakers?: string;
            eventIds?: string;
        } = {}
    ): Promise<OddsApiResponse<OddsEvent[]>> {
        const params: Record<string, string> = {
            regions: options.regions || 'eu',
            markets: options.markets || 'h2h',
        };
        if (options.bookmakers) params.bookmakers = options.bookmakers;
        if (options.eventIds) params.eventIds = options.eventIds;

        return this.request<OddsEvent[]>(`/sports/${sport}/odds`, params, 30); // Cache for 30 seconds (Live)
    }

    /**
     * Get odds for a specific event
     */
    async getEventOdds(
        sport: string,
        eventId: string,
        options: {
            regions?: string;
            markets?: string;
        } = {}
    ): Promise<OddsApiResponse<OddsEvent>> {
        const params: Record<string, string> = {
            regions: options.regions || 'eu',
            markets: options.markets || 'h2h,totals',
        };
        return this.request<OddsEvent>(`/sports/${sport}/events/${eventId}/odds`, params);
    }
}

// Singleton instance
export const oddsApi = new OddsApiClient();

// Soccer sport keys for reference
export const SOCCER_SPORTS = {
    // Major European Leagues
    EPL: 'soccer_epl',
    LA_LIGA: 'soccer_spain_la_liga',
    SERIE_A: 'soccer_italy_serie_a',
    BUNDESLIGA: 'soccer_germany_bundesliga',
    LIGUE_1: 'soccer_france_ligue_one',

    // Other European
    EREDIVISIE: 'soccer_netherlands_eredivisie',
    PRIMEIRA_LIGA: 'soccer_portugal_primeira_liga',
    SUPER_LIG: 'soccer_turkey_super_league',

    // UEFA Competitions
    CHAMPIONS_LEAGUE: 'soccer_uefa_champs_league',
    EUROPA_LEAGUE: 'soccer_uefa_europa_league',

    // World
    FIFA_WORLD_CUP: 'soccer_fifa_world_cup',

    // MLS
    MLS: 'soccer_usa_mls',
};

// Helper to get all soccer sport keys
export function getAllSoccerKeys(): string[] {
    return Object.values(SOCCER_SPORTS);
}
