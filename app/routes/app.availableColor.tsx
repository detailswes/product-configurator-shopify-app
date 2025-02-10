import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import {
  TextField,
  Button,
  Card,
  Layout,
  Page,
  Text,
  Frame,
  InlineError,
  Spinner,
  BlockStack,
  Loading
} from "@shopify/polaris";
import colorNamer from "color-namer";
import { data, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import prisma from "../db.server";

import { useNavigation } from "@remix-run/react";
export async function loader() {
  try {
    const colors = await prisma.availableColors.findMany({
      select: {
        id: true,
        color_name: true,
        hex_value: true,
      },
    });
    return json({ colors });
  } catch (error) {
    console.error("Error fetching colors:", error);
    return json({ colors: [] });
  }
}
interface DBColor {
  id: number;
  color_name: string;
  hex_value: string;
}

export default function ColorInputForm() {
  const loaderData = useLoaderData<{ colors: DBColor[] }>();
  const [colors, setColors] = useState(loaderData.colors);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#FF0000");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const validateHex = (hex: string) => /^#([0-9A-Fa-f]{6})$/.test(hex);
  useEffect(() => {
    if (validateHex(colorHex)) {
      try {
        const result = colorNamer(colorHex);
        let name = result.basic ? result.basic[0].name : "Custom Color";
        name = name.charAt(0).toUpperCase() + name.slice(1);
        setColorName(name);
      } catch (error) {
        setColorName("Unknown Color");
      }
    } else {
      setColorName("Invalid Color");
    }
  }, [colorHex]);
  const handleColorClick = (hex: string, name: string) => {
    setColorHex(hex);
    setColorName(name);
  };
  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setSaving(true);
    if (!validateHex(colorHex) || !colorName.trim()) {
      setErrorMessage("Invalid color details.");
      setSaving(false);
    
      return;
    }
    const colorExits = colors.some(
      (color) => color.color_name.toUpperCase() === colorName.toUpperCase()
    );

    const hexValueExists = colors.some(
      (color) => color.hex_value.toUpperCase() === colorHex.toUpperCase()
    );

    if (colorExits) {
      setErrorMessage(`${colorHex} is already exist to ${colorName}`);
      setSaving(false);
      return;
    }
    if (hexValueExists) {
      setErrorMessage(`${colorHex} is already exist to ${colorName}`);
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/addColors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          color_name: colorName.charAt(0).toUpperCase() + colorName.slice(1),
          hex_value: colorHex,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setColors([...colors, { id: Date.now(), color_name: colorName, hex_value: colorHex }]);
        setSuccessMessage("Color saved successfully!");
        setShowPicker(false)
      } else if (data.exists) {
        setErrorMessage("Color already exists.");
      } else {
        setErrorMessage(data.message || "Failed to save color.");
      }
    } catch (error) {
      setErrorMessage("Error saving color.");
    } finally {
      setSaving(false);
    }
  };
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  if (isLoading) {
    return (
      <Frame>
        <Page>
          <Layout>
            <Layout.Section>
              <Card>
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "40px"
                }}>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p" alignment="center">
                      Please Wait...
                    </Text>
                  </BlockStack>
                  <Loading />
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
      <Page >
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
                <div style={{ width: '40%' }}>
                  <Text as="h2" variant="headingMd">Enter Color Details</Text>
                  {errorMessage && <InlineError message={errorMessage} fieldID={""} />}
                  {successMessage && <Text as="p">{successMessage}</Text>}
                  <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ flexGrow: 1 }}>
                      <TextField
                        label="Color Name"
                        value={colorName}
                        onChange={(newValue) =>
                          setColorName(newValue.charAt(0).toUpperCase() + newValue.slice(1))
                        }
                        placeholder="Color name"
                        autoComplete="off"
                      />
                      <TextField
                        label="Color Hex Value"
                        value={colorHex}
                        onChange={(newValue) => setColorHex(newValue.toUpperCase())}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div>
                      <Button onClick={() => setShowPicker(!showPicker)}  >
                        {/* {showPicker ? "close color picker" : "open color picker"} */}
                        color Picker
                      </Button>
                    </div>
                    {saving ? (
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <Spinner accessibilityLabel="Saving color" />
                      </div>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={!validateHex(colorHex) || !colorName.trim() || saving}
                      >
                        Save Color
                      </Button>
                    )}
                  </div>
                  {showPicker && (
                    <>
                      <HexColorPicker
                        style={{ width: '100%', height: '13rem', marginTop: '20px' }}
                        color={colorHex}
                        onChange={(newValue) => setColorHex(newValue.toUpperCase())}
                      />
                      <div
                        style={{
                          width: "100%",
                          height: "20px",
                          backgroundColor: validateHex(colorHex) ? colorHex : "transparent",
                          marginTop: "10px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </>
                  )}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <Text as="h2" variant="headingMd">Available Text Colors</Text>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "7px",
                    width: "100%",
                  }}>
                    {colors.map((color) => (
                      <div
                        key={color.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          cursor: "pointer",
                          padding: "5px",

                        }}
                        onClick={() => handleColorClick(color.hex_value, color.color_name)}
                      >
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            backgroundColor: color.hex_value,
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                          }}
                        />
                        <Text as="p" variant="bodyMd" fontWeight="medium">
                          {color.color_name}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}

