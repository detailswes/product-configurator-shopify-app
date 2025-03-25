import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceListProps,
  Thumbnail,
  Text,
  Button,
  Loading,
  EmptyState,
  TextField,
  Select,
  Frame,
  ButtonGroup,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {
  ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useSubmit,
  Form,
} from "@remix-run/react";
import { useCallback, useState, useMemo, useEffect } from "react";
import { Product } from "app/types";
import { FETCH_PRODUCTS, UPDATE_PRODUCT_METAFIELD } from "app/graphql/producs";
import { ConfigureProductModal } from "app/components/ConfigureProductModal";
import prisma from "../db.server";
import { Decimal } from "@prisma/client/runtime/library";

interface DBImage {
  id: number;
  url: string;
  title: string;
}
interface DBColor {
  id: number;
  color_name: string;
  hex_value: string;
}
interface DBShape {
  id: number;
  shape_name: string;
  height: Decimal | null;
  width: Decimal | null;
  image: string | null;
}
interface LoaderData {
  products: Product[];
  dbImages: DBImage[];
  dbColors: DBColor[];
  dbShapes: DBShape[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  try {
    // Fetch products from Shopify
    const response = await admin.graphql(FETCH_PRODUCTS);
    const productsData = await response.json();

    // Fetch images and transform them to match the expected DBImage type
    const dbImagesRaw = await prisma.adaSignageImage.findMany({
      select: {
        id: true,
        image_url: true,
        image_name: true,
      },
      where: {
        image_name: { not: null },
      },
    });
    const dbColorsRaw = await prisma.availableColors.findMany({
      select: {
        id: true,
        color_name: true,
        hex_value: true,
      },
    });
    const dbShapaSizeRaw = await prisma.availableShapesSizes.findMany({
      select: {
        id: true,
        shape_name: true,
        height: true,
        width: true,
        image: true,
      },
    });
    // Transform the data to match the expected types
    const dbImages: DBImage[] = dbImagesRaw.map((img) => ({
      id: img.id,
      url: img.image_url,
      title: img.image_name || "Untitled",
    }));
    const dbColors: DBColor[] = dbColorsRaw.map((color) => ({
      id: color.id,
      color_name: color.color_name,
      hex_value: color.hex_value,
    }));
    const dbShapes: DBShape[] = dbShapaSizeRaw.map((shape) => ({
      id: shape.id,
      shape_name: shape.shape_name,
      height: shape.height ? new Decimal(shape.height) : null,
      width: shape.width ? new Decimal(shape.width) : null,
      image: shape.image,
    }));
    return json({
      products: productsData.data.products.edges,
      dbImages,
      dbColors,
      dbShapes,
    });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    throw new Error("Failed to load products and images");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const productId = formData.get("productId") as string;
  const isConfigured = formData.get("isConfigured") === "true";

  try {
    const input = {
      id: productId,
      metafields: [
        {
          namespace: "custom",
          key: "configured",
          value: isConfigured.toString(),
          type: "boolean",
        },
      ],
    };

    const response = await admin.graphql(UPDATE_PRODUCT_METAFIELD, {
      variables: { input },
    });
    const data = await response.json();
    if (data.data.productUpdate.userErrors?.length > 0) {
      return json(
        { error: data.data.productUpdate.userErrors[0].message },
        { status: 400 }
      );
    }
    return json({ success: true });
  } catch (error) {
    return json({ error: "Failed to update product" }, { status: 500 });
  }
}

// Extracted ProductItem component
function ProductItem({
  product,
  dbImages,
  dbColors,
  dbShapes,
  isSubmitting,
  isDataLoaded,
}: {
  product: Product["node"];
  dbImages: DBImage[];
  dbColors: DBColor[];
  dbShapes: DBShape[];
  isSubmitting: boolean;
  isDataLoaded: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const submit = useSubmit();

  const imageUrl = product.images.edges[0]?.node.url || "";
  const isConfigured = product.metafield
    ? product.metafield.value === "true"
    : false;

  // This handles submitting the Activate/Deactivate action
  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("productId", product.id);
    formData.append("isConfigured", (!isConfigured).toString());
    submit(formData, { method: "post" });
  };

  // This handles configuration action (opens modal)
  const handleConfigure = () => {
    setIsModalOpen(true);
  };

  if (!isDataLoaded) {
    return (
      <ResourceList.Item id={product.id}>
        <Loading />
      </ResourceList.Item>
    );
  }

  return (
    <ResourceList.Item
      id={product.id}
      media={<Thumbnail source={imageUrl} alt={product.title} size="medium" />}
      persistActions
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <Text variant="bodyMd" fontWeight="bold" as="h3">
            {product.title}
          </Text>
          <div style={{ marginTop: "0.25rem" }}>
            <Text variant="bodyMd" as="p">
              {product.vendor}
            </Text>
          </div>
        </div>
        <div style={{ marginTop: "0.5rem", textAlign: "right" }}>
          {/* Configure Product Button (outside of any form) */}
          <Button
            type="button"
            onClick={handleConfigure}
            disabled={!isDataLoaded}
          >
            Configure Product
          </Button>
          {/* Activate/Deactivate Button in its own form */}
          <Form method="post" style={{ display: "inline-block", marginLeft: "0.5rem" }}>
            <input type="hidden" name="productId" value={product.id} />
            <input
              type="hidden"
              name="isConfigured"
              value={(!isConfigured).toString()}
            />
            <Button submit disabled={isSubmitting || !isDataLoaded}>
              {isConfigured ? "Deactivate" : "Activate"}
            </Button>
          </Form>
          {isDataLoaded && (
            <ConfigureProductModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              dbImages={dbImages}
              dbColors={dbColors}
              dbShapes={dbShapes}
              product={product}
              onConfigure={() => {
                // When configuration is confirmed in the modal, submit the change.
                const formData = new FormData();
                formData.append("productId", product.id);
                formData.append("isConfigured", (!isConfigured).toString());
                submit(formData, { method: "post" });
                setIsModalOpen(false);
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </ResourceList.Item>
  );
}

export default function ProductsPage() {
  const { products, dbImages, dbColors, dbShapes } =
    useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isLoading =
    navigation.state === "loading" ||
    !isDataLoaded ||
    !products ||
    !dbImages ||
    !dbColors ||
    !dbShapes;
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (products && dbImages && dbColors && dbShapes) {
      setIsDataLoaded(true);
    }
  }, [products, dbImages, dbColors, dbShapes]);

  const vendors = useMemo(() => {
    const uniqueVendors = new Set(
      products.map((p: { node: { vendor: any } }) => p.node.vendor)
    );
    return Array.from(uniqueVendors);
  }, [products]);

  const tags = useMemo(() => {
    const allTags = new Set(
      products.flatMap((p: { node: { tags: any } }) => p.node.tags || [])
    );
    return Array.from(allTags);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const matchesSearch = product.node.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesVendor =
        !vendorFilter || product.node.vendor === vendorFilter;
      const matchesTag =
        !tagFilter ||
        (product.node.tags && product.node.tags.includes(tagFilter));
      return matchesSearch && matchesVendor && matchesTag;
    });
  }, [products, searchQuery, vendorFilter, tagFilter]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleVendorChange = useCallback((value: string) => {
    setVendorFilter(value);
  }, []);

  const handleTagChange = useCallback((value: string) => {
    setTagFilter(value);
  }, []);

  const resourceName: ResourceListProps["resourceName"] = {
    singular: "product",
    plural: "products",
  };

  if (isLoading) {
    return (
      <Frame>
        <Page>
          <Layout>
            <Layout.Section>
              <Card>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "40px",
                  }}
                >
                  <Loading />
                  <Text variant="bodyMd" as="p" alignment="center">
                    Please wait...
                  </Text>
                </div>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
      </Frame>
    );
  }

  return (
    <Frame>
      <Page fullWidth title="Product Options">
        <TitleBar title="All Products" />
        <Layout>
          <Layout.Section>
            <Card>
              <div
                style={{
                  padding: "16px",
                  display: "flex",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 300px" }}>
                  <TextField
                    label="Product Title"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoComplete="off"
                    placeholder="Search products..."
                  />
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <Select
                    label="Vendor"
                    options={[
                      { label: "All vendors", value: "" },
                      ...vendors.map((vendor) => ({
                        label: vendor,
                        value: vendor,
                      })),
                    ]}
                    value={vendorFilter}
                    onChange={handleVendorChange}
                  />
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <Select
                    label="Tag"
                    options={[
                      { label: "All tags", value: "" },
                      ...tags.map((tag) => ({
                        label: tag,
                        value: tag,
                      })),
                    ]}
                    value={tagFilter}
                    onChange={handleTagChange}
                  />
                </div>
              </div>
            </Card>
            <div style={{ marginTop: "16px" }}>
              <Card padding="0">
                <ResourceList
                  resourceName={resourceName}
                  items={filteredProducts}
                  renderItem={(item: Product) => (
                    <ProductItem
                      product={item.node}
                      dbImages={dbImages}
                      dbColors={dbColors}
                      dbShapes={dbShapes}
                      isSubmitting={isSubmitting}
                      isDataLoaded={isDataLoaded}
                    />
                  )}
                  selectedItems={selectedItems}
                  loading={isSubmitting}
                  emptyState={
                    <EmptyState
                      heading="No products found"
                      image="/empty-state-products.svg"
                    >
                      <p>Try changing your search or filter criteria.</p>
                    </EmptyState>
                  }
                />
              </Card>
            </div>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
