-- CreateEnum
CREATE TYPE "public"."CollectionStatus" AS ENUM ('OWNED', 'WISHLIST');

-- CreateEnum
CREATE TYPE "public"."FossilRarity" AS ENUM ('COMMUN', 'PEU_COMMUN', 'RARE', 'TRES_RARE', 'EXCEPTIONNEL');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "fossilSpeciesId" TEXT;

-- CreateTable
CREATE TABLE "public"."FossilSpecies" (
    "id" TEXT NOT NULL,
    "genus" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "commonName" TEXT,
    "description" TEXT,
    "localityId" INTEGER NOT NULL,
    "geologicalPeriod" "public"."GeologicalPeriod" NOT NULL,
    "geologicalStage" TEXT NOT NULL,
    "category" "public"."Category" NOT NULL,
    "countryOfOrigin" TEXT NOT NULL,
    "rarity" "public"."FossilRarity",
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FossilSpecies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCollection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fossilSpeciesId" TEXT NOT NULL,
    "status" "public"."CollectionStatus" NOT NULL,
    "acquiredAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FossilSpecies_genus_species_localityId_key" ON "public"."FossilSpecies"("genus", "species", "localityId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCollection_userId_fossilSpeciesId_key" ON "public"."UserCollection"("userId", "fossilSpeciesId");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_fossilSpeciesId_fkey" FOREIGN KEY ("fossilSpeciesId") REFERENCES "public"."FossilSpecies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FossilSpecies" ADD CONSTRAINT "FossilSpecies_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES "public"."Locality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCollection" ADD CONSTRAINT "UserCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCollection" ADD CONSTRAINT "UserCollection_fossilSpeciesId_fkey" FOREIGN KEY ("fossilSpeciesId") REFERENCES "public"."FossilSpecies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
