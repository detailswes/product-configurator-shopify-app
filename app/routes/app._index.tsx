import {
  Page,
  Layout,
  Card,
  Loading,
  Frame,
  Text,
  BlockStack
} from "@shopify/polaris";
import { useNavigation } from "@remix-run/react";

export default function Index() {
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
      <Page>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="200">
                <Text as="h4" variant="headingMd">
                  Admin configuration
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
