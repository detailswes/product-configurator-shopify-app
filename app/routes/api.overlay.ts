import sharp from "sharp";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import prisma from "app/db.server";

// Configure AWS S3 client
const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface ImageMetadata {
  width: number;
  height: number;
}

interface RequestBody {
  shapeId: number;
  imageId: number;
  colorId: number;
  bgColorId: number;
  text: string;
  format: "png" | "jpeg" | "webp" | "svg";
}

export const loader: LoaderFunction = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No Content
      headers: {
        "Access-Control-Allow-Origin": "*", // Or your Shopify store domain
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  return new Response("Method Not Allowed", { status: 405 });
};

export const action: ActionFunction = async ({ request }) => {

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No content
      headers: {
        "Access-Control-Allow-Origin": "*", // Or specify your PDP domain
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405
    });
  }

  try {
    // Parse the request body
    const body = (await request.json()) as RequestBody;
    const {
      shapeId,
      imageId,
      colorId,
      bgColorId,
      text = "RESTROOM",
      format = "png",
    } = body;

    // Validate required fields
    if (!shapeId || !imageId || !colorId || !bgColorId) {
      return json(
        {
          error: "Missing required fields",
          required: ["shapeId", "imageId", "colorId", "bgColorId"],
        },
        { status: 400 },
      );
    }

    // Fetch shape data
    const shapesData = await prisma.availableShapesSizes.findUnique({
      where: { id: shapeId },
    });
    if (!shapesData?.image) {
      return json(
        { error: "Shape not found or missing image" },
        { status: 404 },
      );
    }

    // Fetch image data
    const imageData = await prisma.adaSignageImage.findUnique({
      where: { id: imageId },
    });
    if (!imageData?.image_url) {
      return json({ error: "Image not found" }, { status: 404 });
    }

    // Fetch color data
    const colorData = await prisma.availableColors.findUnique({
      where: { id: colorId },
    });
    if (!colorData?.hex_value) {
      return json({ error: "Color not found" }, { status: 404 });
    }

    // Fetch background color data
    const backgroundColorData = await prisma.availableColors.findUnique({
      where: { id: bgColorId },
    });
    if (!backgroundColorData?.hex_value) {
      return json({ error: "Background color not found" }, { status: 404 });
    }

    // Fetch and process SVG template
    const svgPath = imageData.image_url;
    const svgResponse = await fetch(svgPath);
    let svgTemplate = await svgResponse.text();

    // Fetch and process base image
    const baseImageResponse = await fetch(shapesData.image);
    if (!baseImageResponse.ok) {
      throw new Error(`Failed to fetch shape image: ${shapesData.image}`);
    }
    let baseSvg = await baseImageResponse.text();

    // Handle background color
    if (!baseSvg.includes("fill=")) {
      baseSvg = baseSvg.replace(
        "<svg",
        `<svg fill="${backgroundColorData.hex_value}"`,
      );
    } else {
      baseSvg = baseSvg.replace(
        /fill="[^"]*"/g,
        `fill="${backgroundColorData.hex_value}"`,
      );
    }

    // Convert base SVG to PNG buffer
    const baseImageBuffer = await sharp(Buffer.from(baseSvg))
      .resize(500, 500)
      .toFormat("png")
      .toBuffer();

    // Process SVG template with color
    svgTemplate = svgTemplate.replace(
      /fill="[^"]*"/g,
      `fill="${colorData.hex_value}"`,
    );

    // Create overlay buffer
    const overlayBuffer = await sharp(Buffer.from(svgTemplate))
      .resize(200, 200)
      .toFormat("png")
      .toBuffer();

    // Get image metadata
    const baseImageMetadata = (await sharp(
      baseImageBuffer,
    ).metadata()) as ImageMetadata;
    const overlayMetadata = (await sharp(
      overlayBuffer,
    ).metadata()) as ImageMetadata;

    // Calculate positioning
    const left = Math.floor(
      (baseImageMetadata.width - overlayMetadata.width) / 2,
    );
    const top = Math.floor(
      (baseImageMetadata.height - overlayMetadata.height) / 2,
    );

    const brailleText = text
      .toUpperCase()
      .split("")
      .map(
        (char) =>
          "⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿"[
            " A1B'K2L@CIF/MSP\"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&;:4\\0Z7(_?W]#Y)=".indexOf(
              char,
            )
          ],
      )
      .join("");

    // Create text SVG
    const svgText = `
      <svg width="${baseImageMetadata.width}" height="${baseImageMetadata.height}">
        <text x="50%" y="70%" font-size="30" fill="${colorData.hex_value}" text-anchor="middle">${text}</text>
        <text x="50%" y="80%" font-size="30" fill="${colorData.hex_value}" text-anchor="middle">${brailleText}</text>
      </svg>
    `;

    // Convert text to buffer
    const textBuffer = await sharp(Buffer.from(svgText))
      .toFormat("png")
      .toBuffer();

    // Compose final image
    const finalImageBuffer = await sharp(baseImageBuffer)
      .composite([
        { input: overlayBuffer, top: 90, left },
        { input: textBuffer, top: 0, left: 0 },
      ])
      .toFormat(format)
      .toBuffer();

    // Generate a unique filename
    const filename = `customized-sign-${Date.now()}.${format}`;

    // Upload the generated image to S3
    const uploadParams = {
      Bucket: "foodieland-bucket",
      Key: `customized-signs/${filename}`,
      Body: finalImageBuffer,
      ContentType: `image/${format}`,
    };

    const multipartUpload = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    try {
      const result = await multipartUpload.done();

      // Return the S3 URL
      return json(
        {
          success: true,
          url: result.Location,
          filename: filename,
          format: format,
        },
        // {
        //   headers: {
        //     "Access-Control-Allow-Origin": "*", // Or specify your Shopify app domain
        //     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        //   "Access-Control-Allow-Headers": "Content-Type, Authorization",
        //   },
        // },
      );
    } catch (error) {
      console.error("Error uploading to S3:", error);
      return json(
        {
          success: false,
          error: "Failed to upload to S3",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return json(
      {
        success: false,
        error: "Error processing image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
