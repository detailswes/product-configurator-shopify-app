/*
  Warnings:

  - You are about to drop the column `additional_price` on the `AvailableShapesSizes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AvailableShapesSizes" DROP COLUMN "additional_price";

-- AlterTable
ALTER TABLE "ProductShapesSizes" ADD COLUMN     "additional_price" INTEGER;
