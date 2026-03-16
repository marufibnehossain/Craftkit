export type AttributeDisplayType = "button" | "swatch" | "image";

export interface ProductAttribute {
  id: string;
  name: string;
  values: string[];
  /** How to render: button (default), swatch (color dots), image (small round images) */
  displayType?: AttributeDisplayType;
  /** For swatch: { "Red": "#ff0000" }. For image: { "Red": "/url" } */
  displayData?: Record<string, string>;
}

export interface ProductVariation {
  id: string;
  attributes: Record<string, string>;
  price: number | null;
  stock: number;
  sku: string | null;
  images: string[] | null;
}

export interface Product {
  id: string;
  slug: string;
  productCode?: string;
  name: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  tags: string[];
  shortDesc: string;
  longDesc?: string;
  ingredients?: string;
  howToUse?: string;
  /** Quantity available; 0 = out of stock (when trackInventory is true) */
  stock: number;
  /** If false, product has unlimited stock and stock count is ignored */
  trackInventory?: boolean;
  /** Badge: NEW | BESTSELLER */
  badge?: string | null;
  /** Whether this is a downloadable/digital product */
  isDownloadable?: boolean;
  /** Files available for download: [{name, url, size}] */
  downloadFiles?: { name: string; url: string; size: number }[];
  /** Product attributes (e.g., Size, Color) */
  attributes?: ProductAttribute[];
  /** Product variations (combinations of attributes) */
  variations?: ProductVariation[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  parentId?: string | null;
}

// Categories and products are now stored in the database
// Import Prisma functions for async access
import { getProducts as getProductsFromDb, getProductBySlug as getProductBySlugFromDb, getFeaturedProducts as getFeaturedProductsFromDb, getRelatedProducts as getRelatedProductsFromDb, searchProducts as searchProductsFromDb, getCategories as getCategoriesFromDb } from "@/lib/products";

// Fallback when DB has no categories (used in some components)
export const categories: Category[] = [
  { id: "cat-1", name: "Uncategorized", slug: "uncategorized" },
  { id: "cat-2", name: "Featured", slug: "featured" },
];

// Legacy products array - kept for type compatibility, but actual data comes from DB
export const products: Product[] = [
  {
    id: "1",
    slug: "calming-serum",
    productCode: "G-123-4",
    name: "Calming Restore Serum",
    price: 29,
    compareAt: 58,
    rating: 4.8,
    reviewCount: 124,
    images: ["/images/placeholder.svg"],
    category: "skincare",
    tags: ["serum", "calming"],
    shortDesc: "A lightweight serum to soothe and restore balance.",
    ingredients: "Aloe vera, chamomile extract, niacinamide, hyaluronic acid, vitamin E.",
    howToUse: "Apply 2–3 drops to cleansed skin morning and evening. Follow with moisturizer.",
    stock: 12,
  },
  {
    id: "2",
    slug: "night-cream",
    productCode: "G-124-1",
    name: "Night Renewal Cream",
    price: 29,
    rating: 4.9,
    reviewCount: 89,
    images: ["/images/placeholder.svg"],
    category: "skincare",
    tags: ["moisturizer", "night"],
    shortDesc: "Rich overnight cream for deep nourishment.",
    ingredients: "Shea butter, jojoba oil, calendula, lavender essential oil.",
    howToUse: "Apply a small amount to face and neck before bed. Allow to absorb.",
    stock: 8,
  },
  {
    id: "3",
    slug: "face-oil",
    productCode: "G-125-2",
    name: "Botanical Face Oil",
    price: 49,
    rating: 4.7,
    reviewCount: 203,
    images: ["/images/placeholder.svg"],
    category: "skincare",
    tags: ["oil", "botanical"],
    shortDesc: "Plant-based face oil for a natural glow.",
    stock: 0,
  },
  {
    id: "4",
    slug: "cleanser",
    productCode: "G-126-3",
    name: "Gentle Cleansing Balm",
    price: 29,
    rating: 4.6,
    reviewCount: 156,
    images: ["/images/placeholder.svg"],
    category: "skincare",
    tags: ["cleanser"],
    shortDesc: "Soft balm that melts away impurities.",
    stock: 3,
  },
  {
    id: "5",
    slug: "toner",
    productCode: "G-127-5",
    name: "Rose Hydrating Toner",
    price: 29,
    rating: 4.5,
    reviewCount: 78,
    images: ["/images/placeholder.svg"],
    category: "skincare",
    tags: ["toner", "hydrating"],
    shortDesc: "Refreshing rose water toner.",
    stock: 15,
  },
  {
    id: "6",
    slug: "mask",
    productCode: "G-128-6",
    name: "Clay Purifying Mask",
    price: 49,
    rating: 4.7,
    reviewCount: 92,
    images: ["/images/placeholder.svg"],
    category: "skincare",
    tags: ["mask", "purifying"],
    shortDesc: "Deep-cleansing clay mask.",
    stock: 6,
  },
];

// Async functions that read from database
export async function getProducts(): Promise<Product[]> {
  return getProductsFromDb();
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getFeaturedProductsFromDb(3);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const product = await getProductBySlugFromDb(slug);
  return product ?? undefined;
}

export function getStockLabel(stock: number): "In stock" | "Low stock" | "Out of stock" {
  if (stock <= 0) return "Out of stock";
  if (stock <= 5) return "Low stock";
  return "In stock";
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return getRelatedProductsFromDb(product, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  return searchProductsFromDb(query);
}

// Fallback filter tags when DB has no categories (used on products page)
export const filterTags = [
  { id: "uncategorized", name: "Uncategorized", slug: "uncategorized" },
  { id: "featured", name: "Featured", slug: "featured" },
];

// Optional "as seen in" logos — customize per project or leave empty
export const asSeenInLogos: { name: string; src: string }[] = [];
