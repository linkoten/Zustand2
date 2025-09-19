/*
  Warnings:

  - You are about to drop the column `locality` on the `Product` table. All the data in the column will be lost.
  - Added the required column `localityId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "locality",
ADD COLUMN     "localityId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Locality" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geologicalPeriods" "public"."GeologicalPeriod"[],
    "geologicalStages" TEXT[],

    CONSTRAINT "Locality_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Locality_name_key" ON "public"."Locality"("name");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES "public"."Locality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
