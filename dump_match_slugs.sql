SELECT t.slug, l.slug as league_slug, t."languageCode" 
FROM "MatchTranslation" t 
JOIN "Match" m ON t."matchId" = m.id 
JOIN "League" le ON m."leagueId" = le.id 
JOIN "LeagueTranslation" l ON le.id = l."leagueId" AND t."languageCode" = l."languageCode"
LIMIT 10;
