import Link from "next/link";

const steps = [
  {
    num: "01",
    title: "Napisz do nas",
    desc: "Opisz pomysł lub prześlij grafikę.",
    color: "bg-black",
    textColor: "text-white",
  },
  {
    num: "02",
    title: "Wizualizacja",
    desc: "Przygotowujemy cyfrowy projekt.",
    color: "bg-[#ddb745]",
    textColor: "text-black",
  },
  {
    num: "03",
    title: "Druk",
    desc: "Akceptujesz, płacisz i drukujemy.",
    color: "bg-black",
    textColor: "text-white",
  },
  {
    num: "04",
    title: "Dostawa 24h",
    desc: "Kurier przywozi paczkę pod drzwi.",
    color: "bg-[#27ae60]",
    textColor: "text-white",
  },
];

export default function ProcessSection() {
  return (
    <section
      id="proces"
      className="py-28 px-6 bg-white border-t border-stone-100"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-xs font-medium text-[#ddb745] uppercase tracking-widest mb-3">
            Proces
          </p>
          <h2 className="text-3xl md:text-4xl font-medium text-black tracking-tight">
            Jak zamówić własny nadruk?
          </h2>
          <p className="text-stone-500 text-sm max-w-lg mx-auto mt-4 leading-relaxed">
            Nie musisz obsługiwać sklepu. Opisz pomysł, my zajmiemy się techniką
            i wysyłką.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative">
          <div className="hidden md:block absolute top-6 left-0 w-full h-px bg-gradient-to-r from-black via-[#ddb745] to-[#27ae60] z-0 opacity-30" />

          {steps.map((s) => (
            <div key={s.num} className="relative z-10 text-center group">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-6 text-sm font-bold tracking-tight transition-shadow duration-300 group-hover:shadow-lg ${s.color} ${s.textColor}
                ${s.color === "bg-[#27ae60]" ? "group-hover:shadow-[#27ae60]/30" : ""}
                ${s.color === "bg-[#ddb745]" ? "group-hover:shadow-[#ddb745]/30" : ""}
              `}
              >
                {s.num}
              </div>
              <h3 className="text-base font-medium text-black tracking-tight mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed font-light">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link
            href="/wlasny-nadruk"
            className="inline-flex items-center gap-2 px-10 py-4 bg-black text-white font-medium text-xs tracking-widest uppercase rounded-full border border-black hover:bg-[#27ae60] hover:border-[#27ae60] transition-all duration-300 shadow-sm hover:shadow-[#27ae60]/20"
          >
            Zobacz szczegółowy proces
            <svg
              className="w-4 h-4"
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
        </div>
      </div>
    </section>
  );
}
