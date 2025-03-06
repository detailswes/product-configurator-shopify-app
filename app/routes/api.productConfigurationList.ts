import { json, LoaderFunction } from "@remix-run/node";
import prisma from "../db.server";

export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id");

  if (!productId) {
    return json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    // Fetch product images
    const productImages = await prisma.productImages.findMany({
      where: { product_id: productId },
      include: {
        adaSignageImages: true, // Include related ADA signage images
      },
    });

    // Fetch product colors
    const productColors = await prisma.productColors.findMany({
      where: { product_id: productId },
      include: {
        availableColors: true, // Include related colors
      },
    });

    //Fetch product background colors
    const productBackgroundColors = await prisma.productBackgroundColors.findMany({
      where:{product_id:productId},
      include:{
        availableColors: true
      }
    });

    const productShapesSizes = await prisma.productShapesSizes.findMany({
      where:{product_id: productId},
      include:{
        availableShapesSizes: true
      }
    });

    // Check if any data was found
    // if (!productImages.length && !productColors.length && !productBackgroundColors.length && !productShapesSizes.length) {
    //   return json({ error: "No product configurations found"/ }, { status: 404 });
    // }

    // Return the combined data
    return json(
      {
        data: {
          images: productImages,
          colors: productColors,
          backgroundColors:productBackgroundColors,
          shapesSizes: productShapesSizes
        },
      },
      { status: 200,
        headers: {
        "Access-Control-Allow-Origin": "*", // Or specify your Shopify app domain
        "Access-Control-Allow-Methods": "GET,POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      } }
    );
  } catch (error) {
    console.error("Error fetching product configurations:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
