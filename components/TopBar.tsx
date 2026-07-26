import Link from "next/link";

export default function TopBar() {
  return (
    <div className="bg-black text-white/60 text-[11px] font-light tracking-wide border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex justify-between items-center">
        <span>Darmowa dostawa od 150 zł · Wysyłka w 24h</span>

        <div className="flex items-center gap-4">
          <a
            href="mailto:kontakt@smiesznekoszulki.pl"
            className="hover:text-white transition-colors duration-300"
          >
            kontakt@smiesznekoszulki.pl
          </a>
          <span className="text-white/20">|</span>
          <span>+48 123 456 789</span>
        </div>
      </div>
    </div>
  );
}
