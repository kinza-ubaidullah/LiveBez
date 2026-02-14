DO $$
DECLARE
    r RECORD;
    new_seo_id TEXT;
BEGIN
    FOR r IN SELECT id FROM "BookmakerTranslation" WHERE "seoId" IS NULL LOOP
        -- Generate a unique-ish string ID
        new_seo_id := 'seo-' || md5(random()::text || clock_timestamp()::text);
        INSERT INTO "SeoFields" ("id", "title") VALUES (new_seo_id, 'Bookmaker SEO');
        UPDATE "BookmakerTranslation" SET "seoId" = new_seo_id WHERE id = r.id;
    END LOOP;
END $$;
