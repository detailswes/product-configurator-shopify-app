import { json, LoaderFunction } from "@remix-run/node";
import prisma from "../db.server";

export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const productId = url.searchParams.get("product_id");
  
    if (!productId) {
      return json({ error: "Product ID is required" }, { status: 400 });
    }
  
    try {
      const productConfigurations = await prisma.productConfiguration.findMany({
        where: { product_id: productId },
        include: {
          availableColors: true,
          adaSignageImages: true,
        },
      });
  
      if (!productConfigurations.length) {
        return json({ error: "No product configurations found" }, { status: 404 });
      }
  
      return json({ data: productConfigurations }, { status: 200 });
    } catch (error) {
      console.error("Error fetching product configurations:", error);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  };