"use client";

import Accordion from "@/components/Accordion";

const FAQ_ITEMS = [
  {
    q: "What types of yarn do you carry?",
    a: "We stock a wide range of yarns including wool, cotton, acrylic, silk blends, and specialty fibers. Whether you're knitting, crocheting, or weaving, we have the perfect yarn for your project.",
  },
  {
    q: "How do I choose the right yarn weight?",
    a: "Yarn weight depends on your project. Lace and fingering weights are great for delicate items, worsted is versatile for most projects, and bulky weights work up quickly for cozy accessories.",
  },
  {
    q: "How long does shipping take?",
    a: "Most orders leave our warehouse within 1-2 business days. Delivery times depend on your location and chosen shipping method.",
  },
  {
    q: "Do you offer returns or exchanges?",
    a: "Unused items in original packaging can usually be returned or exchanged within 30 days. Check our Returns & Exchanges page for full details.",
  },
  {
    q: "Do you have crafting tutorials or guides?",
    a: "Yes! We offer step-by-step PDF guides and blog posts with tutorials for beginners and advanced crafters alike. Check our blog for the latest patterns and techniques.",
  },
];

export default function HomeFAQSection() {
  const accordionItems = FAQ_ITEMS.map(({ q, a }) => ({
    title: q,
    content: a,
  }));

  return (
    <section
      className="py-16 md:py-24 bg-surface"
      aria-labelledby="home-faq-heading"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <p className="font-sans text-sm text-body-muted tracking-widest uppercase">FAQ</p>
            <h2
              id="home-faq-heading"
              className="font-display text-3xl md:text-5xl lg:text-[64px] font-light text-dark-100 mt-3 leading-tight"
            >
              Frequently Asked Questions
            </h2>
          </div>
          <Accordion
            items={accordionItems}
            defaultOpenIndex={0}
          />
        </div>
      </div>
    </section>
  );
}
