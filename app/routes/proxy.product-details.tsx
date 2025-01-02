import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);
  
  // Get product details including metafield
  const response = await admin.graphql(`
    query GetProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        metafield(namespace: "custom", key: "configured") {
          value
        }
        # Add other fields you need
      }
    }
  `, {
    variables: {
      handle: params.handle,
    },
  });

  const data = await response.json();
  return json(data);
}

export default function ProductDetailsProxy() {
  const { product } = useLoaderData();
  const isConfigured = product.metafield?.value === "true";

  if (!isConfigured) {
    // Return null or minimal content to allow default theme to show
    return null;
  }

  return (
    <div className="custom-product-details">
      {/* Your custom product details view */}
      <h1>{product.title}</h1>
      {/* Add your custom components and functionality */}
    </div>
  );
}