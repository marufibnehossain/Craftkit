const items = [
  "PREMIUM SUPPLIES",
  "EASY CRAFTING",
  "FAST SHIPPING",
  "CUSTOM CREATIONS",
  "BEGINNER FRIENDLY WORKS",
  "CREATIVE KITS",
  "MAKER COMMUNITY",
  "HANDMADE QUALITY",
  "SECURE CHECKOUT",
  "TRUSTED BRAND",
  "FUN PROJECTS",
  "UNIQUE MATERIALS",
  "CUSTOMER FAVORITES",
  "DIY ESSENTIALS",
  "TRENDING TOOLS",
  "INSPIRATION HUB",
];

export default function MarqueeBar() {
  const content = items.map((item, i) => (
    <span key={i} className="flex items-center gap-3 shrink-0">
      <span className="font-sans text-sm font-light text-white tracking-wider whitespace-nowrap">{item}</span>
      <span className="w-1 h-1 rounded-full bg-white shrink-0" aria-hidden />
    </span>
  ));

  return (
    <div className="bg-dark-100 py-6 overflow-hidden">
      <div className="flex gap-3 animate-marquee" style={{ width: "max-content" }}>
        {content}
        {content}
      </div>
    </div>
  );
}
