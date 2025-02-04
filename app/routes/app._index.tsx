import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
} from "@shopify/polaris";
export default function Index() {
  console.log("testing")  
  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Admin configuration 
                  </Text>
                </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
