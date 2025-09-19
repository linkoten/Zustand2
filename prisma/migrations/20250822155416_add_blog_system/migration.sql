-- CreateEnum
CREATE TYPE "public"."BlogCategory" AS ENUM ('PALEONTOLOGIE', 'DECOUVERTE', 'GUIDE_COLLECTION', 'HISTOIRE_GEOLOGIQUE', 'ACTUALITE', 'TECHNIQUE', 'EXPOSITION', 'PORTRAIT');

-- CreateEnum
CREATE TYPE "public"."BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED');

-- CreateTable
CREATE TABLE "public"."ArticleBlog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "imageAlt" TEXT,
    "category" "public"."BlogCategory" NOT NULL,
    "status" "public"."BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "readTime" INTEGER,
    "views" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleBlog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ArticleBlogToBlogTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArticleBlogToBlogTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleBlog_slug_key" ON "public"."ArticleBlog"("slug");

-- CreateIndex
CREATE INDEX "ArticleBlog_status_publishedAt_idx" ON "public"."ArticleBlog"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "ArticleBlog_category_idx" ON "public"."ArticleBlog"("category");

-- CreateIndex
CREATE INDEX "ArticleBlog_slug_idx" ON "public"."ArticleBlog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_name_key" ON "public"."BlogTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_slug_key" ON "public"."BlogTag"("slug");

-- CreateIndex
CREATE INDEX "_ArticleBlogToBlogTag_B_index" ON "public"."_ArticleBlogToBlogTag"("B");

-- AddForeignKey
ALTER TABLE "public"."_ArticleBlogToBlogTag" ADD CONSTRAINT "_ArticleBlogToBlogTag_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."ArticleBlog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ArticleBlogToBlogTag" ADD CONSTRAINT "_ArticleBlogToBlogTag_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
