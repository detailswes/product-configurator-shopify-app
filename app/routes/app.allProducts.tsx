import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceListProps,
  Thumbnail,
  Text,
  Badge,
  Button,
  Loading,
  EmptyState,
  TextField,
  Select,
  Tag,
  Frame,
  Banner,
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
import { useCallback, useState, useMemo } from "react";
import { Product } from "app/types";
import { FETCH_PRODUCTS, UPDATE_PRODUCT_METAFIELD } from "app/graphql/producs";
import { ConfigureProductModal } from "app/components/ConfigureProductModal";
import prisma from "../db.server";
import { describe } from "node:test";
import { Decimal } from "@prisma/client/runtime/library";
interface DBImage {
  id: number;
  url: string;  // Changed from image_url to match component
  title: string;  // Changed from image_name to match component
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
  width: Decimal | null ;
  image: string | null;
}

interface LoaderData {
  products: Product[];
  dbImages: DBImage[];
  dbColors: DBColor[];
  dbShape: DBShape[];
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
        // Only get images where image_name is not null
        image_name: {
          not: null
        }
      }
    });
    const dbColorsRaw = await prisma.availableColors.findMany({
      select: {
        id: true,
        color_name: true,
        hex_value: true,
      }
    });

    
    const dbShapaSizeRaw = await prisma.availableShapesSizes.findMany({
      select:{
        id:true,
        shape_name:true,
        height:true,
        width:true,
        image:true
      },
    })
    console.log("dbShapaSizeRaw",dbShapaSizeRaw)


   


    // Transform the data to match the expected types
    const dbImages: DBImage[] = dbImagesRaw.map(img => ({
      id: img.id,
      url: img.image_url,
      title: img.image_name || 'Untitled' // Provide a default value if null
    }));
    const dbColors: DBColor[] = dbColorsRaw.map(color => ({
      id: color.id,
      color_name: color.color_name,
      hex_value: color.hex_value,
    }));

    const dbShapes: DBShape[] = dbShapaSizeRaw.map(shape => ({
      id: shape.id,
      shape_name: shape.shape_name,
      height: shape.height,
      width: shape.width,
      image: shape.image
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
    if (data.data.productUpdate.userErrors.length > 0) {
      return json(
        { error: data.data.productUpdate.userErrors[0].message },
        { status: 400 },
      );
    }
    return json({ success: true });
  } catch (error) {
    return json({ error: "Failed to update product" }, { status: 500 });
  }
}

export default function ProductsPage() {
  const { products,dbImages,dbColors, dbShapes } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const isLoading = navigation.state === "loading";
  const isSubmitting = navigation.state === "submitting";

  // Filter logic remains the same...
  const vendors = useMemo(() => {
    const uniqueVendors = new Set(
      products.map((p: { node: { vendor: any } }) => p.node.vendor),
    );
    return Array.from(uniqueVendors);
  }, [products]);

  const tags = useMemo(() => {
    const allTags = new Set(
      products.flatMap((p: { node: { tags: any } }) => p.node.tags || []),
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

  const renderItem = (item: Product) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const submit = useSubmit();

    const handleConfigure = (productId: string) => {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("isConfigured", (!isConfigured).toString());
      submit(formData, { method: "post" });
      setIsModalOpen(false);
    };

    const product = item.node;
    const imageUrl = product.images.edges[0]?.node.url || "";
    const price = parseFloat(product.priceRangeV2.minVariantPrice.amount);
    const currency = product.priceRangeV2.minVariantPrice.currencyCode;
    const isConfigured = product.metafield
      ? product.metafield.value === "true"
      : false;

    return (
      <ResourceList.Item
        id={product.id}
        media={
          <Thumbnail source={imageUrl} alt={product.title} size="medium" />
        }
        persistActions
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Text variant="bodyMd" fontWeight="bold" as="h3">
              {product.title}
            </Text>
            <div style={{ marginTop: "0.25rem" }}>
              <Text variant="bodyMd" as="p">
                {product.vendor}
              </Text>
            </div>
            <div
              style={{ marginTop: "0.25rem", display: "flex", gap: "0.5rem" }}
            >
              {/* <Badge>{product.status.toLowerCase()}</Badge> */}
              {/* <Text variant="bodyMd" as="p">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: currency,
                }).format(price)}
              </Text>
              <Text variant="bodyMd" as="p">
                {product.totalInventory} in stock
              </Text> */}
            </div>
          </div>
          <div style={{ marginTop: "0.5rem", textAlign: "right" }}>
            <Form method="post">
              <input type="hidden" name="productId" value={product.id} />
              <input
                type="hidden"
                name="isConfigured"
                value={(!isConfigured).toString()}
              />
              <ButtonGroup>
                <Button onClick={() => setIsModalOpen(true)}>
                  Configure Product
                </Button>
                <Button submit disabled={isSubmitting}>
                  {isConfigured ? "Deactivate" : "Activate"}
                </Button>
              </ButtonGroup>
            </Form>
            <ConfigureProductModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              dbImages={dbImages || []}
              dbColors={dbColors || []}
              dbShapes={dbShapes || []}
             
              product={product}
              onConfigure={handleConfigure}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </ResourceList.Item>
    );
  };

  if (isLoading) {
    return (
      <Frame>
        <Page>
          <Loading />
        </Page>
      </Frame>
    );
  }

  const resourceName: ResourceListProps["resourceName"] = {
    singular: "product",
    plural: "products",
  };

  return (
    <Frame>
      <Page
        fullWidth
        title="Product Options"
        // primaryAction={
        //   <Button variant="primary" url="/app/products/new">
        //     Add product
        //   </Button>
        // }
      >
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
                      ...vendors?.map((vendor) => ({
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
                      ...tags?.map((tag) => ({
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
                  renderItem={renderItem}
                  selectedItems={selectedItems}
                  loading={isSubmitting}
                  // onSelectionChange={setSelectedItems}
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
