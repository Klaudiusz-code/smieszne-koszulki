import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pt-24 pb-28 md:pt-36 md:pb-36 bg-white overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ddb745] rounded-full blur-[150px] opacity-10" />
      <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-[#27ae60] rounded-full blur-[150px] opacity-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-8">
            <div
              className="flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-stone-400 hero-fade"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-8 h-px bg-[#ddb745]" />
              Dostawa w 24h
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-black leading-[1.05] hero-fade"
              style={{ animationDelay: "0.2s" }}
            >
              Twój styl, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-[#ddb745] to-black">
                Twój uśmiech.
              </span>
            </h1>

            <p
              className="text-lg text-stone-500 max-w-md font-light leading-relaxed hero-fade"
              style={{ animationDelay: "0.4s" }}
            >
              Tworzymy koszulki z charakterem. Drukujemy Twoje projekty w
              Zamościu i wysyłamy w całą Polsce.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 pt-2 hero-fade"
              style={{ animationDelay: "0.5s" }}
            >
              <Link
                href="/sklep"
                className="inline-flex justify-center px-8 py-4 bg-[#27ae60] text-white font-medium text-sm tracking-wide rounded-full hover:bg-[#219150] transition-colors duration-300 shadow-sm shadow-[#27ae60]/20"
              >
                Przeglądaj sklep
              </Link>
              <Link
                href="/#kontakt"
                className="inline-flex justify-center px-8 py-4 border border-black text-black font-medium text-sm tracking-wide rounded-full hover:bg-black hover:text-white transition-all duration-300"
              >
                Własny projekt
              </Link>
            </div>

            <div
              className="pt-4 flex items-center gap-6 text-sm font-light text-stone-400 hero-fade"
              style={{ animationDelay: "0.6s" }}
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60]" />{" "}
                Wysyłka 24h
              </span>
              <span className="w-px h-3 bg-stone-200" />
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ddb745]" />{" "}
                Trwały nadruk
              </span>
            </div>
          </div>

          <div
            className="relative h-[400px] md:h-[550px] lg:h-[600px] hero-fade"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="absolute inset-4 bg-stone-100 rounded-3xl -z-10" />

            <div className="relative h-full w-full bg-white rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100">
              <Image
                src="/koszulka1.jpg"
                alt="Koszulka z nadrukiem"
                fill
                priority
                className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm text-black text-[10px] font-medium tracking-[0.2em] uppercase px-4 py-2 rounded-full border border-stone-200/50">
                Nowość
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-fade { opacity: 0; animation: heroFade 0.8s ease-out forwards; }
      `}</style>
    </section>
  );
}
