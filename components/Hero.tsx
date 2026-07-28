import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pt-20 pb-32 md:pt-32 md:pb-40 bg-white overflow-hidden">
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#ddb745] rounded-full blur-[200px] opacity-[0.07]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-stone-50 border border-stone-200/50 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60] animate-pulse" />
              <span className="text-xs font-medium text-stone-500 tracking-wide">
                Wysyłka w 24h po akceptacji
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-black leading-[0.9]">
              Koszulki
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ddb745] to-[#d4a832]">
                z jajem.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-stone-500 max-w-md font-light leading-relaxed -mt-2">
              Tworzymy nadruki, które przyciągają wzrok. Zaprojektuj z nami coś
              unikalnego lub wybierz z gotowej bazy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/sklep"
                className="group inline-flex items-center justify-center px-8 py-4 bg-black text-white font-medium text-sm tracking-wide rounded-full hover:bg-[#27ae60] transition-all duration-300"
              >
                Przeglądaj koszulki
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
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
              </Link>
              <Link
                href="/wlasny-nadruk"
                className="inline-flex justify-center px-8 py-4 border border-stone-300 text-black font-medium text-sm tracking-wide rounded-full hover:border-black transition-all duration-300"
              >
                Własny projekt
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative h-[400px] md:h-[650px]">
            <div className="absolute top-0 right-0 w-[90%] h-[85%] rounded-3xl overflow-hidden shadow-2xl shadow-stone-300/50 border border-stone-200/50">
              <Image
                src="/koszulka1.jpg"
                alt="Koszulka z nadrukiem"
                fill
                priority
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full">
                Bestseller
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-[60%] h-[40%] bg-[#f9f8f6] rounded-2xl -z-10" />
            <div className="absolute bottom-8 left-8 bg-white p-4 rounded-2xl shadow-lg shadow-stone-200/50 border border-stone-100 z-20">
              <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">
                Ceny od
              </p>
              <p className="text-2xl font-bold text-black tracking-tight">
                49 zł
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
