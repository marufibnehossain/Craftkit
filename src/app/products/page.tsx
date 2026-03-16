import ProductsPageContent from "./ProductsPageContent";

export const dynamic = "force-dynamic";

type SearchParamsValue = { category?: string; sort?: string; minPrice?: string; maxPrice?: string; page?: string };

interface ProductsPageProps {
  searchParams?: Promise<SearchParamsValue>;
}

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = (await props.searchParams) ?? {};
  const categorySlug = searchParams.category ?? null;
  return (
    <ProductsPageContent
      categorySlug={categorySlug}
      searchParams={searchParams}
    />
  );
}
