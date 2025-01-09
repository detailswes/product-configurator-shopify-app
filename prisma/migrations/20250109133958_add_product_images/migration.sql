-- DropForeignKey
ALTER TABLE "_ImageRelation" DROP CONSTRAINT "_ImageRelation_B_fkey";

-- CreateTable
CREATE TABLE "ProductImages" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "image_id" INTEGER NOT NULL,
    "additional_price" INTEGER NOT NULL,

    CONSTRAINT "ProductImages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "_ImageRelation" ADD CONSTRAINT "_ImageRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductImages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
