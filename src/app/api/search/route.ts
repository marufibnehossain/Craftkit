import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const products = await searchProducts(q);
  return NextResponse.json(products);
}
