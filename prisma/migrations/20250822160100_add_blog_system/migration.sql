/*
  Warnings:

  - Added the required column `authorId` to the `ArticleBlog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ArticleBlog" ADD COLUMN     "authorId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "ArticleBlog_authorId_idx" ON "public"."ArticleBlog"("authorId");

-- AddForeignKey
ALTER TABLE "public"."ArticleBlog" ADD CONSTRAINT "ArticleBlog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
