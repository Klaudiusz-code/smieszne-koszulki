export interface MediaItem {
  sourceUrl: string;
  altText: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: MediaItem;
  count: number;
}

export interface ProductAttribute {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: MediaItem;
  galleryImages: MediaItem[]; 
  category: ProductCategory; 
  price: string;
  regularPrice: string;
  salePrice: string | null;
  onSale: boolean;
  inStock: boolean;
  attributes: ProductAttribute[];
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: string;
  image: string;
  quantity: number;
  selectedAttrs: Record<string, string>;
}