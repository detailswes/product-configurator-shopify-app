-- CreateTable
CREATE TABLE "AvailableShapesSizes" (
    "id" SERIAL NOT NULL,
    "shape_name" TEXT NOT NULL,
    "height" NUMERIC,
    "width" NUMERIC ,
    "additional_price" NUMBER,
    "image" TEXT

    CONSTRAINT "AvailableShapesSizes_pkey" PRIMARY KEY ("id")
);
