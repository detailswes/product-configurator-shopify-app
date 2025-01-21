/*
  Warnings:

  - You are about to drop the column `background_color_id` on the `ProductColors` table. All the data in the column will be lost.
  - You are about to drop the column `text_color_id` on the `ProductColors` table. All the data in the column will be lost.
  - Added the required column `color_ids` to the `ProductColors` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductColors" DROP CONSTRAINT "ProductColors_background_color_id_fkey";

-- DropForeignKey
ALTER TABLE "ProductColors" DROP CONSTRAINT "ProductColors_text_color_id_fkey";

-- DropForeignKey
ALTER TABLE "_ColorRelation" DROP CONSTRAINT "_ColorRelation_B_fkey";

-- AlterTable
ALTER TABLE "ProductColors" DROP COLUMN "background_color_id",
DROP COLUMN "text_color_id",
ADD COLUMN     "color_ids" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ProductBackgroundColors" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "background_color_id" INTEGER NOT NULL,

    CONSTRAINT "ProductBackgroundColors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BackgroundColorRelation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BackgroundColorRelation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BackgroundColorRelation_B_index" ON "_BackgroundColorRelation"("B");

-- AddForeignKey
ALTER TABLE "_ColorRelation" ADD CONSTRAINT "_ColorRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductColors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BackgroundColorRelation" ADD CONSTRAINT "_BackgroundColorRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "AvailableColors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BackgroundColorRelation" ADD CONSTRAINT "_BackgroundColorRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductBackgroundColors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
