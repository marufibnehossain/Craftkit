"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const STATS = [
  {
    label: "Happy Customers",
    value: 10000,
    suffix: "+",
    icon: "/images/happy-customers.svg",
  },
  {
    label: "Countries Served",
    value: 30,
    suffix: "+",
    icon: "/images/countries-served.svg",
  },
  {
    label: "Products",
    value: 500,
    suffix: "+",
    icon: "/images/products.svg",
  },
  {
    label: "Satisfaction Score",
    value: 99,
    suffix: "%",
    icon: "/images/satisfaction-rate.svg",
  },
];

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return { ref, value };
}

export default function AboutStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
      {STATS.map((stat) => {
        const { ref, value } = useCountUp(stat.value);
        return (
          <div key={stat.label} ref={ref} className="flex flex-col items-center gap-2">
            <div className="relative w-10 h-10 mb-1">
              <Image src={stat.icon} alt="" fill className="object-contain" />
            </div>
            <p className="font-sans text-xl md:text-2xl font-semibold text-[#111827]">
              {value.toLocaleString("en-US")}
              {stat.suffix}
            </p>
            <p className="mt-1 font-sans text-xs md:text-sm text-[#6B7280]">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}

