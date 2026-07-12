BEGIN;

-- Convert Clinic.type from enum to free text, preserving existing values
ALTER TABLE "Clinic" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Clinic" ALTER COLUMN "type" TYPE TEXT USING "type"::text;
UPDATE "Clinic" SET "type" = CASE "type"
  WHEN 'CLINIC' THEN 'Clinic'
  WHEN 'PHARMACY' THEN 'Pharmacy'
  WHEN 'HOSPITAL' THEN 'Hospital'
  ELSE "type"
END;
ALTER TABLE "Clinic" ALTER COLUMN "type" SET DEFAULT 'Clinic';

DROP TYPE IF EXISTS "ClinicType";

-- New admin-managed partner type list
CREATE TABLE IF NOT EXISTS "PartnerType" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "nameEn" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "PartnerType" ("id", "name", "nameEn") VALUES
  ('pt_clinic',   'Clinic',   'Clinic'),
  ('pt_pharmacy', 'Pharmacy', 'Pharmacy'),
  ('pt_hospital', 'Hospital', 'Hospital')
ON CONFLICT ("name") DO NOTHING;

COMMIT;
