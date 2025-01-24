import sharp from "sharp";
import type { LoaderFunction } from "@remix-run/node";
import prisma from "app/db.server";

interface ImageMetadata {
  width: number;
  height: number;
}

type ImageFormat = "png" | "jpeg" | "webp";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const shapeId = url.searchParams.get("shape_id");
  const imageId = url.searchParams.get("image_id");
  const colorId = url.searchParams.get("color_id") || "#000000";
  const bgColorId = url.searchParams.get("bgColor_id") || "#000000";
  const text = url.searchParams.get("text") || "Restroom";
  const format = (url.searchParams.get("format") || "png") as ImageFormat;

  try {
    if (!shapeId || !imageId || !colorId || !text || !bgColorId) {
      return new Response("Ids are required", { status: 400 });
    }
    const shapesData = await prisma.availableShapesSizes.findUnique({
      where: { id: Number(shapeId) },
    });
    if (!shapesData || !shapesData.image) {
      return new Response("Shape not found or missing image", { status: 404 });
    }
    const imageData = await prisma.adaSignageImage.findUnique({
      where: { id: Number(imageId) },
    });
    if (!imageData || !imageData.image_url) {
      return new Response("Image not found", { status: 404 });
    }
    const colorData = await prisma.availableColors.findUnique({
      where: { id: Number(colorId) },
    });
    if (!colorData || !colorData.hex_value) {
      return new Response("Color not found", { status: 404 });
    }
    const backgroundColorData = await prisma.availableColors.findUnique({
      where: { id: Number(bgColorId) },
    });
    if (!backgroundColorData || !backgroundColorData.hex_value) {
      return new Response("Background color not found", { status: 404 });
    }
    const svgPath = imageData?.image_url;
    const svgResponse = await fetch(svgPath);
    let svgTemplate = await svgResponse.text();

    const baseImagePath = shapesData?.image;
    // const baseImageResponse = await fetch(baseImagePath);
    // const baseImageBuffer = await baseImageResponse.arrayBuffer();

    const baseImageResponse = await fetch(baseImagePath);
    let baseSvg = await baseImageResponse.text();

    if (!baseSvg.includes('fill=')) {
      baseSvg = baseSvg.replace(
        '<svg',
        `<svg fill="${backgroundColorData.hex_value}"`
      );
    } else {
      // Replace existing fill attributes with the new color
      baseSvg = baseSvg.replace(/fill="[^"]*"/g, `fill="${backgroundColorData.hex_value}"`);
    }

    // Convert the modified SVG to a PNG buffer
    const baseImageBuffer = await sharp(Buffer.from(baseSvg))
      .toFormat("png")
      .toBuffer();

    // let svgTemplate = await fs.readFile(svgPath, "utf8");
    svgTemplate = svgTemplate.replace(
      /fill="[^"]*"/g,
      `fill="${colorData.hex_value}"`,
    );

    const overlayBuffer = await sharp(Buffer.from(svgTemplate))
      .resize(200, 200)
      .toFormat("png")
      .toBuffer();

    const baseImageMetadata = (await sharp(
      baseImageBuffer,
    ).metadata()) as ImageMetadata;
    const overlayMetadata = (await sharp(
      overlayBuffer,
    ).metadata()) as ImageMetadata;

    const left = Math.floor(
      (baseImageMetadata.width - overlayMetadata.width) / 2,
    );
    const top = Math.floor(
      (baseImageMetadata.height - overlayMetadata.height) / 2,
    );

    const svgText = `
      <svg width="${baseImageMetadata.width}" height="${baseImageMetadata.height}">
        <text x="50%" y="80%" font-size="40" fill="${colorData.hex_value}" text-anchor="middle">${text}</text>
      </svg>
    `;

    const textBuffer = await sharp(Buffer.from(svgText))
      .toFormat("png")
      .toBuffer();

      const finalImageBuffer = await sharp(baseImageBuffer)
      .composite([
        { input: overlayBuffer, top, left },
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
    return new Response("Error processing image", { status: 500 });
  }
};
