-- DropForeignKey
ALTER TABLE "faqs" DROP CONSTRAINT "faqs_tagId_fkey";

-- AlterTable
ALTER TABLE "faqs" ALTER COLUMN "tagId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;
