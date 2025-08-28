-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."RequestPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."user_favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fossil_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "fossilType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "maxBudget" DECIMAL(10,2),
    "geologicalPeriod" "public"."GeologicalPeriod",
    "category" "public"."Category",
    "countryOfOrigin" TEXT,
    "locality" TEXT,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."RequestPriority" NOT NULL DEFAULT 'NORMAL',
    "adminNotes" TEXT,
    "responseMessage" TEXT,
    "respondedAt" TIMESTAMP(3),
    "respondedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clerkUserId" TEXT,

    CONSTRAINT "fossil_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ratings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" INTEGER,
    "articleId" TEXT,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_favorites_userId_productId_key" ON "public"."user_favorites"("userId", "productId");

-- CreateIndex
CREATE INDEX "ratings_productId_idx" ON "public"."ratings"("productId");

-- CreateIndex
CREATE INDEX "ratings_articleId_idx" ON "public"."ratings"("articleId");

-- CreateIndex
CREATE INDEX "ratings_userId_idx" ON "public"."ratings"("userId");

-- CreateIndex
CREATE INDEX "ratings_rating_idx" ON "public"."ratings"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_userId_productId_key" ON "public"."ratings"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_userId_articleId_key" ON "public"."ratings"("userId", "articleId");

-- AddForeignKey
ALTER TABLE "public"."user_favorites" ADD CONSTRAINT "user_favorites_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ratings" ADD CONSTRAINT "ratings_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."ArticleBlog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
