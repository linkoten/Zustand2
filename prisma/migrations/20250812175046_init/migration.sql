-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('TRILOBITE', 'AMMONITE', 'DENT', 'COQUILLAGE');

-- CreateEnum
CREATE TYPE "public"."GeologicalPeriod" AS ENUM ('CAMBRIEN', 'ORDOVICIEN', 'SILURIEN', 'DEVONIEN', 'CARBONIFERE', 'PERMIEN', 'TRIAS', 'JURASSIQUE', 'CRETACE', 'PALEOGENE', 'NEOGENE', 'QUATERNAIRE');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "category" "public"."Category" NOT NULL,
    "genre" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "countryOfOrigin" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "geologicalPeriod" "public"."GeologicalPeriod" NOT NULL,
    "geologicalStage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "public"."User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
