import { ActionFunction, json } from "@remix-run/node";
import prisma from "../db.server";

export const action: ActionFunction = async ({ request }: { request: Request }) => {
    if(request.method !== 'POST'){
        return json({ error: 'Method not allowed' }, { status: 405 });
    }
    const {product_id,color_id,configured_image} = await request.json();
    const existingProduct = await prisma.productConfiguration.findUnique({
        where: { product_id: product_id },
    });
    if(existingProduct){
        const updatedProduct = await prisma.productConfiguration.update({
            where: { product_id },
            data: {
                // Update arrays
                colors_available: {
                    push: color_id,
                },
                configured_images: {
                    push: configured_image,
                },
                // Update relations
                availableColors: {
                    connect: Array.isArray(color_id) 
                        ? color_id.map(id => ({ id: Number(id) }))
                        : [{ id: Number(color_id) }]
                },
                adaSignageImages: {
                    connect: Array.isArray(configured_image) 
                        ? configured_image.map(img => ({ id: Number(img.id) }))
                        : [{ id: Number(configured_image.id) }]
                }
            },
            include: {
                availableColors: true,
                adaSignageImages: true
            }
        });
        return json({ message: 'Product configuration updated', data: updatedProduct }, { status: 200 });
    }
    const addedProduct = await prisma.productConfiguration.create({
        data: {
            product_id,
            // Set arrays
            colors_available: Array.isArray(color_id) ? color_id : [color_id],
            configured_images: Array.isArray(configured_image) ? configured_image : [configured_image],
            // Set relations
            availableColors: {
                connect: Array.isArray(color_id)
                    ? color_id.map(id => ({ id: Number(id) }))
                    : [{ id: Number(color_id) }]
            },
            adaSignageImages: {
                connect: Array.isArray(configured_image)
                    ? configured_image.map(img => ({ id: Number(img.id) }))
                    : [{ id: Number(configured_image.id) }]
            }
        },
        include: {
            availableColors: true,
            adaSignageImages: true
        }
    });
    return json({ message: 'Product configuration added',data: addedProduct }, { status: 200 });
}