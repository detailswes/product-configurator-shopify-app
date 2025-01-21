/*
  Warnings:

  - You are about to drop the column `color_ids` on the `ProductColors` table. All the data in the column will be lost.
  - Added the required column `text_color_id` to the `ProductColors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductColors" RENAME COLUMN "color_ids" TO "text_color_id";
