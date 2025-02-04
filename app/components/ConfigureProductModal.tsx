import { useEffect, useState } from "react";
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
  Spinner,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { Decimal } from "@prisma/client/runtime/library";
import { CheckIcon } from "@shopify/polaris-icons";
import { data } from "@remix-run/node";
import { config } from "process";

interface SecondaryImage {
  id: number;
  url: string;
  price: string;
}

interface ValidationErrors {
  textColors?: string;
  backgroundColors?: string;
  images: {
    [key: number]: {
      selection?: string;
      price?: string;
    };
  };
  shapes: {
    [key: number]: {
      selection?: string;
      price?: string;
    };
  };
  colors: {
    [key: number]: {
      price?: string;
    };
  };
}

interface ShapeSection {
  id: number;
  selectShape: DBShape | null;
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
  height?: Decimal | null;
  width?: Decimal | null;
  image: string | null;
}

interface ProductConfigForm {
  selectedColors: number[];
  secondaryImages: SecondaryImage[];
  shapeSections: ShapeSection[];
}

interface ColorPrice {
  color_id: number;
  additional_price: string;
}

interface ConfiguredImage {
  image_id?: number;
  id?: number;
  additional_price?: number;
}

interface ConfiguredShape {
  shape_id?: number;
  id?: number;
  additional_price?: number;
}

interface ExistingConfigData {
  data: {
    images: {
      adaSignageImages: {
        id: number;
        url: string;
      };
      additional_price: number;
    }[];
    colors: {
      availableColors: {
        id: number;
        color_name: string;
        hex_value: string;
      };
    }[];
    backgroundColors: {
      availableColors: {
        id: number;
        color_name: string;
        hex_value: string;
      };
    }[];
    shapesSizes: {
      availableShapesSizes: {
        id: number;
        shape_name: string;
        image: string;
        height?: number;
        width?: number;
      };
      additional_price: number;
    }[];
  };
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
  const [isLoading, setIsLoading] = useState(true);
  const [existingConfig, setExistingConfig] = useState<any>(null);
  const [selectedColorsText, setSelectedColorsText] = useState<number[]>([]);
  const [selectedColorsBackground, setSelectedColorsBackground] = useState<number[]>([]);
  const [secondaryImages, setSecondaryImages] = useState<SecondaryImage[]>([
    { id: 1, url: "", price: "" },
  ]);
  const [imageSelectionModal, setImageSelectionModal] = useState({
    open: false,
    currentIndex: -1,
  });
  const [shapeSelectionModal, setShapeSelectionModal] = useState({
    open: false,
    currentIndex: -1,
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    images: {},
    shapes: {},
    colors: {},
  });
  const [shapeSections, setShapeSections] = useState<ShapeSection[]>([
    { id: 1, selectShape: null, price: "" },
  ]);

  const [color, setColor] = useState({
    hue: 120,
    brightness: 1,
    saturation: 1,
  });

