UPDATE "BookmakerTranslation" SET "slug" = LOWER(REPLACE("name", ' ', '-')) || '-' || "languageCode" WHERE "slug" IS NULL;
