import Link from "next/link";
import { categories } from "@/lib/data";
import { PiTShirtLight, PiShirtFoldedLight, PiCoffeeLight, PiGiftLight } from "react-icons/pi";

const config: Record<string, { Icon: any; price: string; sub: string }> = {
  koszulki: {
    Icon: PiTShirtLight,
    price: "Od 49 zł",
    sub: "Męskie, Damskie, Unisex",
  },
  bluzy: {
    Icon: PiShirtFoldedLight,
    price: "Od 99 zł",
    sub: "Z kapturem, Zip",
  },
  kubki: { 
    Icon: PiCoffeeLight, 
    price: "Od 29 zł", 
    sub: "Ceramika, Szklane" 
  },
  gadzety: {
    Icon: PiGiftLight,
    price: "Od 19 zł",
    sub: "Plakaty, Breloki",
  },
};

export default function CategoryCards() {
  return (
    <section className="relative -mt-10 z-30 px-4 pb-8 pointer-events-none">
      {/* Siatka 2 kolumny. Szerokie karty zajmują 2 kolumny (col-span-2) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {categories.map((cat, index) => {
          const c = config[cat.slug] ?? config.gadzety;
          // Pierwsza (Koszulki) i ostatnia (Gadżety) kategoria są szerokie
          const isWide = index === 0 || index === 3; 

          return (
            <Link
              key={cat.slug}
              href={`/kategoria/${cat.slug}`}
              className={`group pointer-events-auto bg-white rounded-2xl border border-stone-100 hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden
                ${isWide 
                  ? "md:col-span-2 p-8 lg:p-10 flex flex-row items-center justify-between" 
                  : "p-7 flex flex-col justify-between"
                }`}
            >
              {/* Poświata przy hoverze */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ddb745] rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

              {/* Zawartość - pozioma dla szerokich, pionowa dla małych */}
              <div className={`flex ${isWide ? "items-center gap-6" : "flex-col"} z-10`}>
                <div className={`rounded-xl bg-black text-white flex items-center justify-center shrink-0 group-hover:bg-[#27ae60] transition-colors duration-300
                  ${isWide ? "w-14 h-14" : "w-11 h-11 mb-4"}`}
                >
                  <c.Icon className={`${isWide ? "w-6 h-6" : "w-5 h-5"}`} />
                </div>

                <div>
                  <h3 className={`font-medium text-black tracking-tight ${isWide ? "text-2xl mb-1" : "text-lg mb-0.5"}`}>
                    {cat.name}
                  </h3>
                  <p className="text-xs text-stone-400 font-light">{c.sub}</p>
                </div>
              </div>

              {/* Prawy element - Cena i strzałka */}
              <div className={`flex items-center z-10 ${isWide ? "gap-4" : "justify-between pt-4 mt-4 border-t border-stone-100"}`}>
                <span className="text-xs font-medium text-[#ddb745]">
                  {c.price}
                </span>
                <span className="text-xs font-medium text-black flex items-center gap-1.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Przeglądaj
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}