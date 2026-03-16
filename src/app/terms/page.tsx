import { siteConfig } from "@/lib/site-config";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <section className="bg-bg">
        <div className="mx-auto max-w-[960px] px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="font-sans text-3xl md:text-4xl font-bold text-[#111827] mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="font-sans text-sm md:text-base text-[#4B5563] leading-relaxed max-w-3xl mb-8">
            Please read these Terms and Conditions before placing an order. If you are under 18 years old, you must have clear authorisation from a parent or guardian to place an order and proceed to payment.
          </p>

          <div className="space-y-8 font-sans text-sm md:text-base text-[#374151] leading-relaxed max-w-3xl">
            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">1. Object</h2>
              <p>
                These general conditions define the rights and obligations of {siteConfig.name} and users in the context of online sales of products offered on our website. The sale can be concluded in the language chosen by the buyer.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">2. Products and prices</h2>
              <p className="mb-3">
                The products offered for sale are those featured on the website on the day of your visit. If a product is not available, you will be informed at the latest when the order is delivered.
              </p>
              <p className="mb-3">
                All prices are indicated in Euros and include VAT where applicable. We reserve the right to modify prices at any time; products will be billed at the price valid when the order was confirmed, subject to availability.
              </p>
              <p>
                Promotions and vouchers are valid for one order and one household for a determined period.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">3. Order placement and validation</h2>
              <p className="mb-3">
                To place an order, add products to your cart and proceed to checkout. You must fill in the form accurately with your name, address, and contact details. An order summary will appear before payment.
              </p>
              <p className="mb-3">
                Once you validate your payment method, the order is definitely confirmed and the sale is closed. You will receive an email confirmation. Order validation constitutes an electronic signature with the same value as a handwritten signature.
              </p>
              <p>
                We may refuse an order in case of pricing error, unpaid prior order, or if we judge that packages are lost or returned too frequently by the buyer.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">4. Delivery</h2>
              <p className="mb-3">
                Delivery times are usually 3 working days from the day after the package is processed. If the order cannot be processed within 30 working days from confirmation, you have the right to cancel the purchase.
              </p>
              <p>
                Products will be delivered to the address indicated on the order. Products remain the property of {siteConfig.name} until full payment, including shipping fees, has been received.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">5. Right of withdrawal</h2>
              <p className="mb-3">
                You have the right to withdraw from your order within 14 calendar days of receiving the products, without giving any reason. To exercise this right, notify us by email at {siteConfig.contactEmail} or by registered letter.
              </p>
              <p>
                In case of withdrawal, you will be reimbursed in full except for shipping fees. You must pay the direct costs of sending the articles back. Reimbursement will be made within 14 days using the same payment method.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">6. Payment</h2>
              <p className="mb-3">
                We accept payment by card (Visa, Mastercard), PayPal, and other methods indicated at checkout. We do not accept postal stamps, bank transfers enclosed to the order, or pay cheques.
              </p>
              <p>
                We reserve the right to refuse an order in case of ongoing dispute, failure to pay a previous order, denied payment authorisation, or use of a card not delivered by a recognised financial institution.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">7. Warranties</h2>
              <p className="mb-3">
                You benefit from legal warranties for any lack of conformity existing at delivery. If a default appears within 6 months of delivery, the responsibility rests on us to prove it did not exist at delivery. After 2 years, you cannot require repair or replacement unless stated otherwise.
              </p>
              <p>
                For tables and robots, a 2-year commercial guarantee applies. The guarantee does not cover normal wear and tear, professional use, misuse, or repairs by third parties.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">8. Personal data</h2>
              <p>
                The processing of personal data serves customer management, fraud prevention, litigation management, and marketing (with your consent). You can access, rectify, or delete your data at any time. See our Privacy Policy for details.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">9. Force majeure</h2>
              <p>
                We shall not be liable for partial or total non-performance due to force majeure (IT viruses, strikes, floods, fire, etc.). If interruption exceeds one month, we are entitled not to fill the order and will refund you.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-xl font-semibold text-[#111827] mb-3">10. Applicable law</h2>
              <p>
                These Terms and Conditions and the contractual relationship between {siteConfig.name} and the buyer are subject to applicable law. Any dispute shall be settled in accordance with the jurisdiction of the competent courts.
              </p>
            </section>

            <p className="text-xs text-[#6B7280] pt-4">
              Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
