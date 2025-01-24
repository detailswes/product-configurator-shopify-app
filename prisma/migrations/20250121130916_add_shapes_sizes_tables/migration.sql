-- CreateTable
CREATE TABLE "AvailableShapesSizes" (
    "id" SERIAL NOT NULL,
    "shape_name" TEXT NOT NULL,
    "height" DECIMAL,
    "width" DECIMAL,
    "additional_price" INTEGER,
    "image" TEXT,

    CONSTRAINT "AvailableShapesSizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductShapesSizes" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "shape_id" INTEGER NOT NULL,

    CONSTRAINT "ProductShapesSizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ShapeRelation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ShapeRelation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ShapeRelation_B_index" ON "_ShapeRelation"("B");

-- AddForeignKey
ALTER TABLE "_ShapeRelation" ADD CONSTRAINT "_ShapeRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "AvailableShapesSizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShapeRelation" ADD CONSTRAINT "_ShapeRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductShapesSizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
