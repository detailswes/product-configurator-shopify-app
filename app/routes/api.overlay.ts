import sharp from "sharp";
import type { ActionFunction } from "@remix-run/node";
import prisma from "app/db.server";

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
  format: "png" | "jpeg" | "webp";
}

export const action: ActionFunction = async ({ request }) => {
  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Parse the request body
    const body = await request.json() as RequestBody;
    const { shapeId, imageId, colorId, bgColorId, text = "RESTROOM", format = "png" } = body;

    // Validate required fields
    if (!shapeId || !imageId || !colorId || !bgColorId) {
      return new Response("Missing required fields", { 
        status: 400,
        headers: {
          "Content-Type": "application/json"
        },
        statusText: JSON.stringify({ 
          error: "Missing required fields",
          required: ["shapeId", "imageId", "colorId", "bgColorId"]
        })
      });
    }

    // Fetch shape data
    const shapesData = await prisma.availableShapesSizes.findUnique({
      where: { id: shapeId },
    });
    if (!shapesData?.image) {
      return new Response("Shape not found or missing image", { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fetch image data
    const imageData = await prisma.adaSignageImage.findUnique({
      where: { id: imageId },
    });
    if (!imageData?.image_url) {
      return new Response("Image not found", { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fetch color data
    const colorData = await prisma.availableColors.findUnique({
      where: { id: colorId },
    });
    if (!colorData?.hex_value) {
      return new Response("Color not found", { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fetch background color data
    const backgroundColorData = await prisma.availableColors.findUnique({
      where: { id: bgColorId },
    });
    if (!backgroundColorData?.hex_value) {
      return new Response("Background color not found", { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fetch and process SVG template
    const svgPath = imageData.image_url;
    const svgResponse = await fetch(svgPath);
    let svgTemplate = await svgResponse.text();

    // Fetch and process base image
    const baseImageResponse = await fetch(shapesData.image);
    let baseSvg = await baseImageResponse.text();

    // Handle background color
    if (!baseSvg.includes('fill=')) {
      baseSvg = baseSvg.replace(
        '<svg',
        `<svg fill="${backgroundColorData.hex_value}"`
      );
    } else {
      baseSvg = baseSvg.replace(/fill="[^"]*"/g, `fill="${backgroundColorData.hex_value}"`);
    }

    // Convert base SVG to PNG buffer
    const baseImageBuffer = await sharp(Buffer.from(baseSvg))
      .resize(500, 500)
      .toFormat("png")
      .toBuffer();

    // Process SVG template with color
    svgTemplate = svgTemplate.replace(
      /fill="[^"]*"/g,
      `fill="${colorData.hex_value}"`
    );

    // Create overlay buffer
    const overlayBuffer = await sharp(Buffer.from(svgTemplate))
      .resize(200, 200)
      .toFormat("png")
      .toBuffer();

    // Get image metadata
    const baseImageMetadata = (await sharp(baseImageBuffer).metadata()) as ImageMetadata;
    const overlayMetadata = (await sharp(overlayBuffer).metadata()) as ImageMetadata;

    // Calculate positioning
    const left = Math.floor((baseImageMetadata.width - overlayMetadata.width) / 2);
    const top = Math.floor((baseImageMetadata.height - overlayMetadata.height) / 2);

    const brailleText  = text.toUpperCase().split("")
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
        { input: overlayBuffer, top:90, left },
        { input: textBuffer, top: 0, left: 0 },
      ])
      .toFormat(format)
      .toBuffer();

    return new Response(finalImageBuffer, {
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Disposition": `attachment; filename=overlay-image.${format}`,
      },
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error processing image",
        details: error instanceof Error ? error.message : "Unknown error"
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};