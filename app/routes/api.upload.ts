// app/routes/api.upload.ts
import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import fs from "fs/promises";
import path from "path";

export const action: ActionFunction = async ({ request }) => {
  try {
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, { status: 405 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return json({ error: "No file uploaded" }, { status: 400 });
    }

    // Optional: Add authentication check
    // const authHeader = request.headers.get('Authorization');
    // if (!authHeader || !validateAuth(authHeader)) {
    //   return json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const fileBuffer = await file.arrayBuffer();
    const uploadsDir = path.join(process.cwd(), "public/uploads");

    // Create uploads directory if it doesn't exist
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueFilename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Write file
    await fs.writeFile(filePath, Buffer.from(fileBuffer));

    // Return success response with file details
    return json({
      success: true,
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: `/uploads/${uniqueFilename}`
    });

  } catch (error) {
    console.error("Upload error:", error);
    return json({ error: "Failed to upload file" }, { status: 500 });
  }
}

// Optional: Add loader function to handle GET requests
export const loader = async ({ request }: { request: Request }) => {
  return json({ error: 'Method not allowed' }, { status: 405 });
};