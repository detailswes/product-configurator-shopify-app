export interface ProductImage {
    node: {
      url: string;
      altText: string | null;
    };
  }
  
  export interface PriceRange {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  }
  
  export interface Product {
    node: {
      id: string;
      title: string;
      handle: string;
      status: "ACTIVE" | "ARCHIVED" | "DRAFT";
      totalInventory: number;
      vendor: string;
      tags: string[];
      metafield?:any;
      images: {
        edges: ProductImage[];
      };
      priceRangeV2: PriceRange;
    };
  }
  