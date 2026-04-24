/*
  Warnings:

  - The values [DECOUVERTE,GUIDE_COLLECTION,HISTOIRE_GEOLOGIQUE,ACTUALITE,TECHNIQUE,EXPOSITION,PORTRAIT] on the enum `BlogCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- Migrate all existing articles with removed categories to PALEONTOLOGIE
UPDATE "public"."ArticleBlog"
SET category = 'PALEONTOLOGIE'
WHERE category IN ('DECOUVERTE', 'GUIDE_COLLECTION', 'HISTOIRE_GEOLOGIQUE', 'ACTUALITE', 'TECHNIQUE', 'EXPOSITION', 'PORTRAIT');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."BlogCategory_new" AS ENUM ('GISEMENTS', 'COLLECTIONS', 'PALEONTOLOGIE', 'ACTIVITES_PALEOLITHO', 'AUTRES');
ALTER TABLE "public"."ArticleBlog" ALTER COLUMN "category" TYPE "public"."BlogCategory_new" USING ("category"::text::"public"."BlogCategory_new");
ALTER TYPE "public"."BlogCategory" RENAME TO "BlogCategory_old";
ALTER TYPE "public"."BlogCategory_new" RENAME TO "BlogCategory";
DROP TYPE "public"."BlogCategory_old";
COMMIT;
