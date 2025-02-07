import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import {
  TextField,
  Button,
  Card,
  Layout,
  Page,
  Text,
  Loading,
  Frame,
  BlockStack,
  InlineError
} from "@shopify/polaris";
import { useNavigation } from "@remix-run/react";
import colorNamer from "color-namer";

export default function ColorInputForm() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

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
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#ff0000");
 

  const validateHex = (hex: string) => /^#([0-9A-Fa-f]{6})$/.test(hex);

  useEffect(() => {
    if (validateHex(colorHex)) {
      try {
        const result = colorNamer(colorHex);
        const name = result.basic ? result.basic[0].name : "Custom Color";
        setColorName(name);
      } catch (error) {
        
        setColorName("Unknown Color");
      }
    } else {
      setColorName("Invalid Color");
    }
  }, [colorHex]);


    const handleSubmit = () => {
        console.log(colorName , colorHex)
    }
  return (
    <Frame>
      <Page title="Color Input">
        <Layout>
          <Layout.Section>
            <Card>
              <Text as="h2" variant="headingMd">
                Enter Color Details
              </Text>
              <TextField
                label="Color Name"
                value={colorName}
                onChange={(newValue) => setColorName(newValue)}
                placeholder="Color name"
                autoComplete="off"
              />
              <Text as="p" variant="bodyMd">
                Pick a Color:
              </Text>
              <HexColorPicker color={colorHex} onChange={setColorHex} />
              <TextField
                label="Color Hex Value"
                value={colorHex}
                onChange={(newValue) => setColorHex(newValue)}
                autoComplete="off"
              />
              <div
                style={{
                  width: "100%",
                  height: "40px",
                  backgroundColor: validateHex(colorHex) ? colorHex : "transparent",
                  marginTop: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <Button onClick={handleSubmit} disabled={!validateHex(colorHex) || !colorName.trim()}>
                Save Color
              </Button>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
