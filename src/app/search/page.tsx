import { searchProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import SearchForm from "./SearchForm";

type SearchParamsValue = { q?: string };

interface SearchPageProps {
  searchParams?: Promise<SearchParamsValue>;
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = (await props.searchParams) ?? {};
  const query = searchParams.q ?? "";
  const results = await searchProducts(query);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[1440px] px-6 md:px-20 py-12 md:py-16">
        <p className="font-sans text-sm text-body-muted tracking-widest uppercase">Search</p>
        <h1 className="font-display text-3xl md:text-5xl font-light text-dark-100 mt-3 leading-tight">
          Find Products
        </h1>
        <p className="font-sans text-sm text-body-muted mt-2 tracking-wider">
          Search by name, category, or ingredient.
        </p>
        <div className="mt-8">
          <SearchForm initialQuery={query} />
        </div>
        <div className="mt-10">
          {query ? (
            results.length > 0 ? (
              <>
                <p className="font-sans text-sm text-body-muted mb-6 tracking-wider">
                  {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {results.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <p className="font-sans text-body-muted tracking-wider">No products match &quot;{query}&quot;.</p>
                <p className="font-sans text-sm text-body-muted mt-2 tracking-wider">Try a different search or browse all products.</p>
                <a href="/products" className="font-sans text-secondary-100 hover:underline mt-4 inline-block tracking-wider">
                  View all products
                </a>
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <p className="font-sans text-body-muted tracking-wider">Enter a search term above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
