import { useState, useCallback } from "react";
import {
  Modal,
  TextContainer,
  Button,
  Select,
  TextField,
  Thumbnail,
  DropZone,
  Text,
  InlineStack,
  BlockStack,
  InlineGrid,
  Tag,
  Box,
  ColorPicker,
  Icon,
} from "@shopify/polaris";
import {
  DeleteIcon
} from '@shopify/polaris-icons';

interface SecondaryImage {
  file: File | null;
  preview: string;
  price: string;
}

interface ColorOption {
  label: string;
  value: string;
  hex: string;
}

interface ProductConfigForm {
  selectedColors: string[];
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
  onConfigure: (productId: string, formData: ProductConfigForm) => void;
  isSubmitting: boolean;
}

const COLOR_OPTIONS: ColorOption[] = [
  { label: "Classic Red", value: "red", hex: "#FF0000" },
  { label: "Royal Blue", value: "blue", hex: "#0000FF" },
  { label: "Forest Green", value: "green", hex: "#228B22" },
  { label: "Sunflower Yellow", value: "yellow", hex: "#FFD700" },
  { label: "Jet Black", value: "black", hex: "#000000" },
  { label: "Pure White", value: "white", hex: "#FFFFFF" },
  { label: "Navy Blue", value: "navy", hex: "#000080" },
  { label: "Burgundy", value: "burgundy", hex: "#800020" },
  { label: "Teal", value: "teal", hex: "#008080" },
  { label: "Purple", value: "purple", hex: "#800080" },
  { label: "Orange", value: "orange", hex: "#FFA500" },
  { label: "Pink", value: "pink", hex: "#FFC0CB" },
  { label: "Brown", value: "brown", hex: "#8B4513" },
  { label: "Gray", value: "gray", hex: "#808080" },
  { label: "Olive", value: "olive", hex: "#808000" },
  { label: "Maroon", value: "maroon", hex: "#800000" },
  { label: "Coral", value: "coral", hex: "#FF7F50" },
  { label: "Turquoise", value: "turquoise", hex: "#40E0D0" },
];

export function ConfigureProductModal({
  open,
  onClose,
  product,
  onConfigure,
  isSubmitting,
}: ConfigureProductModalProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [secondaryImages, setSecondaryImages] = useState<SecondaryImage[]>([
    { file: null, preview: "", price: "" },
  ]);

  const baseImageUrl = product?.images?.edges[0]?.node?.url || "";

  const handleColorChange = (value: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(value)) {
        return prev.filter((color) => color !== value);
      }
      return [...prev, value];
    });
  };

  const handleAddMoreImages = () => {
    setSecondaryImages([
      ...secondaryImages,
      { file: null, preview: "", price: "" },
    ]);
  };

  const handleRemoveImage = (index: number) => {
    const newSecondaryImages = secondaryImages.filter((_, i) => i !== index);
    setSecondaryImages(newSecondaryImages);
  };

  const handleRemoveColor = (colorValue: string) => {
    setSelectedColors((prev) => prev.filter((color) => color !== colorValue));
  };

  const handlePriceChange = (index: number, value: string) => {
    const newSecondaryImages = [...secondaryImages];
    newSecondaryImages[index] = {
      ...newSecondaryImages[index],
      price: value,
    };
    setSecondaryImages(newSecondaryImages);
  };

  const handleDropZoneDrop = useCallback(
    (index: number) =>
      (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
          const newSecondaryImages = [...secondaryImages];
          newSecondaryImages[index] = {
            ...newSecondaryImages[index],
            file,
            preview: URL.createObjectURL(file),
          };
          setSecondaryImages(newSecondaryImages);
        }
      },
    [secondaryImages],
  );

  const handleSubmit = () => {
    const formData: ProductConfigForm = {
      selectedColors,
      secondaryImages,
    };
    onConfigure(product.id, formData);
  };

  const isFormValid = () => {
    return (
      selectedColors.length > 0 &&
      secondaryImages.every(
        (img) => img.file && img.price && !isNaN(Number(img.price)),
      )
    );
  };

  const [color, setColor] = useState({
    hue: 120,
    brightness: 1,
    saturation: 1,
  });

  return (
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
        <BlockStack gap="5">
          <InlineGrid columns={2} gap="5">
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
                <Text as="p" variant="bodySm" alignment="center" tone="subdued">
                  Base Product Image
                </Text>
              </div>
            </div>
            <BlockStack gap="4">
              <Text as="h2" variant="headingMd">
                Available Colors
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
                  {COLOR_OPTIONS.map((color) => (
                    <div
                      key={color.value}
                      onClick={() => handleColorChange(color.value)}
                      className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <InlineStack gap="8px" align="start" blockAlign="end">
                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            backgroundColor: color.hex,
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            marginBottom: "4px",
                            marginRight: "4px",
                          }}
                        />
                        <Text as="span" variant="bodyMd">
                          {color.label}
                        </Text>
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(color.value)}
                          onChange={() => {}}
                          className="ml-auto"
                        />
                      </InlineStack>
                    </div>
                  ))}
                </div>
              </div>
              <InlineStack gap="400" blockAlign="center">
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
              <Button variant="secondary">
                + Add More
              </Button>
              </InlineStack>
              <div style={{ marginBottom: "20px" }}>
                <Text as="h2" variant="headingMd">
                  Selected Colors:
                </Text>
                <Box paddingBlock="3" paddingBlockStart="200">
                  <InlineStack gap="200" wrap>
                    {selectedColors.map((colorValue) => {
                      const colorOption = COLOR_OPTIONS.find(
                        (c) => c.value === colorValue,
                      );
                      return (
                        <Tag
                          key={colorValue}
                          onRemove={() => handleRemoveColor(colorValue)}
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
                                backgroundColor: colorOption?.hex,
                                border: "1px solid #ddd",
                                borderRadius: "2px",
                                display: "inline-block",
                              }}
                            />
                            {colorOption?.label}
                          </InlineStack>
                        </Tag>
                      );
                    })}
                  </InlineStack>
                </Box>
              </div>
            </BlockStack>
          </InlineGrid>

          <BlockStack gap="5">
            {secondaryImages.map((image, index) => (
              <div
                style={{
                  padding: "5px",
                  borderRadius: "5px",
                  border: "2px",
                }}
              >
                <Box
                  key={index}
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

                    <InlineGrid columns={2} gap="4">
                      <div>
                        <DropZone
                          accept="image/*"
                          type="image"
                          onDrop={handleDropZoneDrop(index)}
                        >
                          {image.preview ? (
                            <div style={{ padding: "1rem" }}>
                              <img
                                src={image.preview}
                                alt="Preview"
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  maxHeight: "200px",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                          ) : (
                            <DropZone.FileUpload />
                          )}
                        </DropZone>
                      </div>
                      <div
                        style={{
                          marginLeft: "10px",
                        }}
                      >
                        <TextField
                          label="Addition on Base Price"
                          value={image.price}
                          onChange={(value) => handlePriceChange(index, value)}
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

          <div style={{marginTop: "8px", marginLeft: "4px"}}>
            <Button onClick={handleAddMoreImages} variant="secondary">
              Add More Images
            </Button>
          </div>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

export default ConfigureProductModal;
