import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import prisma from "../db.server"; // Prisma import for your database
import { Page, Layout, LegacyCard, Grid } from "@shopify/polaris"; // Shopify Polaris components

// Define the loader data type
type LoaderData = {
  images: Array<{
    id: string;
    image_url: string;
    image_name: string;
  }>;
};

// The loader function to fetch images from the database
export const loader = async () => {
  try {
    // Fetch images from the database using Prisma
    const images = await prisma.adaSignageImage.findMany({
      select: {
        id: true,
        image_url: true,
        image_name: true,
      },
    });

    // Return the images in JSON format
    return json<any>({ images });
  } catch (error) {
    console.error("Failed to fetch images:", error);
    // Handle error and return a failure message with a 500 status code
    return json({ error: "Failed to fetch images" }, { status: 500 });
  }
};

// React component to render the images page
export default function ImagesPage() {
  // Get the images from the loader data
  const { images } = useLoaderData<typeof loader>();

  return (
    <Page title="Images">
      <Layout>
        <Layout.Section>
          <Grid>
            {/* Map through the images array and display each image */}
            {images.map((image:any) => (
              <Grid.Cell key={image.id} columnSpan={{ xs: 6, sm: 4, md: 3, lg: 3 }}>
                <LegacyCard>
                  <div style={{ padding: "10px" }}>
                    <img
                      src={image.image_url}
                      alt={image.image_name || "Stored image"}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                    {/* Display the image name if available */}
                    {image.image_name && (
                      <p style={{ marginTop: "10px", textAlign: "center" }}>
                        {image.image_name}
                      </p>
                    )}
                  </div>
                </LegacyCard>
              </Grid.Cell>
            ))}
          </Grid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
