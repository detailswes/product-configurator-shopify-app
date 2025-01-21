/*
  Warnings:

  - Made the column `background_color_id` on table `ProductColors` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_ColorRelation" DROP CONSTRAINT "_ColorRelation_B_fkey";

-- AlterTable
ALTER TABLE "ProductColors" ALTER COLUMN "background_color_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductColors" ADD CONSTRAINT "ProductColors_text_color_id_fkey" FOREIGN KEY ("text_color_id") REFERENCES "AvailableColors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductColors" ADD CONSTRAINT "ProductColors_background_color_id_fkey" FOREIGN KEY ("background_color_id") REFERENCES "AvailableColors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ColorRelation" ADD CONSTRAINT "_ColorRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
