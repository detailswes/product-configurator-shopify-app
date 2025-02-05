import { json, type ActionFunction } from "@remix-run/node";
import prisma from "app/db.server";

export const action: ActionFunction = async ({ request }) => {
    // Only allow POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
  
    try {
      // Parse the request body
      const body = await request.json();
      const { color_name, hex_value } = body;
  
      // Validate required fields
      if (!color_name || !hex_value) {
        return new Response("Missing required fields", { 
          status: 400,
          statusText: JSON.stringify({ 
            error: "Missing required fields",
            required: ["color_name", "hex_value"]
          })
        });
      }

      const existingColor = await prisma.availableColors.findFirst({
        where:{hex_value:hex_value}
      });

      if(existingColor){
        return json(
            {
              message: `Color already exists.`,
            },
            { status: 403 },
          );
      }

      const addData = await prisma.availableColors.create({
        data:{
            color_name:color_name,
            hex_value:hex_value
        }
      });

      return json(
        {
          message: `Color added successfully.`,
          data:addData
        },
        { status: 200 },
      );

    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: "Error adding color",
          details: error instanceof Error ? error.message : "Unknown error"
        }), { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  };