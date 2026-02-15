
/**
 * Live Win Probability Algorithm
 * Adjusts pre-match probabilities based on current score and time elapsed.
 */
export function calculateLiveProbability(
    preMatch: { home: number; draw: number; away: number },
    score: { home: number; away: number },
    minute: number | null,
    status: string
) {
    // If not live or finished, return pre-match
    if (status === 'NS' || status === 'TBD' || !minute) return preMatch;
    if (status === 'FT' || status === 'AET' || status === 'PEN' || minute > 90) {
        if (score.home > score.away) return { home: 100, draw: 0, away: 0 };
        if (score.away > score.home) return { home: 0, draw: 0, away: 100 };
        return { home: 0, draw: 100, away: 0 };
    }

    const { home: pH, draw: pD, away: pA } = preMatch;
    const { home: sH, away: sA } = score;
    const m = Math.min(minute, 90);
    const progression = m / 90;

    // Base Live Calc
    let lH = pH;
    let lD = pD;
    let lA = pA;

    const goalDiff = sH - sA;

    if (goalDiff > 0) {
        // Home leading
        // Boost home based on time and diff
        const boost = progression * 40 * goalDiff;
        lH += boost;
        lD -= boost / 2;
        lA -= boost / 2;
    } else if (goalDiff < 0) {
        // Away leading
        const boost = progression * 40 * Math.abs(goalDiff);
        lA += boost;
        lD -= boost / 2;
        lH -= boost / 2;
    } else {
        // Draw
        // As time goes on, Draw probability increases if it stays level
        const drawBoost = progression * 30;
        lD += drawBoost;
        lH -= drawBoost / 2;
        lA -= drawBoost / 2;
    }

    // Clamp and Normalize
    lH = Math.max(2, Math.min(96, lH));
    lD = Math.max(2, Math.min(96, lD));
    lA = Math.max(2, Math.min(96, lA));

    const total = lH + lD + lA;
    return {
        home: Math.round((lH / total) * 100),
        draw: Math.round((lD / total) * 100),
        away: Math.round((lA / total) * 100),
    };
}
