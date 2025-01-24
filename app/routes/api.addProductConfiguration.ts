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
    width:  number;
    image:  string
  }>;
}

export const action: ActionFunction = async ({
  request,
}: {
  request: Request;
}) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const { product_id, text_color_id, background_color_id,configured_images,configured_shapes } = await request.json();

  try {
    // Handle product images
    const productImages: ProductImageResult[] = [];
    if (configured_images && Array.isArray(configured_images)) {
      for (const img of configured_images) {
        const imageId = Number(img.id);
        const additionalPrice = Number(img.additional_price || 0);

        // Validate image ID
        if (isNaN(imageId)) {
          throw new Error(`Invalid image ID: ${img.id}`);
        }

        // Check if the AdaSignageImage exists
        const existingImage = await prisma.adaSignageImage.findUnique({
          where: { id: imageId },
        });

        if (!existingImage) {
          console.warn(
            `AdaSignageImage with ID ${imageId} does not exist. Skipping.`,
          );
          return json(
            {
              message: `AdaSignageImage with ID ${imageId} does not exist. Skipping.`,
            },
            { status: 404 },
          );
        }

        const existingProductImage = await prisma.productImages.findFirst({
          where: {
            product_id: String(product_id),
            image_id: imageId,
          },
        });

        if (existingProductImage) {
          console.log(
            `Image with ID ${imageId} already exists for product ${product_id}. Skipping.`,
          );
          return json(
            {
              message: `Image with ID ${imageId} already exists for product ${product_id}. Skipping.`,
            },
            { status: 403 },
          );
        }

        // Create individual record for each image
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

    // Handle product colors
    const productColors: ProductColorResult[] = [];
    if (text_color_id) {
      const colorIds = Array.isArray(text_color_id) ? text_color_id : [text_color_id];

      for (const id of colorIds) {
        const existingProductColor = await prisma.productColors.findFirst({
          where: {
            product_id: String(product_id),
            color_ids: id,
          },
        });

        if (existingProductColor) {
          console.log(
            `Color with ID ${id} already exists for product ${product_id}. Skipping.`,
          );
          return json(
            {
              message: `Color with ID ${id} already exists for product ${product_id}. Skipping.`,
            },
            { status: 403 },
          );
        }

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

    // Handle product background colors
    const productBackgroundColors: ProductBackgroundColorResult[] = [];
    if (background_color_id) {
      const backgroundColorIds = Array.isArray(background_color_id) ? background_color_id : [background_color_id];

      for (const id of backgroundColorIds) {
        const existingProductBackgroundColor = await prisma.productBackgroundColors.findFirst({
          where: {
            product_id: String(product_id),
            background_color_id: id,
          },
        });

        if (existingProductBackgroundColor) {
          console.log(
            `Color with ID ${id} already exists for product ${product_id}. Skipping.`,
          );
          return json(
            {
              message: `Color with ID ${id} already exists for product ${product_id}. Skipping.`,
            },
            { status: 403 },
          );
        }

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

    // Handle product shapes and sizes
    const productShapesSizes: ProductShapesSizesResult[] = [];
    if (configured_shapes && Array.isArray(configured_shapes)) {
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
        const existingProductShapeSize = await prisma.productShapesSizes.findFirst({
          where: {
            product_id: String(product_id),
            shape_id: shapeId,
          },
        });

        if (existingProductShapeSize) {
          console.log(
            `Shape with ID ${shapeId} already exists for product ${product_id}. Skipping.`,
          );
          return json(
            {
              message: `Shape with ID ${shapeId} already exists for product ${product_id}. Skipping.`,
            },
            { status: 403 },
          );
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
            availableShapesSizes: true, // This now includes height, width, additional_price, and image
          },
        });

        const sanitizedShapesSizes = result.availableShapesSizes.map((shapeSize) => ({
          ...shapeSize,
          height: shapeSize.height ? Number(shapeSize.height) : 0, // Convert Decimal to number
          width: shapeSize.width ? Number(shapeSize.width) : 0,
          image: shapeSize.image || '', // Ensure it's a string
        }));
    
        productShapesSizes.push({
          ...result,
          availableShapesSizes: sanitizedShapesSizes,
        });
        
        // productShapesSizes.push(result);
      }
    }

    return json(
      {
        message: "Product configuration saved",
        data: {
          product_id,
          images: productImages,
          colors: productColors,
          backgroundColors: productBackgroundColors,
          shapesSizes: productShapesSizes
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error saving product configuration:", error);
    return json(
      {
        error: "Failed to save product configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
