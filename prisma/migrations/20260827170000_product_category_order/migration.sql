-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- Seed initial order from current alphabetical order, so existing display order doesn't
-- jump around before an admin explicitly reorders anything.
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "name" ASC) - 1 AS rn
  FROM "ProductCategory"
)
UPDATE "ProductCategory" pc
SET "order" = ranked.rn
FROM ranked
WHERE pc."id" = ranked."id";
