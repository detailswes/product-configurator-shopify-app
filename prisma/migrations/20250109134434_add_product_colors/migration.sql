-- DropForeignKey
ALTER TABLE "_ColorRelation" DROP CONSTRAINT "_ColorRelation_B_fkey";

-- CreateTable
CREATE TABLE "ProductColors" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "color_ids" INTEGER NOT NULL,

    CONSTRAINT "ProductColors_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "_ColorRelation" ADD CONSTRAINT "_ColorRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductColors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
