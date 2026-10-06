-- AlterTable
ALTER TABLE "ExpenseCategory" ADD COLUMN "isCapital" BOOLEAN NOT NULL DEFAULT false;

-- Mark the existing default categories that are clearly capital investment, not an
-- operating cost, so Phase-1 reports split correctly without every admin re-tagging them.
UPDATE "ExpenseCategory" SET "isCapital" = true
WHERE "name" IN ('Initial Software Development', 'Hardware', 'App Development', 'Branding');
