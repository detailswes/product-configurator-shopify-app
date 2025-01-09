/*
  Warnings:

  - The `colors_available` column on the `ProductConfiguration` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ProductConfiguration" DROP COLUMN "colors_available",
ADD COLUMN     "colors_available" INTEGER[];
