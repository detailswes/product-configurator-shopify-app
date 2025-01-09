-- CreateTable
CREATE TABLE "ProductConfiguration" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "configured_images" JSONB NOT NULL,
    "colors_available" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ImageRelation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ImageRelation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ColorRelation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ColorRelation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ImageRelation_B_index" ON "_ImageRelation"("B");

-- CreateIndex
CREATE INDEX "_ColorRelation_B_index" ON "_ColorRelation"("B");

-- AddForeignKey
ALTER TABLE "_ImageRelation" ADD CONSTRAINT "_ImageRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "AdaSignageImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageRelation" ADD CONSTRAINT "_ImageRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ColorRelation" ADD CONSTRAINT "_ColorRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "AvailableColors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ColorRelation" ADD CONSTRAINT "_ColorRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
