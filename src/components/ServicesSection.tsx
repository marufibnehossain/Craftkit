const services = [
  {
    title: "Knitwear Collection",
    description: "Custom-made items designed to fit your unique style and requirements.",
    icon: "/images/services/knitwear.svg",
  },
  {
    title: "Crafted Home Accents",
    description: "Distinctive fabric details that add warmth, coziness, and charm.",
    icon: "/images/services/home-accents.svg",
  },
  {
    title: "Artisan Accessories",
    description: "Artfully designed pieces that exude a classic, artisanal appeal.",
    icon: "/images/services/artisan.svg",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: "#fbf4eb" }} aria-labelledby="services-heading">
      <div className="mx-auto max-w-[1440px] px-6 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((item) => (
            <div key={item.title} className="flex items-center gap-4">
              <div className="w-[84px] h-[84px] shrink-0 flex items-center justify-center" style={{ backgroundColor: "#F5EDE2" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.icon}
                  alt=""
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col gap-2 max-w-[305px]">
                <h3 className="font-display text-[32px] font-semibold leading-none text-dark-100">
                  {item.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed tracking-wider" style={{ color: "#5f5d5d" }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
