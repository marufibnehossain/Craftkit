import { NextResponse } from "next/server";
import { getCategories } from "@/lib/products";

export async function GET() {
  const categories = await getCategories();
  const filtered = categories.filter((c) => c.slug !== "uncategorized");
  return NextResponse.json(filtered);
}
