/*
  Warnings:

  - A unique constraint covering the columns `[product_id]` on the table `ProductConfiguration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProductConfiguration_product_id_key" ON "ProductConfiguration"("product_id");
