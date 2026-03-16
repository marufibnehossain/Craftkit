import { siteConfig } from "@/lib/site-config";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-bg">
      <section className="bg-bg">
        <div className="mx-auto max-w-[960px] px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="font-sans text-3xl md:text-4xl font-bold text-[#111827] mb-4">
            Refund &amp; Returns Policy
          </h1>
          <p className="font-sans text-sm md:text-base text-[#4B5563] leading-relaxed max-w-3xl mb-8">
            We want you to be completely satisfied with your purchase from {siteConfig.name}. This policy explains when and how you can return items, request a refund, or exchange products.
          </p>

          <div className="space-y-8 font-sans text-sm md:text-base text-[#374151] leading-relaxed max-w-3xl">
            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Return and refund</h2>
              <p>
                You have <strong>14 days</strong> from the receipt of your order to request a refund or exchange, under certain conditions.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Return procedure</h2>
              <p>
                Before returning your package to us, you must <strong>contact our customer service at {siteConfig.contactEmail}</strong>. Our team will inform you of the return procedure.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Return costs</h2>
              <p>
                The cost of sending the items back to us is your responsibility. We may offer return labels in certain cases; please contact us for details.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Refund</h2>
              <p className="mb-3">
                Shipping costs will be refunded to you only in the following cases:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Delivery error from us</li>
                <li>Manufacturing problem</li>
                <li>Product damaged during delivery</li>
              </ul>
              <p className="mb-3">
                Please note that the initial shipping costs of your order are not refundable in standard cases.
              </p>
              <p className="mb-3">
                <strong>Full refund:</strong> In case of a full refund, the shipping costs we paid to send your package will not be refunded and will be deducted from the amount refunded.
              </p>
              <p>
                <strong>Partial refund:</strong> In case of a partial refund, the amount will be adjusted in proportion to the returned items, discounts applied to the original order, and free shipping costs.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Refund times</h2>
              <p>
                The refund is made within <strong>3 to 10 working days</strong> to the initial payment method used. Times may vary depending on your bank or payment provider.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Return conditions</h2>
              <p className="mb-3">
                Some items cannot be exchanged or returned:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Tables and robots</li>
                <li>Items out of their original packaging (unpacked rubbers, wood without the original box, shoes without original boxes, textiles without original labels and stickers)</li>
                <li>Items damaged by the customer</li>
                <li>Personalised items (e.g. printed polo shirts)</li>
                <li>Mounted rackets, glued and/or cut coverings, varnished wood, wood with traces of use</li>
                <li>Clearance items (textiles and others) — exchanges may be possible with a contribution to shipping costs</li>
              </ul>
              <p>
                Upon receipt, we will process your return and reship within 1 to 7 working days.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Return address</h2>
              <p>
                Send your package to:
              </p>
              <p className="mt-2 font-medium">
                {siteConfig.name}<br />
                Return service<br />
                {siteConfig.contactAddress}
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">Important details</h2>
              <p className="mb-3">
                Some clothing articles may be delivered with a safety seal. Leave it on while fitting. Any article sent back without the safety seal cannot be reimbursed or exchanged.
              </p>
              <p>
                In case of abnormal or abusive returns, we reserve the right to refuse any later order.
              </p>
            </section>

            <p className="text-sm font-medium text-[#111827] pt-4">
              Do not hesitate to contact us at {siteConfig.contactEmail}{siteConfig.contactPhone ? ` or ${siteConfig.contactPhone}` : ""} if you have any questions or need advice.
            </p>

            <p className="text-xs text-[#6B7280] pt-4">
              Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
