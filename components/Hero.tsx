import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pb-32 pt-20 md:pb-40 md:pt-32">
      <div className="absolute right-0 top-20 h-[600px] w-[600px] rounded-full bg-[#ddb745] opacity-[0.07] blur-[200px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-8 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/50 bg-stone-50 px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#27ae60]" />
              <span className="text-xs font-medium tracking-wide text-stone-500">
                Wysyłka w 24h po akceptacji
              </span>
            </div>

            <h1 className="text-5xl font-semibold leading-[0.9] tracking-tighter text-black sm:text-6xl md:text-7xl lg:text-8xl">
              Koszulki
              <br />
              <span className="bg-gradient-to-r from-[#ddb745] to-[#d4a832] bg-clip-text text-transparent">
                z jajem.
              </span>
            </h1>

            <p className="-mt-2 max-w-md text-lg font-light leading-relaxed text-stone-500 md:text-xl">
              Tworzymy koszulki z charakterem. Drukujemy Twoje projekty w
              Zamościu i wysyłamy w całą Polsce.
            </p>

            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <Link
                href="/produkty"
                className="group inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-[#27ae60]"
              >
                Przeglądaj koszulki
                <svg
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
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
              </Link>
              <Link
                href="/wlasny-nadruk"
                className="inline-flex justify-center rounded-full border border-stone-300 px-8 py-4 text-sm font-medium tracking-wide text-black transition-all duration-300 hover:border-black"
              >
                Własny projekt
              </Link>
            </div>
          </div>

          <div className="relative h-[400px] md:h-[650px] lg:col-span-6">
            <div className="absolute right-0 top-0 h-[85%] w-[90%] overflow-hidden rounded-3xl border border-stone-200/50 shadow-2xl shadow-stone-300/50">
              <Image
                src="/koszulka1.jpg"
                alt="Koszulka z nadrukiem"
                fill
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(min-width: 1024px) 45vw, 90vw"
              />
              <div className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-black backdrop-blur-sm">
                Bestseller
              </div>
            </div>

            <div className="absolute bottom-0 left-0 -z-10 h-[40%] w-[60%] rounded-2xl bg-[#f9f8f6]" />
            <div className="absolute bottom-8 left-8 z-20 rounded-2xl border border-stone-100 bg-white p-4 shadow-lg shadow-stone-200/50">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                Ceny od
              </p>
              <p className="text-2xl font-bold tracking-tight text-black">49 zł</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
