import Link from "next/link";

const shopLinks = [
  { label: "Koszulki", href: "/kategoria/koszulki" },
  { label: "Bluzy", href: "/kategoria/bluza" },
  { label: "Kubki", href: "/kategoria/kubki" },
  { label: "Gadżety", href: "/kategoria/gadzety" },
  { label: "Wszystkie produkty", href: "/produkty" },
];

const infoLinks = [
  { label: "Własny nadruk", href: "/wlasny-nadruk" },
  { label: "Kontakt", href: "/kontakt" },
  { label: "Regulamin", href: "/regulamin" },
  { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
  { label: "Zwroty", href: "/zwroty" },
];

const socialUrl =
  "https://smieszne-koszulki.netlify.app/wlasny-nadruk#";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <h2 className="mb-6 text-3xl font-semibold tracking-tight md:text-4xl">
              Śmieszne
              <br />
              <span className="text-[#ddb745]">Koszulki</span>
            </h2>
            <p className="mb-8 max-w-sm text-sm font-light leading-relaxed text-stone-400">
              Profesjonalny druk odzieży w Zamościu. Gotowe wzory i projekty
              własne. Wysyłka w 24h po całej Polsce.
            </p>
            <div className="flex gap-4">
              {["FB", "IG"].map((social) => (
                <a
                  key={social}
                  href={socialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-800 text-[11px] font-bold text-stone-500 transition-colors hover:border-[#ddb745] hover:text-[#ddb745]"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 md:pl-8">
            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-stone-500">
              Sklep
            </h3>
            <ul className="space-y-4">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-stone-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 md:pl-8">
            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-stone-500">
              Informacje
            </h3>
            <ul className="space-y-4">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-stone-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-stone-800/50 pt-8">
              <p className="mb-2 text-xs uppercase tracking-wider text-stone-600">
                Napisz lub zadzwoń
              </p>
              <div className="space-y-2">
                <a
                  href="mailto:kontakt@smiesznekoszulki.pl"
                  className="block text-sm text-[#ddb745] hover:underline"
                >
                  kontakt@smiesznekoszulki.pl
                </a>
                <a
                  href="tel:+48123456789"
                  className="block text-sm text-stone-400 transition-colors hover:text-white"
                >
                  +48 123 456 789
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
          <p className="text-xs font-light text-stone-600">
            © {new Date().getFullYear()} Zabawne Koszulki. Wszelkie prawa
            zastrzeżone.
          </p>
          <a
            href="https://klaudiuszdev.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-stone-600 transition-colors hover:text-[#ddb745]"
          >
            Designed by klaudiuszdev.pl
          </a>
        </div>
      </div>
    </footer>
  );
}