  useEffect(() => {
    if (!open) {
      resetToDefaultState();
      return;
    }

    const fetchExistingConfiguration = async () => {
      setIsLoading(true);
      try {
        const productId = product?.id?.split("/").pop();
        console.log("Fetching configuration for product:", productId);

        if (!productId) throw new Error("Invalid product ID");

        const response = await fetch(`/api/productConfigurationList?product_id=${productId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch configuration: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched configuration:", data);

        if (data.error) {
          console.warn("No existing configuration found:", data.error);
          resetToDefaultState();
          setIsLoading(false);
          return;
        }
        console.log("data is coming", data)
        setExistingConfig(data);


        if (data.data?.colors) {
          const textColorIds = data.data.colors.map(
            (colors: { color_ids: number }) => colors.color_ids
          );
          setSelectedColorsText(textColorIds);
        }

        console.log("incoming data", data)
        if (data.data?.backgroundColors) {
          const bgColorIds = data.data.backgroundColors.map(
            (backgroundColors: { background_color_id: number }) => backgroundColors.background_color_id
          );
          setSelectedColorsBackground(bgColorIds);
        }


        if (data.data?.images) {
          const configuredImages = data.data.images.map((imgConfig: any) => {
            const matchingImage = dbImages.find(img => img.id === imgConfig.image_id);
            return {
              id: imgConfig.image_id,
              url: matchingImage?.url || "",
              price: imgConfig.additional_price.toString()
            };
          });
          setSecondaryImages(configuredImages.length > 0 ? configuredImages : [{ id: 1, url: "", price: "" }]);
        }

        // Populate shapes with complete data from dbShapes
        if (data.data?.shapesSizes) {
          const configuredShapes = data.data.shapesSizes.map((shapeConfig: any) => {
            // Find the matching shape from dbShapes
            const matchingShape = dbShapes.find(shape => shape.id === shapeConfig.shape_id);
            return {
              id: matchingShape?.id || 1,
              selectShape: matchingShape ? {
                id: matchingShape.id,
                shape_name: matchingShape.shape_name,
                image: matchingShape.image,
                height: matchingShape.height,
                width: matchingShape.width
              } : null,
              price: shapeConfig.additional_price.toString()
            };
          });
          setShapeSections(configuredShapes.length > 0 ? configuredShapes : [{ id: 1, selectShape: null, price: "" }]);
        }

      } catch (error) {
        console.error("Error fetching configuration:", error);
        resetToDefaultState();
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingConfiguration();
  }, [open, product?.id, dbShapes, dbImages]);

  const renderSelectedColors = (selectedColors: any[], handleRemove: (arg0: any) => void) => (
    <Box paddingBlock="025" paddingBlockStart="200">
      <InlineStack gap="200" wrap>
        {selectedColors.map((colorId: React.Key | null | undefined) => {
          const colorOption = dbColors.find((c) => c.id === colorId);
          if (!colorOption) return null;

          return (
            <Tag
              key={colorId}
              onRemove={() => handleRemove(colorId)}
            >
              <InlineStack gap="100" blockAlign="center" align="center">
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: colorOption.hex_value,
                    border: "1px solid #ddd",
                    borderRadius: "2px",
                    display: "inline-block",
                  }}
                />
                <span>{colorOption.color_name}</span>
              </InlineStack>
            </Tag>
          );
        })}
      </InlineStack>
    </Box>
  );

  const resetToDefaultState = () => {
    setSelectedColorsText([]);
    setSelectedColorsBackground([]);
    setSecondaryImages([{ id: 1, url: "", price: "" }]);
    setShapeSections([{ id: 1, selectShape: null, price: "" }]);
    setExistingConfig(null);
  };

  const validateForm = () => {
    const errors: ValidationErrors = {
      images: {},
      shapes: {},
      colors: {},
    };
    let hasErrors = false;

    if (selectedColorsText.length === 0) {
      errors.textColors = "Please select at least one text color";
      hasErrors = true;
    }

    if (selectedColorsBackground.length === 0) {
      errors.backgroundColors = "Please select at least one background color";
      hasErrors = true;
    }

    secondaryImages.forEach((img, index) => {
      errors.images[index] = {};

      if (!img.url) {
        errors.images[index].selection = "Please select an image";
        hasErrors = true;
      }

      if (!img.price || isNaN(Number(img.price)) || Number(img.price) < 0) {
        errors.images[index].price = "Please enter a valid price";
        hasErrors = true;
      }
    });

    shapeSections.forEach((section, index) => {
      errors.shapes[index] = {};

      if (!section.selectShape) {
        errors.shapes[index].selection = "Please select a shape";
        hasErrors = true;
      }

      if (!section.price || isNaN(Number(section.price)) || Number(section.price) < 0) {
        errors.shapes[index].price = "Please enter a valid price";
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    return !hasErrors;
  };

  const isLastShapeValid = () => {
    const lastShape = shapeSections[shapeSections.length - 1];
    return (
      lastShape.selectShape !== null &&
      lastShape.selectShape?.shape_name &&
      lastShape.price &&
      !isNaN(Number(lastShape.price)) &&
      Number(lastShape.price) >= 0
    );
  };

  const handleAddNewShapeSection = () => {
    if (isLastShapeValid()) {
      const newShapeSection = {
        id: shapeSections.length + 1,
        selectShape: null,
        price: "",
      };
      setShapeSections([...shapeSections, newShapeSection]);
    }
  };

  const handleOpenShapeSelection = (index: number) => {
    setShapeSelectionModal({
      open: true,
      currentIndex: index,
    });
  };

  const handleCloseShapeSelection = () => {
    setShapeSelectionModal({
      open: false,
      currentIndex: -1,
    });
  };

  const handleShapeSelect = (shapeId: number) => {
    const isShapeAlreadySelected = shapeSections.some(
      (section, idx) => section.selectShape?.id === shapeId && idx !== shapeSelectionModal.currentIndex
    );
    if (isShapeAlreadySelected) return;

    const selectedShape = dbShapes.find((shape) => shape.id === shapeId);
    if (selectedShape && shapeSelectionModal.currentIndex !== -1) {
      const updatedSections = [...shapeSections];
      updatedSections[shapeSelectionModal.currentIndex] = {
        ...updatedSections[shapeSelectionModal.currentIndex],
        selectShape: selectedShape,
      };
      setShapeSections(updatedSections);
      setValidationErrors(prev => ({
        ...prev,
        shapes: {
          ...prev.shapes,
          [shapeSelectionModal.currentIndex]: {
            ...prev.shapes[shapeSelectionModal.currentIndex],
            selection: undefined,
          },
        },
      }));
      handleCloseShapeSelection();
    }
  };

  const handleShapePriceChange = (index: number, value: string) => {
    const numValue = Number(value);
    if (numValue < 0) return;
    const newShapeSections = [...shapeSections];
    newShapeSections[index] = {
      ...newShapeSections[index],
      price: value,
    };
    setShapeSections(newShapeSections);
    if (!isNaN(numValue) && numValue >= 0) {
      setValidationErrors(prev => ({
        ...prev,
        shapes: {
          ...prev.shapes,
          [index]: {
            ...prev.shapes[index],
            price: undefined,
          },
        },
      }));
    }
  };

  const baseImageUrl = product?.images?.edges[0]?.node?.url || "";

  const handleTextColorChange = (colorId: number) => {
    setSelectedColorsText((prev) => {
      const updated = prev.includes(colorId)
        ? prev.filter((id) => id !== colorId)
        : [...prev, colorId];

      if (updated.length > 0) {
        setValidationErrors(prev => ({
          ...prev,
          textColors: undefined,
        }));
      }

      return updated;
    });
  };

  const handleBackgroundColorChange = (colorId: number) => {
    setSelectedColorsBackground((prev) => {
      const updated = prev.includes(colorId)
        ? prev.filter((id) => id !== colorId)
        : [...prev, colorId];

      if (updated.length > 0) {
        setValidationErrors(prev => ({
          ...prev,
          backgroundColors: undefined,
        }));
      }

      return updated;
    });
  };

  const isLastImageValid = () => {
    const lastImage = secondaryImages[secondaryImages.length - 1];
    return (
      lastImage.url &&
      lastImage.price &&
      !isNaN(Number(lastImage.price)) &&
      Number(lastImage.price) >= 0
    );
  };

  const handleAddMoreImages = () => {
    if (isLastImageValid()) {
      setSecondaryImages([...secondaryImages, { id: 1, url: "", price: "" }]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newSecondaryImages = secondaryImages.filter((_, i) => i !== index);
    setSecondaryImages(newSecondaryImages);
  };

  const handleRemoveShapeImage = (index: number) => {
    const newSecondaryShape = shapeSections.filter((_, i) => i !== index);
    setShapeSections(newSecondaryShape);
  };

  const handleRemoveTextColor = (colorId: number) => {
    setSelectedColorsText((prev) => prev.filter((id) => id !== colorId));
  };

  const handleRemoveBackgroundColor = (colorId: number) => {
    setSelectedColorsBackground((prev) => prev.filter((id) => id !== colorId));
  };

  const handlePriceChange = (index: number, value: string) => {
    const numValue = Number(value);
    if (numValue < 0) return;
    const newSecondaryImages = [...secondaryImages];
    newSecondaryImages[index] = {
      ...newSecondaryImages[index],
      price: value,
    };
    setSecondaryImages(newSecondaryImages);
    if (!isNaN(numValue) && numValue >= 0) {
      setValidationErrors(prev => ({
        ...prev,
        images: {
          ...prev.images,
          [index]: {
            ...prev.images[index],
            price: undefined,
          },
        },
      }));
    }
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
    const isImageAlreadySelected = secondaryImages.some(
      (img, idx) => img.id === imageId && idx !== imageSelectionModal.currentIndex
    );
    if (isImageAlreadySelected) return;

    const selectedImage = dbImages?.find((img) => img.id === imageId);
    if (selectedImage && imageSelectionModal.currentIndex !== -1) {
      const newSecondaryImages = [...secondaryImages];
      newSecondaryImages[imageSelectionModal.currentIndex] = {
        ...newSecondaryImages[imageSelectionModal.currentIndex],
        id: selectedImage.id, // Ensure this is set correctly
        url: selectedImage.url,
      };
      setSecondaryImages(newSecondaryImages);
      setValidationErrors(prev => ({
        ...prev,
        images: {
          ...prev.images,
          [imageSelectionModal.currentIndex]: {
            ...prev.images[imageSelectionModal.currentIndex],
            selection: undefined,
          },
        },
      }));
      handleCloseImageSelection();
    }
  };
  const handleSubmit = async () => {
    console.log("submit button clcike")
    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }

    try {
      const productId = product.id.split("/").pop() || "";

      // Fix the configured_images mapping
      const configurationData = {
        product_id: productId,
        text_color_id: selectedColorsText,
        background_color_id: selectedColorsBackground,
        configured_images: secondaryImages
          .filter((img) => img.url && img.price)
          .map((img) => ({

            id: Number(img.id),
            additional_price: parseFloat(img.price)
          })),
        configured_shapes: shapeSections
          .filter((section) => section.selectShape && section.price)
          .map((section) => ({

            id: Number(section.selectShape!.id),
            additional_price: parseFloat(section.price)
          }))
      };

      console.log("Submitting configuration:", configurationData);

      const endpoint = existingConfig
        ? `/api/updateProductConfiguration`
        : '/api/addProductConfiguration';

      const response = await fetch(endpoint, {
        method: existingConfig ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configurationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save configuration');
      }

      const responseData = await response.json();
      console.log("Configuration saved successfully:", responseData);

      const formData: ProductConfigForm = {
        selectedColors: selectedColorsText,
        secondaryImages: secondaryImages,
        shapeSections: shapeSections
      };

      onConfigure(product.id, formData);
      onClose();
    } catch (error) {
      console.error("Error saving configuration:", error);
    }
  };

  if (isLoading) {
    return (
      <Modal open={open} onClose={onClose} title="Loading Configuration">
        <Modal.Section>
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <Spinner accessibilityLabel="Loading configuration" size="large" />
          </div>
        </Modal.Section>
      </Modal>
    );
  }
  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`${(existingConfig?.data?.colors?.length > 0) ? 'Update' : 'Configure'} ${product?.title}`}
        size="large"
        primaryAction={{

          content: (existingConfig?.data?.colors?.length > 0)
            ? 'Update Configuration'
            : 'Save Configuration',

          onAction: handleSubmit,
          loading: isSubmitting,
        }}
      >
        <Modal.Section>
          <BlockStack gap="025">
            <InlineGrid columns={2} gap="025">
              <div style={{ display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: "center" }}>
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

                {validationErrors.textColors && (
                  <Text as="span" tone="critical" variant="bodySm">
                    {validationErrors.textColors}
                  </Text>
                )}

                <div style={{ marginBottom: "20px", marginTop: "20px" }}>
                  <Text as="h2" variant="headingMd">
                    Selected Colors:
                  </Text>
                  <Box paddingBlock="025" paddingBlockStart="200">
                    <InlineStack gap="200" wrap>
                      {selectedColorsText.map((colorId) => {
                        const colorOption = dbColors.find((c) => c.id === colorId);
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

                  <div style={{ marginTop: "40px" }}>
                    <BlockStack gap="025" >
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
                      {validationErrors.backgroundColors && (
                        <Text as="span" tone="critical" variant="bodySm">
                          {validationErrors.backgroundColors}
                        </Text>
                      )}

                      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
                        <Text as="h2" variant="headingMd">
                          Selected Colors:
                        </Text>
                        <Box paddingBlock="025" paddingBlockStart="200">
                          <InlineStack gap="200" wrap>
                            {selectedColorsBackground.map((colorId) => {
                              const colorOption = dbColors.find((c) => c.id === colorId);
                              return (
                                <Tag key={colorId} onRemove={() => handleRemoveBackgroundColor(colorId)}>
                                  <InlineStack gap="100" blockAlign="center" align="center">
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

                      {/* testttt */}
                    </BlockStack>
                  </div>
                </div>
              </BlockStack>
            </InlineGrid>


          </BlockStack>



          <BlockStack gap="025">
            {secondaryImages?.map((image, index) => (
              <div key={index}>
                <Box
                  padding="400"
                  background="bg-surface-secondary"
                  borderRadius="200"
                  borderWidth="025"
                  borderColor={validationErrors.images[index]?.selection || validationErrors.images[index]?.price ? "border-critical" : "border"}
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
                          onChange={(value) => handlePriceChange(index, value)}
                          placeholder="0"
                          prefix="$"
                          type="number"
                          autoComplete="off"
                          error={validationErrors.images[index]?.price}
                        />
                      </div>
                    </InlineGrid>
                  </BlockStack>
                </Box>
              </div>
            ))}
            <div style={{ marginTop: "8px", marginBottom: "30px", marginLeft: "4px" }}>
              <Button onClick={handleAddMoreImages} variant="secondary" disabled={!isLastImageValid()}>
                Add More Images
              </Button>
            </div>
          </BlockStack>
          {imageSelectionModal.open && (
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
                    {dbImages.map((image) => {
                      const isAlreadySelected = secondaryImages.some(
                        (img, index) =>
                          img.id === image.id &&
                          index !== imageSelectionModal.currentIndex
                      );

                      return (
                        <Grid.Cell
                          key={image.id}
                          columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}
                        >
                          <div
                            onClick={() => {
                              if (!isAlreadySelected) {
                                handleImageSelect(image.id);
                              }
                            }}
                            style={{
                              cursor: isAlreadySelected ? "not-allowed" : "pointer",
                              opacity: isAlreadySelected ? "0.5" : "1",
                              border:
                                secondaryImages[imageSelectionModal.currentIndex]?.id === image.id
                                  ? "2px solid #008060"
                                  : "1px solid #ddd",
                              borderRadius: "8px",
                              padding: "8px",
                              backgroundColor:
                                secondaryImages[imageSelectionModal.currentIndex]?.id === image.id
                                  ? "#F4F6F8"
                                  : "transparent",
                              height: "142px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              margin: "10px",
                              position: "relative"
                            }}
                          >
                            {isAlreadySelected && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "8px",
                                  right: "8px",
                                  backgroundColor: "#008060",
                                  borderRadius: "100%",
                                  padding: "2px",
                                  display: "flex",
                                  alignItems: "center", 
                                  justifyContent: "center"
                                }}
                              >
                                <CheckIcon style={{ width: '24px', height: '24px', color: 'green' }} />
                              </div>
                            )}
                            <BlockStack gap="100">
                              <img
                                src={image.url}
                                alt={image.title}
                                style={{
                                  width: "100%",
                                  height: "100px",
                                  maxHeight: "100px",
                                  objectFit: "contain",
                                }}
                              />
                              <Text as="span" variant="bodySm" alignment="center">
                                {image.title}
                              </Text>
                            </BlockStack>
                          </div>
                        </Grid.Cell>
                      );
                    })}
                  </Grid>
                </div>
              </Modal.Section>
            </Modal>
          )}
          <BlockStack gap="025">
            {shapeSections.map((section, index) => (
              <div key={index}>
                <Box
                  padding="400"
                  background="bg-surface-secondary"
                  borderRadius="200"
                  borderWidth="025"
                  borderColor={validationErrors.shapes[index]?.selection || validationErrors.shapes[index]?.price ? "border-critical" : "border"}
                >
                  <BlockStack gap="400">
                    <InlineStack gap="400" align="space-between">
                      <Text as="h3" variant="headingMd">
                        Available Shape #{index + 1}
                      </Text>
                      {index > 0 && (
                        <Button
                          onClick={() => handleRemoveShapeImage(index)}
                          variant="plain"
                          icon={DeleteIcon}
                        />
                      )}
                    </InlineStack>
                    <InlineGrid columns={2} gap="300">
                      <div>
                        <Text variant="bodyMd" as="p">
                          Select a shape:
                        </Text>
                        <div style={{ marginTop: "4px" }}>
                          <Button
                            onClick={() => handleOpenShapeSelection(index)}
                            variant="secondary"
                            fullWidth
                            size="large"
                          >
                            Select Shapes
                          </Button>
                        </div>
                        {section.selectShape && (
                          <div style={{ marginTop: "10px" }}>
                            <img
                              src={section.selectShape.image || ''}
                              alt={section.selectShape.shape_name}
                              style={{
                                width: "100%",
                                height: "auto",
                                maxHeight: "150px",
                                objectFit: "contain",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                padding: "4px",
                                position: "relative"
                              }}
                            />
                            <BlockStack gap="050">
                              <Text as="p" variant="bodyMd" fontWeight="medium">
                                {section.selectShape.shape_name}
                              </Text>
                              {section.selectShape.width && section.selectShape.height && (
                                <Text as="p" variant="bodySm" tone="subdued">
                                  {`${section.selectShape.width}" x ${section.selectShape.height}"`}
                                </Text>
                              )}
                            </BlockStack>
                          </div>
                        )}
                      </div>
                      <div>
                        <TextField
                          label="Addition on Base Price"
                          value={section.price}
                          onChange={(value) => handleShapePriceChange(index, value)}
                          placeholder="0"
                          prefix="$"
                          type="number"
                          autoComplete="off"
                          error={validationErrors.shapes[index]?.price}
                        />
                      </div>
                    </InlineGrid>
                  </BlockStack>
                </Box>
              </div>
            ))}
            <div style={{ marginTop: "8px", marginLeft: "4px" }}>
              <Button variant="secondary" onClick={handleAddNewShapeSection} disabled={!isLastShapeValid()}>
                Add More shape
              </Button>
            </div>
          </BlockStack>

          {shapeSelectionModal.open && (
            <Modal
              open={shapeSelectionModal.open}
              onClose={handleCloseShapeSelection}
              title="Select a Shape"
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
                    {dbShapes.map((shape) => {
                      const isAlreadySelected = shapeSections.some(
                        (section, index) =>
                          section.selectShape?.id === shape.id &&
                          index !== shapeSelectionModal.currentIndex
                      );

                      return (
                        <Grid.Cell
                          key={shape.id}
                          columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}
                        >
                          <div
                            onClick={() => {
                              if (!isAlreadySelected) {
                                handleShapeSelect(shape.id);
                              }
                            }}
                            style={{
                              cursor: isAlreadySelected ? "not-allowed" : "pointer",
                              opacity: isAlreadySelected ? "0.5" : "1",
                              border:
                                shapeSections[shapeSelectionModal.currentIndex]?.selectShape?.id === shape.id
                                  ? "2px solid #008060"
                                  : "1px solid #ddd",
                              borderRadius: "8px",
                              padding: "8px",
                              backgroundColor:
                                shapeSections[shapeSelectionModal.currentIndex]?.selectShape?.id === shape.id
                                  ? "#F4F6F8"
                                  : "transparent",
                              height: "142px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              margin: "10px",
                              position: "relative"
                            }}
                          >
                            {isAlreadySelected && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "8px",
                                  right: "8px",
                                  backgroundColor: "#008060",
                                  borderRadius: "100%",
                                  padding: "2px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                              >
                                <CheckIcon style={{ width: '24px', height: '24px', color: 'green' }} />
                              </div>
                            )}
                            <BlockStack gap="100">
                              <img
                                src={shape.image || ''}
                                alt={shape.shape_name}
                                style={{
                                  width: "100%",
                                  height: "100px",
                                  maxHeight: "100px",
                                  objectFit: "contain",
                                }}
                              />
                              <Text as="span" variant="bodySm" alignment="center">
                                {shape.shape_name}
                              </Text>
                              {shape.width && shape.height && (
                                <Text as="span" variant="bodySm" tone="subdued">
                                  {`${shape.width}" x ${shape.height}"`}
                                </Text>
                              )}
                            </BlockStack>
                          </div>
                        </Grid.Cell>
                      );
                    })}
                  </Grid>
                </div>
              </Modal.Section>
            </Modal>
          )}
        </Modal.Section>
      </Modal>
    </>
  );
}