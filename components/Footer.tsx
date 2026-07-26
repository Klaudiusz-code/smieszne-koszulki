import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-10 px-6 border-t border-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
        <div className="md:col-span-2">
          <Logo />
          <p className="text-gray-400 text-sm max-w-sm mt-4 leading-relaxed">
            Profesjonalny druk odzieży w Zamościu. Gotowe wzory i projekty
            własne. Wysyłka w 24h po całej Polsce.
          </p>
          <div className="flex gap-3 mt-6">
            {["FB", "IG"].map((s) => (
              <a
                key={s}
                href="#"
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[11px] font-bold text-gray-500 hover:bg-black hover:text-white transition"
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h5 className="font-bold text-[11px] uppercase tracking-widest text-gray-400 mb-5">
            Nawigacja
          </h5>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-black transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/sklep" className="hover:text-black transition">
                Sklep
              </Link>
            </li>
            <li>
              <Link href="/#proces" className="hover:text-black transition">
                Jak to działa
              </Link>
            </li>
            <li>
              <Link href="/#kontakt" className="hover:text-black transition">
                Kontakt
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-[11px] uppercase tracking-widest text-gray-400 mb-5">
            Kontakt
          </h5>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>Zamość, Polska</li>
            <li>kontakt@smiesznekoszulki.pl</li>
            <li>+48 123 456 789</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Śmieszne Koszulki</p>
        <a
          href="https://klaudiuszdev.pl"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 md:mt-0 hover:text-black transition-colors"
        >
          Designed by klaudiuszdev.pl
        </a>
      </div>
    </footer>
  );
}
