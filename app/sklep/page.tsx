// app/sklep/page.tsx
import Link from "next/link";
import Image from "next/image";

// --- METADATA ---
export const metadata = {
  title: "Sklep - W trakcie budowy | Śmieszne Koszulki",
  description: "Tutaj pojawi się pełen sklep z koszulkami i gadżetami. Zobacz nasze projekty na stronie głównej.",
};

export default function Sklep() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-yellow-200 selection:text-black flex flex-col">
      
      {/* 1. HEADER - Back to Home */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-3 group">
            <span className="font-black text-3xl text-gray-900 group-hover:text-yellow-500 transition-colors">:)</span>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-lg tracking-tight uppercase text-gray-900">Śmieszne</span>
              <span className="font-medium text-[10px] uppercase tracking-widest text-gray-400">Koszulki</span>
            </div>
          </Link>

          {/* CTA powrotny */}
          <Link 
            href="/"
            className="hidden md:inline-flex items-center justify-center px-6 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-yellow-500 transition-colors"
          >
            Wróć na główną
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION - Placeholder Sklepu */}
      <section className="flex-grow flex flex-col justify-center items-center py-32 px-6 bg-gray-50 relative overflow-hidden">
        {/* Tło dekoracyjne */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-200/40 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          {/* Ikona Sklepu */}
          <div className="w-24 h-24 bg-white border-4 border-gray-900 rounded-2xl flex items-center justify-center text-4xl mx-auto shadow-xl animate-bounce-slow">
            🛒
          </div>
          
          {/* Główny Nagłówek - zgodnie z zapytaniem */}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">
            TUTAJ BĘDZIE <br/>
            <span className="text-yellow-500 px">SKLEP SMIESZNE KOSZULKI</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Już pracujemy nad pełnym asortymentem. Tymczasem sprawdź nasze aktualne propozycje na stronie głównej.
          </p>
          
          {/* Duży Przycisk Powrotu */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link 
              href="/"
              className="inline-flex justify-center items-center px-12 py-5 bg-gray-900 text-white font-bold text-sm tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-colors shadow-xl rounded-full"
            >
              Wróć na stronę główną
            </Link>
          </div>
        </div>
      </section>

      

      {/* 4. FOOTER */}
      <footer className="bg-white pt-12 pb-6 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center gap-3 justify-center mb-6">
            <span className="font-black text-2xl text-gray-900">:)</span>
            <span className="font-black text-lg uppercase tracking-tighter text-gray-900">Śmieszne<span className="font-normal text-gray-400">Koszulki</span></span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  );
}