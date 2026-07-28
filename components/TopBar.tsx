export default function TopBar() {
  return (
    <div className="border-b border-white/5 bg-black text-[11px] font-light tracking-wide text-white/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5">
        <span>Darmowa dostawa od 190 zł · Wysyłka w 24h</span>

        <div className="hidden items-center gap-4 sm:flex">
          <a
            href="mailto:kontakt@smiesznekoszulki.pl"
            className="transition-colors duration-300 hover:text-white"
          >
            kontakt@smiesznekoszulki.pl
          </a>
          <span className="text-white/20">|</span>
          <a
            href="tel:+48123456789"
            className="transition-colors duration-300 hover:text-white"
          >
            +48 123 456 789
          </a>
        </div>
      </div>
    </div>
  );
}
