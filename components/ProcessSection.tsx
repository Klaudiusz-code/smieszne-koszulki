import Link from "next/link";

const steps = [
  {
    title: "Wybierz lub wgraj",
    desc: "Wybierz gotowy wzór z naszego sklepu albo wgraj własną grafikę i tekst.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    title: "Dopasowujemy",
    desc: "Nasz grafik układa nadruk na koszulce i wysyła Ci podgląd do akceptacji.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    title: "Drukujemy",
    desc: "Po Twojej akceptacji bierzemy się za pracę. Trwały nadruk, bez kompromisów.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 7.131H5.25" />
      </svg>
    ),
  },
  {
    title: "Wysyłamy w 24h",
    desc: "Pakujemy zamówienie i kurier dostarcza paczkę pod Twoje drzwi.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
];

export default function ProcessSection() {
  return (
    <section id="proces" className="bg-white px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-20 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#ddb745]">
            Własny nadruk
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-black md:text-4xl">
            Od pomysłu do paczki w czterech krokach
          </h2>
        </div>

        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
          <div className="absolute left-[12.5%] right-[12.5%] top-6 hidden h-px border-t border-dashed border-stone-200 md:block" />

          {steps.map((step) => (
            <div key={step.title} className="group relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-stone-100 bg-white text-stone-400 transition-colors duration-300 group-hover:border-[#27ae60] group-hover:text-[#27ae60]">
                {step.icon}
              </div>
              <h3 className="mb-2 text-base font-medium tracking-tight text-black">
                {step.title}
              </h3>
              <p className="max-w-[200px] text-sm font-light leading-relaxed text-stone-400">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/wlasny-nadruk"
            className="group inline-flex items-center gap-2 border-b border-stone-200 pb-1 text-sm font-medium text-stone-500 transition-all duration-200 hover:border-black hover:text-black"
          >
            Chcę zobaczyć jak to dokładnie działa
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
