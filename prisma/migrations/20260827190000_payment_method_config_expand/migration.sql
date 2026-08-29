-- CreateEnum
CREATE TYPE "PaymentMethodKind" AS ENUM ('WALLET', 'BANK_TRANSFER');

-- AlterTable
ALTER TABLE "PaymentMethodConfig" ADD COLUMN "kind" "PaymentMethodKind" NOT NULL DEFAULT 'WALLET';
ALTER TABLE "PaymentMethodConfig" ADD COLUMN "accountNumber" TEXT;
ALTER TABLE "PaymentMethodConfig" ADD COLUMN "accountName" TEXT;
ALTER TABLE "PaymentMethodConfig" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- Seed order on existing rows so they don't all collide at 0
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) - 1 AS rn
  FROM "PaymentMethodConfig"
)
UPDATE "PaymentMethodConfig" p
SET "order" = ranked.rn
FROM ranked
WHERE p."id" = ranked."id";

-- Ensure MMQR has a fee-config row too (it had none before — no gateway fee tracked for it yet)
INSERT INTO "PaymentMethodConfig" ("id", "key", "label", "kind", "order", "createdAt", "updatedAt")
VALUES ('pmc_mmqr_seed_0001', 'mmqr', 'MMQR Payment', 'WALLET', 100, now(), now())
ON CONFLICT ("key") DO NOTHING;

-- Migrate the 3 hardcoded bank-transfer accounts into real, admin-manageable rows
INSERT INTO "PaymentMethodConfig" ("id", "key", "label", "kind", "accountNumber", "accountName", "order", "createdAt", "updatedAt")
VALUES
  ('pmc_ayabank_seed_0001', 'ayabank', 'AYA Bank', 'BANK_TRANSFER', '10005203452', 'Medihug', 101, now(), now()),
  ('pmc_cbbank_seed_0001',  'cbbank',  'CB Bank',  'BANK_TRANSFER', '0117100900020192', 'MEDIHUG', 102, now(), now()),
  ('pmc_uabbank_seed_0001', 'uabbank', 'UAB (Company Special)', 'BANK_TRANSFER', '20011121419', 'Medihug', 103, now(), now())
ON CONFLICT ("key") DO NOTHING;
