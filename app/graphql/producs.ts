export const FETCH_PRODUCTS = `
query GetProducts {
  products(first: 250, sortKey: CREATED_AT, reverse: true) {
    edges {
      node {
        id
        title
        handle
        vendor
        status
        totalInventory
        tags
        images(first: 1) {
          edges {
            node {
              url
            }
          }
        }
        priceRangeV2 {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        metafield(key: "configured", namespace: "custom") {
          id
          value
          type
        }
      }
    }
  }
}
`;

export const UPDATE_PRODUCT_METAFIELD = `
  mutation productUpdateMetafield($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        metafield(key: "configured", namespace: "custom") {
          id
          value
          type
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
