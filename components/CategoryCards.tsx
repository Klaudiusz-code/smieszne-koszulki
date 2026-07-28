import Link from "next/link";
import { categories } from "@/lib/data";
import {
  PiTShirtLight,
  PiShirtFoldedLight,
  PiCoffeeLight,
  PiGiftLight,
} from "react-icons/pi";

const config: Record<string, { Icon: any; price: string; sub: string }> = {
  koszulki: { Icon: PiTShirtLight, price: "Od 49 zł", sub: "Męskie, Damskie" },
  bluzy: {
    Icon: PiShirtFoldedLight,
    price: "Od 99 zł",
    sub: "Z kapturem, Zip",
  },
  kubki: { Icon: PiCoffeeLight, price: "Od 29 zł", sub: "Ceramika 330ml" },
  gadzety: { Icon: PiGiftLight, price: "Od 19 zł", sub: "Plakaty, Breloki" },
};

export default function CategoryCards() {
  return (
    <section className="relative z-30 px-6 pb-32 -mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat) => {
            const c = config[cat.slug] ?? config.gadzety;

            return (
              <Link
                key={cat.slug}
                href={`/kategoria/${cat.slug}`}
                className="group relative bg-white rounded-3xl border border-stone-100 p-6 lg:p-8 flex flex-col justify-between min-h-[220px] hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-2 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300 mb-auto">
                  <c.Icon className="w-6 h-6" />
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium text-black tracking-tight mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-stone-400 font-light mb-4">
                    {c.sub}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#ddb745]">
                      {c.price}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-stone-50 group-hover:bg-[#27ae60] flex items-center justify-center transition-all duration-300">
                      <svg
                        className="w-4 h-4 text-stone-400 group-hover:text-white -translate-x-0.5 group-hover:translate-x-0 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
