export type ProductType = 'tshirt' | 'hoodie' | 'tote' | 'poster' | 'phone_case';

export interface Design {
  id: string;
  designerId: string;
  designerName: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: 'PNG' | 'SVG' | 'PDF' | 'JPG' | 'WEBP';
  tags: string[];
  createdAt: string;
}

export interface Product {
  id: string;
  designId: string;
  designerId: string;
  designerName: string;
  slug: string;
  title: string;
  description?: string;
  productType: ProductType;
  image: string;
  baseCostINR: number;
  designerPriceINR: number;
  active: boolean;
  featured: boolean;
  totalSold: number;
  createdAt: string;
}

export interface Variant {
  id: string;
  productId: string;
  size: string;
  color: string;
  sku: string;
  stock: number; // -1 = POD unlimited
  priceINR: number;
}

export interface Capability {
  id: string;
  manufacturerId: string;
  printType: string;
  materials: string[];
  productTypes: string[];
  minOrderQty: number;
  turnaroundDays: number;
  baseCostINR: number;
  active: boolean;
}
