/*
  Warnings:

  - The primary key for the `AdaSignageImage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `AdaSignageImage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `AvailableColors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `AvailableColors` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ProductConfiguration` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ProductConfiguration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `_ColorRelation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_ImageRelation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `A` on the `_ColorRelation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_ColorRelation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_ImageRelation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_ImageRelation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_ColorRelation" DROP CONSTRAINT "_ColorRelation_A_fkey";

-- DropForeignKey
ALTER TABLE "_ColorRelation" DROP CONSTRAINT "_ColorRelation_B_fkey";

-- DropForeignKey
ALTER TABLE "_ImageRelation" DROP CONSTRAINT "_ImageRelation_A_fkey";

-- DropForeignKey
ALTER TABLE "_ImageRelation" DROP CONSTRAINT "_ImageRelation_B_fkey";

-- AlterTable
ALTER TABLE "AdaSignageImage" DROP CONSTRAINT "AdaSignageImage_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "AdaSignageImage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "AvailableColors" DROP CONSTRAINT "AvailableColors_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "AvailableColors_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProductConfiguration" DROP CONSTRAINT "ProductConfiguration_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ProductConfiguration_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_ColorRelation" DROP CONSTRAINT "_ColorRelation_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL,
ADD CONSTRAINT "_ColorRelation_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_ImageRelation" DROP CONSTRAINT "_ImageRelation_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL,
ADD CONSTRAINT "_ImageRelation_AB_pkey" PRIMARY KEY ("A", "B");

-- CreateIndex
CREATE INDEX "_ColorRelation_B_index" ON "_ColorRelation"("B");

-- CreateIndex
CREATE INDEX "_ImageRelation_B_index" ON "_ImageRelation"("B");

-- AddForeignKey
ALTER TABLE "_ImageRelation" ADD CONSTRAINT "_ImageRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "AdaSignageImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageRelation" ADD CONSTRAINT "_ImageRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ColorRelation" ADD CONSTRAINT "_ColorRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "AvailableColors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ColorRelation" ADD CONSTRAINT "_ColorRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
