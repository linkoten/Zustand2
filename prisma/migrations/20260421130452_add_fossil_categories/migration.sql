/*
  Warnings:

  - The values [COQUILLAGE] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Category_new" AS ENUM ('TRILOBITE', 'AMMONITE', 'DENT', 'ECHINODERME', 'POISSON', 'VERTEBRE', 'GASTROPODE', 'AUTRE_ARTHROPODE');
ALTER TABLE "public"."Product" ALTER COLUMN "category" TYPE "public"."Category_new" USING ("category"::text::"public"."Category_new");
ALTER TABLE "public"."fossil_requests" ALTER COLUMN "category" TYPE "public"."Category_new" USING ("category"::text::"public"."Category_new");
ALTER TABLE "public"."FossilSpecies" ALTER COLUMN "category" TYPE "public"."Category_new" USING ("category"::text::"public"."Category_new");
ALTER TYPE "public"."Category" RENAME TO "Category_old";
ALTER TYPE "public"."Category_new" RENAME TO "Category";
DROP TYPE "public"."Category_old";
COMMIT;
