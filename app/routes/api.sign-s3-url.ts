import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { generatePresignedUrl } from "app/utils/s3";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const s3Url = url.searchParams.get("url");
  if (!s3Url) {
    return json({ error: "Missing 'url' query parameter" }, { status: 400 });
  }

  try {
    // Extract the object key from the S3 URL
    const objectKey = new URL(s3Url).pathname.slice(1); // Remove the leading slash
    const signedUrl = await generatePresignedUrl(objectKey);
    return json({ signedUrl },{
        // headers: {
        //   "Access-Control-Allow-Origin": "*", // Or specify your Shopify app domain
        //   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        // "Access-Control-Allow-Headers": "Content-Type, Authorization",
        // },
      },);
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return json({ error: "Failed to generate pre-signed URL" }, { status: 500 });
  }
}