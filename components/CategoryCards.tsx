import Link from "next/link";
import type { IconType } from "react-icons";
import {
  PiCoffeeLight,
  PiGiftLight,
  PiShirtFoldedLight,
  PiTShirtLight,
} from "react-icons/pi";

const categories: Array<{
  slug: string;
  name: string;
  sub: string;
  price: string;
  Icon: IconType;
}> = [
  {
    slug: "koszulki",
    name: "Koszulki",
    sub: "Męskie, Damskie, Unisex",
    price: "Sprawdź ceny",
    Icon: PiTShirtLight,
  },
  {
    slug: "bluza",
    name: "Bluzy",
    sub: "Z kapturem, Zip",
    price: "Sprawdź ceny",
    Icon: PiShirtFoldedLight,
  },
  {
    slug: "kubki",
    name: "Kubki",
    sub: "Ceramika, Szklane",
    price: "Sprawdź ceny",
    Icon: PiCoffeeLight,
  },
  {
    slug: "gadzety",
    name: "Gadżety",
    sub: "Czapki i dodatki",
    price: "Sprawdź ceny",
    Icon: PiGiftLight,
  },
];

export default function CategoryCards() {
  return (
    <section className="relative z-30 -mt-16 px-6 pb-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/kategoria/${category.slug}`}
              className="group relative flex min-h-[220px] flex-col justify-between rounded-3xl border border-stone-100 bg-white p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-stone-200/50 lg:p-8"
            >
              <span className="mb-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-100 bg-stone-50 text-stone-600 transition-all duration-300 group-hover:border-black group-hover:bg-black group-hover:text-white">
                <category.Icon className="h-6 w-6" />
              </span>

              <span className="mt-8">
                <span className="mb-1 block text-lg font-medium tracking-tight text-black">
                  {category.name}
                </span>
                <span className="mb-4 block text-xs font-light text-stone-400">
                  {category.sub}
                </span>

                <span className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#ddb745]">
                    {category.price}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-50 transition-all duration-300 group-hover:bg-[#27ae60]">
                    <svg
                      className="h-4 w-4 -translate-x-0.5 text-stone-400 transition-all duration-300 group-hover:translate-x-0 group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
