import FAQPageFaq from "@/components/FAQPageFaq";
import FAQHelpSection from "@/components/FAQHelpSection";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about our products, orders, shipping, and more.",
};

export default function FAQPage() {
  return (
    <div className="bg-[#f5ede2] min-h-screen">
      <section className="bg-[#f5ede2]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-20 py-16 md:py-[100px]">
          <FAQPageFaq />
        </div>
      </section>
      <FAQHelpSection />
    </div>
  );
}
