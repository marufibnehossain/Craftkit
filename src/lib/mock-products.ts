/**
 * Mock products and categories for when DATABASE_URL is not set.
 * Used for exploring the template without a database.
 * Add DATABASE_URL to .env and run migrations + seed to use real data.
 */

import type { Product, Category } from "@/lib/data";

export const MOCK_CATEGORIES: Category[] = [
  { id: "mock-uncategorized", name: "Uncategorized", slug: "uncategorized", image: null, parentId: null },
  { id: "mock-featured", name: "Featured", slug: "featured", image: null, parentId: null },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "mock-1",
    slug: "sample-product-one",
    productCode: "SMP-001",
    name: "Sample Product One",
    price: 29.99,
    compareAt: 39.99,
    rating: 4.5,
    reviewCount: 12,
    images: ["/images/placeholder.svg"],
    category: "featured",
    tags: ["sample", "featured"],
    shortDesc: "A sample product for template preview. Add your database connection to use real products.",
    longDesc: "This is placeholder content. When you add DATABASE_URL to .env and run migrations + seed, your real products will appear here.",
    stock: 10,
    trackInventory: true,
    badge: "NEW",
  },
  {
    id: "mock-2",
    slug: "sample-product-two",
    productCode: "SMP-002",
    name: "Sample Product Two",
    price: 49.99,
    rating: 4.8,
    reviewCount: 24,
    images: ["/images/placeholder.svg"],
    category: "featured",
    tags: ["sample"],
    shortDesc: "Another sample product. Connect your database to manage products from the admin panel.",
    stock: 5,
    trackInventory: true,
    badge: "BESTSELLER",
  },
  {
    id: "mock-3",
    slug: "sample-product-three",
    productCode: "SMP-003",
    name: "Sample Product Three",
    price: 19.99,
    rating: 4.2,
    reviewCount: 8,
    images: ["/images/placeholder.svg"],
    category: "uncategorized",
    tags: ["sample"],
    shortDesc: "A third sample product for the template. Run 'npx prisma db seed' after connecting your database.",
    stock: 15,
    trackInventory: true,
  },
];
