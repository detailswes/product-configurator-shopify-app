import { ActionFunction, json } from "@remix-run/node";
import prisma from "../db.server";

interface ProductImageResult {
  id: number;
  product_id: string;
  image_id: number;
  additional_price: number;
  adaSignageImages: Array<{
    id: number;
    image_url: string;
    image_name: string | null;
  }>;
}

interface ProductColorResult {
  id: number;
  product_id: string;
  color_ids: number;
  availableColors: Array<{
    id: number;
    color_name: string;
    hex_value: string;
  }>;
}

interface ProductBackgroundColorResult {
  id: number;
  product_id: string;
  background_color_id: number;
  availableColors: Array<{
    id: number;
    color_name: string;
    hex_value: string;
  }>;
}

interface ProductShapesSizesResult {
  id: number;
  product_id: string;
  shape_id: number;
  additional_price: number | null;
  availableShapesSizes: Array<{
    id: number;
    shape_name: string;
    height: number;
    width: number;
    image: string;
  }>;
}

export const action: ActionFunction = async ({
  request,
}: {
  request: Request;
}) => {
  if (request.method !== "PUT") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const { product_id, color_id, background_color_id, configured_images, configured_shapes } =
    await request.json();

  if (!product_id) {
    return json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    // Update product images
    const productImages: ProductImageResult[] = [];
    if (configured_images && Array.isArray(configured_images)) {
      // First, delete existing product images
      await prisma.productImages.deleteMany({
        where: { product_id: String(product_id) },
      });

      // Then create new ones
      for (const img of configured_images) {
        const imageId = Number(img.id);
        const additionalPrice = Number(img.additional_price || 0);

        if (isNaN(imageId)) {
          throw new Error(`Invalid image ID: ${img.id}`);
        }

        const existingImage = await prisma.adaSignageImage.findUnique({
          where: { id: imageId },
        });

        if (!existingImage) {
          console.warn(`AdaSignageImage with ID ${imageId} does not exist. Skipping.`);
          continue;
        }

        const result = await prisma.productImages.create({
          data: {
            product_id: String(product_id),
            image_id: imageId,
            additional_price: additionalPrice,
            adaSignageImages: {
              connect: { id: imageId },
            },
          },
          include: {
            adaSignageImages: true,
          },
        });
        productImages.push(result);
      }
    }

    // Update product colors
    const productColors: ProductColorResult[] = [];
    if (color_id) {
      // Delete existing product colors
      await prisma.productColors.deleteMany({
        where: { product_id: String(product_id) },
      });

      const colorIds = Array.isArray(color_id) ? color_id : [color_id];
      for (const id of colorIds) {
        const result = await prisma.productColors.create({
          data: {
            product_id,
            color_ids: Number(id),
            availableColors: {
              connect: { id: Number(id) },
            },
          },
          include: {
            availableColors: true,
          },
        });
        productColors.push(result);
      }
    }

    // Update product background colors
    const productBackgroundColors: ProductBackgroundColorResult[] = [];
    if (background_color_id) {
      // Delete existing background colors
      await prisma.productBackgroundColors.deleteMany({
        where: { product_id: String(product_id) },
      });

      const backgroundColorIds = Array.isArray(background_color_id)
        ? background_color_id
        : [background_color_id];
      
      for (const id of backgroundColorIds) {
        const result = await prisma.productBackgroundColors.create({
          data: {
            product_id,
            background_color_id: Number(id),
            availableColors: {
              connect: { id: Number(id) },
            },
          },
          include: {
            availableColors: true,
          },
        });
        productBackgroundColors.push(result);
      }
    }

    // Update product shapes and sizes
    const productShapesSizes: ProductShapesSizesResult[] = [];
    if (configured_shapes && Array.isArray(configured_shapes)) {
      // Delete existing shapes and sizes
      await prisma.productShapesSizes.deleteMany({
        where: { product_id: String(product_id) },
      });
      for (const shape of configured_shapes) {
        const shapeId = Number(shape.id);
        const additionalPrice = Number(shape.additional_price || 0);
        if (isNaN(shapeId)) {
            throw new Error(`Invalid shape ID: ${shape.id}`);
        }
        const existingShape = await prisma.availableShapesSizes.findUnique({
        where: { id: shapeId },
        });

        if (!existingShape) {
        console.warn(`AvailableShapeSize with ID ${shapeId} does not exist. Skipping.`);
        continue;
        }
        const result = await prisma.productShapesSizes.create({
          data: {
            product_id,
            shape_id: shapeId,
            additional_price: additionalPrice,
            availableShapesSizes: {
              connect: { id: shapeId },
            },
          },
          include: {
            availableShapesSizes: true,
          },
        });

        const sanitizedShapesSizes = result.availableShapesSizes.map((shapeSize) => ({
          ...shapeSize,
          height: shapeSize.height ? Number(shapeSize.height) : 0,
          width: shapeSize.width ? Number(shapeSize.width) : 0,
          image: shapeSize.image || '',
        }));

        productShapesSizes.push({
          ...result,
          availableShapesSizes: sanitizedShapesSizes,
        });
      }
    }

    return json(
      {
        message: "Product configuration updated successfully",
        data: {
          product_id,
          images: productImages,
          colors: productColors,
          backgroundColors: productBackgroundColors,
          shapesSizes: productShapesSizes,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating product configuration:", error);
    return json(
      {
        error: "Failed to update product configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};