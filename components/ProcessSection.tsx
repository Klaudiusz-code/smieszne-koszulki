import Link from "next/link";

const steps = [
  {
    title: "Wybierz lub wgraj",
    desc: "P选择的gotowy wzór z naszego sklepu albo wgraj własną grafikę i tekst.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    title: "Dopasowujemy",
    desc: "Nasz grafik układa nadruk na koszulce i wysyła Ci podgląd do akceptacji.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    title: "Drukujemy",
    desc: "Po Twoim okejce bierzemy się za pracę. Trwały nadruk, brak kompromisów.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 7.131H5.25" />
      </svg>
    ),
  },
  {
    title: "Wysyłamy w 24h",
    desc: "Pakujemy w foliopak i kurier GLS zostawia paczkę pod Twoimi drzwiami.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
];

export default function ProcessSection() {
  return (
    <section id="proces" className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        
        {/* Nagłówek - wyśrodkowany, bardzo czysty */}
        <div className="text-center mb-20">
          <p className="text-xs font-semibold text-[#ddb745] uppercase tracking-widest mb-4">
            Własny nadruk
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
            Od pomysłu do paczki w czterech krokach
          </h2>
        </div>

        {/* Siatka kroków */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Delikatna linia łącząca - tylko na desktopie */}
          <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px border-t border-dashed border-stone-200" />

          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center group">
              
              {/* Kółko z ikoną na tle linii */}
              <div className="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-stone-100 flex items-center justify-center text-stone-400 mb-6 group-hover:border-[#27ae60] group-hover:text-[#27ae60] transition-colors duration-300">
                {step.icon}
              </div>

              {/* Tekst */}
              <h3 className="text-base font-medium text-black tracking-tight mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-stone-400 leading-relaxed font-light max-w-[200px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Delikatne CTA na dole - nie krzyczy, po prostu jest */}
        <div className="mt-16 text-center">
          <Link
            href="/wlasny-nadruk"
            className="group inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-black border-b border-stone-200 hover:border-black pb-1 transition-all duration-200"
          >
            Chcę zobaczyć jak to dokładnie działa
            <svg 
              className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}