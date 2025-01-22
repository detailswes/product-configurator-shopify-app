import { useState } from "react";
import {
  Modal,
  Button,
  TextField,
  Text,
  InlineStack,
  BlockStack,
  InlineGrid,
  Tag,
  Box,
  ColorPicker,
  Grid,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { Decimal } from "@prisma/client/runtime/library";

interface SecondaryImage {
  id: number;
  url: string;
  price: string;
}

interface DBColor {
  id: number;
  color_name: string;
  hex_value: string;
}

interface DBImage {
  id: number;
  url: string;
  title: string;
}

interface DBShape {
  id: number;
  shape_name: string;
  height: Decimal | null;
  width: Decimal | null;
  image: string | null;
}





interface ProductConfigForm {
  selectedColors: number[]; // Changed to store color IDs instead of strings
  secondaryImages: SecondaryImage[];
}

interface ConfigureProductModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    images: {
      edges: Array<{
        node: {
          url: string;
        };
      }>;
    };
  };
  dbImages: DBImage[];
  dbColors: DBColor[];
  dbShapes: DBShape[];

  onConfigure: (productId: string, formData: ProductConfigForm) => void;
  isSubmitting: boolean;
}

export function ConfigureProductModal({
  open,
  onClose,
  product,
  dbImages,
  dbColors,
  dbShapes,
  onConfigure,
  isSubmitting,
}: ConfigureProductModalProps) {
  const [selectedColorsText, setSelectedColorsText] = useState<number[]>([]);
  const [selectedColorsBackground, setSelectedColorsBackground] = useState<number[]>([]);
  const [secondaryImages, setSecondaryImages] = useState<SecondaryImage[]>([
    { id: 1, url: "", price: "" },
  ]);
  const [imageSelectionModal, setImageSelectionModal] = useState({
    open: false,
    currentIndex: -1,
  });

  const [selectShape, setSelectShape] = useState<DBShape | null>(null);

  const baseImageUrl = product?.images?.edges[0]?.node?.url || "";

  const handleTextColorChange = (colorId: number) => {
    setSelectedColorsText((prev) => {
      if (prev.includes(colorId)) {
        return prev.filter((id) => id !== colorId);
      }
      return [...prev, colorId];
    });
  };
  const handleBackgroundColorChange = (colorId: number) => {
    setSelectedColorsBackground((prev) => {
      if (prev.includes(colorId)) {
        return prev.filter((id) => id !== colorId);
      }
      return [...prev, colorId];
    });
  };

  const handleAddMoreImages = () => {
    setSecondaryImages([...secondaryImages, { id: 1, url: "", price: "" }]);
  };

  const handleMoreShapes = () => {
    setSelectShape([...selectShape, {id:1, url:"", price:""}]) 
  }

  const handleRemoveImage = (index: number) => {
    const newSecondaryImages = secondaryImages.filter((_, i) => i !== index);
    setSecondaryImages(newSecondaryImages);
  };

  const handleRemoveTextColor = (colorId: number) => {
    setSelectedColorsText((prev) => prev.filter((id) => id !== colorId));
  };
  const handleRemoveBackgroundColor = (colorId: number) => {
    setSelectedColorsBackground((prev) => prev.filter((id) => id !== colorId));
  };

  const handlePriceChange = (index: number, value: string) => {
    const newSecondaryImages = [...secondaryImages];
    newSecondaryImages[index] = {
      ...newSecondaryImages[index],
      price: value,
    };
    setSecondaryImages(newSecondaryImages);
  };

  const handleOpenImageSelection = (index: number) => {
    setImageSelectionModal({
      open: true,
      currentIndex: index,
    });
  };

  const handleCloseImageSelection = () => {
    setImageSelectionModal({
      open: false,
      currentIndex: -1,
    });
  };

  const handleImageSelect = (imageId: number) => {
    const selectedImage = dbImages?.find((img) => img.id === imageId);
    if (selectedImage && imageSelectionModal.currentIndex !== -1) {
      const newSecondaryImages = [...secondaryImages];
      newSecondaryImages[imageSelectionModal.currentIndex] = {
        ...newSecondaryImages[imageSelectionModal.currentIndex],
        id: selectedImage.id,
        url: selectedImage.url,
      };
      setSecondaryImages(newSecondaryImages);
      handleCloseImageSelection();
    }
  };




  const handleSubmit = async () => {
    const productId = product.id.split("/").pop() || "";
    const configurationData = {
      product_id: productId,
      text_color_id: selectedColorsText,
      background_color_id: selectedColorsBackground,
      configured_images: secondaryImages
        .filter((img) => img.id && img.price)
        .map((img) => ({
          id: img.id,
          additional_price: Number(img.price),
        })),
      shape_id: selectShape?.id || null, //selected shape id
    };

    try {
      const response = await fetch("/api/addProductConfiguration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configurationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save configuration");
      }

      onConfigure(product.id, data);
      onClose();
    } catch (error) {
      console.error("Error saving configuration:", error);
    }
  };

  const isFormValid = () => {
    return (
      selectedColorsText.length > 0 &&
      secondaryImages.every(
        (img) => img.id && img.price && !isNaN(Number(img.price)),
      )
    );
  };
  const [color, setColor] = useState({
    hue: 120,
    brightness: 1,
    saturation: 1,
  });

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Configure ${product?.title}`}
        size="large"
        primaryAction={{
          content: "Save Configuration",
          onAction: handleSubmit,
          loading: isSubmitting,
          disabled: !isFormValid() || isSubmitting,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: onClose,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="025">
            <InlineGrid columns={2} gap="025">
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <img
                    src={baseImageUrl}
                    alt={product?.title}
                    style={{ width: "70%" }}
                  />
                  <Text
                    as="p"
                    variant="bodySm"
                    alignment="center"
                    tone="subdued"
                  >
                    Base Product Image
                  </Text>
                </div>
              </div>
              <BlockStack gap="025">
                <Text as="h2" variant="headingMd">
                  Available Text Colors
                </Text>
                <div
                  className="max-h-60 overflow-y-auto p-4 border rounded"
                  style={{ marginTop: "10px" }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "10px",
                    }}
                  >
                    {dbColors?.map((color) => (
                      <div
                        key={color.id}
                        onClick={() => handleTextColorChange(color.id)}
                        className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <InlineStack gap="050" align="start" blockAlign="end">
                          <input
                            type="checkbox"
                            checked={selectedColorsText.includes(color.id)}
                            onChange={() => { }}
                            className="ml-auto"
                          />
                          <div
                            style={{
                              width: "14px",
                              height: "14px",
                              backgroundColor: color.hex_value,
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              marginBottom: "4px",
                              marginRight: "4px",
                            }}
                          />
                          <Text as="span" variant="bodyMd">
                            {color.color_name}
                          </Text>
                        </InlineStack>
                      </div>
                    ))}
                  </div>
                </div>

                {/* <InlineStack gap="400" blockAlign="center">
                  <div style={{ marginTop: "20px" }}>
                    <Text as="h2" variant="headingMd">
                      Custom Color:
                    </Text>
                    <div
                      style={{
                        transform: "scale(0.8)",
                        transformOrigin: "top left",
                      }}
                    >
                      <ColorPicker onChange={setColor} color={color} />
                    </div>
                  </div>
                  <Button variant="secondary">+ Add More</Button>
                </InlineStack> */}

                <div style={{ marginBottom: "20px" }}>
                  <Text as="h2" variant="headingMd">
                    Selected Colors:
                  </Text>
                  <Box paddingBlock="025" paddingBlockStart="200">
                    <InlineStack gap="200" wrap>
                      {selectedColorsText.map((colorId) => {
                        const colorOption = dbColors.find(
                          (c) => c.id === colorId,
                        );
                        return (
                          <Tag
                            key={colorId}
                            onRemove={() => handleRemoveTextColor(colorId)}
                          >
                            <InlineStack
                              gap="100"
                              blockAlign="center"
                              align="center"
                            >
                              <div
                                style={{
                                  width: "12px",
                                  height: "12px",
                                  backgroundColor: colorOption?.hex_value,
                                  border: "1px solid #ddd",
                                  borderRadius: "2px",
                                  display: "inline-block",
                                }}
                              />
                              {colorOption?.color_name}
                            </InlineStack>
                          </Tag>
                        );
                      })}
                    </InlineStack>
                  </Box>
                </div>
              </BlockStack>

              <BlockStack gap="025">
                <Text as="h2" variant="headingMd">
                  Available Background Colors
                </Text>
                <div
                  className="max-h-60 overflow-y-auto p-4 border rounded"
                  style={{ marginTop: "10px" }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "10px",
                    }}
                  >
                    {dbColors?.map((color) => (
                      <div
                        key={color.id}
                        onClick={() => handleBackgroundColorChange(color.id)}
                        className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <InlineStack gap="050" align="start" blockAlign="end">
                          <input
                            type="checkbox"
                            checked={selectedColorsBackground.includes(color.id)}
                            onChange={() => { }}
                            className="ml-auto"
                          />
                          <div
                            style={{
                              width: "14px",
                              height: "14px",
                              backgroundColor: color.hex_value,
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              marginBottom: "4px",
                              marginRight: "4px",
                            }}
                          />
                          <Text as="span" variant="bodyMd">
                            {color.color_name}
                          </Text>
                        </InlineStack>
                      </div>
                    ))}
                  </div>
                </div>

                {/* <InlineStack gap="400" blockAlign="center">
                  <div style={{ marginTop: "20px" }}>
                    <Text as="h2" variant="headingMd">
                      Custom Color:
                    </Text>
                    <div
                      style={{
                        transform: "scale(0.8)",
                        transformOrigin: "top left",
                      }}
                    >
                      <ColorPicker onChange={setColor} color={color} />
                    </div>
                  </div>
                  <Button variant="secondary">+ Add More</Button>
                </InlineStack> */}

                <div style={{ marginBottom: "20px" }}>
                  <Text as="h2" variant="headingMd">
                    Selected Colors:
                  </Text>
                  <Box paddingBlock="025" paddingBlockStart="200">
                    <InlineStack gap="200" wrap>
                      {selectedColorsBackground.map((colorId) => {
                        const colorOption = dbColors.find(
                          (c) => c.id === colorId,
                        );
                        return (
                          <Tag
                            key={colorId}
                            onRemove={() => handleRemoveBackgroundColor(colorId)}
                          >
                            <InlineStack
                              gap="100"
                              blockAlign="center"
                              align="center"
                            >
                              <div
                                style={{
                                  width: "12px",
                                  height: "12px",
                                  backgroundColor: colorOption?.hex_value,
                                  border: "1px solid #ddd",
                                  borderRadius: "2px",
                                  display: "inline-block",
                                }}
                              />
                              {colorOption?.color_name}
                            </InlineStack>
                          </Tag>
                        );
                      })}
                    </InlineStack>
                  </Box>
                </div>
              </BlockStack>
            </InlineGrid>

            <BlockStack gap="025">
              {secondaryImages?.map((image, index) => (
                <div key={index}>
                  <Box
                    padding="400"
                    background="bg-surface-secondary"
                    borderRadius="200"
                    borderWidth="025"
                    borderColor="border"
                  >
                    <BlockStack gap="400">
                      <InlineStack gap="400" align="space-between">
                        <Text as="h3" variant="headingMd">
                          Available Image #{index + 1}
                        </Text>
                        {index > 0 && (
                          <Button
                            onClick={() => handleRemoveImage(index)}
                            variant="plain"
                            icon={DeleteIcon}
                          />
                        )}
                      </InlineStack>

                      <InlineGrid columns={2} gap="300">
                        <div>
                          <Text variant="bodyMd" as="p">
                            Select an image:
                          </Text>
                          <div style={{ marginTop: "4px" }}>
                            <Button
                              onClick={() => handleOpenImageSelection(index)}
                              variant="secondary"
                              fullWidth
                              size="large"
                            >
                              Select Image
                            </Button>
                          </div>
                          {image.url && (
                            <div style={{ marginTop: "10px" }}>
                              <img
                                src={image.url}
                                alt="Selected"
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  maxHeight: "150px",
                                  objectFit: "contain",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  padding: "4px",
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <TextField
                            label="Addition on Base Price"
                            value={image.price}
                            onChange={(value) =>
                              handlePriceChange(index, value)
                            }
                            placeholder="Enter price"
                            prefix="$"
                            type="number"
                            autoComplete="off"
                          />
                        </div>
                      </InlineGrid>
                    </BlockStack>
                  </Box>
                </div>
              ))}
            </BlockStack>

            <div style={{ marginTop: "8px", marginLeft: "4px" }}>
              <Button onClick={handleAddMoreImages} variant="secondary">
                Add More Images

              </Button>
            </div>
          </BlockStack>

        </Modal.Section>

        <Modal.Section>

          <BlockStack gap="025">
            <Text as="h2" variant="headingMd">
              Available Shapes
            </Text>
            <div
              className="max-h-60 overflow-y-auto p-4 border rounded"
              style={{ marginTop: "10px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                }}
              >
                {dbShapes?.map((shape) => (
                  <div
                    key={shape.id}
                    onClick={() => setSelectShape(shape)}
                    className={`cursor-pointer hover:bg-gray-50 p-2 rounded ${selectShape?.id === shape.id ? "bg-blue-100" : ""
                      }`}
                  >
                    <InlineStack gap="050" align="start" blockAlign="end">
                      <input
                        type="radio"
                        checked={selectShape?.id === shape.id}
                        onChange={() => { }}
                        className="ml-auto"
                      />
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          backgroundImage: `url(${shape.image || ""})`, // Optional: add image for shape preview
                          backgroundSize: "cover",
                          backgroundColor: "#eee",
                          borderRadius: "4px",
                        }}
                      />
                      <Text as="span" variant="bodyMd">
                        {shape.shape_name}
                      </Text>
                    </InlineStack>
                  </div>
                ))}
              </div>
            </div>

            {selectShape && (
              <div style={{ marginTop: "20px" }}>
                <Text as="h3" variant="bodyMd">
                  Selected Shape: {selectShape.shape_name}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  shape.height !== null && shape.height !== undefined ? shape.height.toString() : "N/A"
                  shape.width !== null && shape.width !== undefined ? shape.width.toString() : "N/A"
                </Text>
              </div>
            )}
          </BlockStack>

          <div style={{ marginTop: "8px", marginLeft: "4px" }}>
            <Button onClick={handleMoreShapes} variant="secondary">
              Add More Shapes

            </Button>
          </div>


        </Modal.Section>
      </Modal>
      <Modal
        open={imageSelectionModal.open}
        onClose={handleCloseImageSelection}
        title="Select an Image"
        size="large"
      >
        <Modal.Section>
          <div
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              padding: "10px",
            }}
          >
            <Grid>
              {dbImages?.map((dbImage) => (
                <Grid.Cell
                  key={dbImage.id}
                  columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}
                >
                  <div
                    onClick={() => handleImageSelect(dbImage.id)}
                    style={{
                      cursor: "pointer",
                      border:
                        secondaryImages[imageSelectionModal.currentIndex]
                          ?.id === dbImage.id
                          ? "2px solid #008060"
                          : "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "8px",
                      backgroundColor:
                        secondaryImages[imageSelectionModal.currentIndex]
                          ?.id === dbImage.id
                          ? "#F4F6F8"
                          : "transparent",
                      height: "142px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: "10px",
                    }}
                  >
                    <BlockStack gap="200">
                      <img
                        src={dbImage.url}
                        alt={dbImage.title}
                        style={{
                          width: "100%",
                          height: "100px",
                          maxHeight: "100px",
                          objectFit: "contain",
                        }}
                      />
                      <Text as="span" variant="bodySm" alignment="center">
                        {dbImage.title}
                      </Text>
                    </BlockStack>
                  </div>
                </Grid.Cell>
              ))}
            </Grid>
          </div>
        </Modal.Section>
      </Modal>
    </>
  );
}

export default ConfigureProductModal;
