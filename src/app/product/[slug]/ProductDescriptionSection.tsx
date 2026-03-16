"use client";

import type { Product } from "@/lib/data";

interface ProductDescriptionSectionProps {
  product: Product;
}

export default function ProductDescriptionSection({ product }: ProductDescriptionSectionProps) {
  const description = product.longDesc ?? product.shortDesc;

  const specs: { label: string; value: string }[] = [];

  if (product.ingredients) {
    specs.push({ label: "Fiber Content", value: product.ingredients });
  }
  if (product.attributes && product.attributes.length > 0) {
    product.attributes.forEach((attr) => {
      specs.push({ label: attr.name, value: attr.values.join(", ") });
    });
  }
  if (product.howToUse) {
    specs.push({ label: "Care Instructions", value: product.howToUse });
  }
  if (product.productCode) {
    specs.push({ label: "SKU", value: product.productCode });
  }
  if (product.category) {
    specs.push({ label: "Category", value: product.category.replace(/-/g, " ") });
  }

  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-[1440px] px-6 md:px-20 pb-12 md:pb-[100px] flex flex-col gap-11">
        <div className="flex flex-col gap-8">
          <div className="border-b border-[#e0d6c9] pb-px">
            <div className="border-b-2 border-[#862830] inline-block pb-4">
              <span className="font-sans text-base font-semibold text-[#1b1718] leading-[1.6]">
                Description
              </span>
            </div>
          </div>

          <div
            className="product-description font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px]"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>

        {specs.length > 0 && (
          <div className="flex flex-col gap-6">
            <h3 className="font-sans text-base font-semibold text-[#5f5d5d] leading-[1.6]">
              Specifications
            </h3>
            <div className="flex flex-col gap-4 max-w-[715px]">
              {specs.map((spec, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between border-b border-[#e0d6c9] pb-4"
                >
                  <span className="font-sans text-base text-[#5f5d5d] tracking-[0.32px] leading-[1.6]">
                    {spec.label}
                  </span>
                  <span className="font-sans text-base font-semibold text-[#1b1718] leading-[1.6] text-right">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
