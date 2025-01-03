import sharp from "sharp";
import fs from "fs-extra";
import path from "path";
import type { LoaderFunction } from "@remix-run/node";

interface ImageMetadata {
  width: number;
  height: number;
}

type ImageFormat = "png" | "jpeg" | "webp";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const color = url.searchParams.get("color") || "#ff0000";
  const textColor = url.searchParams.get("textColor") || "#ffffff";
  const text = url.searchParams.get("text") || "Overlay Text";
  const format = (url.searchParams.get("format") || "png") as ImageFormat;

  try {
    const svgPath = path.resolve("public/input.svg");
    const baseImagePath = path.resolve("public/base-image.jpg");

    let svgTemplate = await fs.readFile(svgPath, "utf8");
    svgTemplate = svgTemplate.replace(/fill="[^"]*"/g, `fill="${color}"`);

    const overlayBuffer = await sharp(Buffer.from(svgTemplate))
      .resize(200, 200)
      .toFormat("png")
      .toBuffer();

    const baseImageMetadata = await sharp(baseImagePath).metadata() as ImageMetadata;
    const overlayMetadata = await sharp(overlayBuffer).metadata() as ImageMetadata;

    const left = Math.floor((baseImageMetadata.width - overlayMetadata.width) / 2);
    const top = Math.floor((baseImageMetadata.height - overlayMetadata.height) / 2);

    const svgText = `
      <svg width="${baseImageMetadata.width}" height="${baseImageMetadata.height}">
        <text x="50%" y="90%" font-size="48" fill="${textColor}" text-anchor="middle">${text}</text>
      </svg>
    `;

    const textBuffer = await sharp(Buffer.from(svgText)).toFormat("png").toBuffer();

    const finalImageBuffer = await sharp(baseImagePath)
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