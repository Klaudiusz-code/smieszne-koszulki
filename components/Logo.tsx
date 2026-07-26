import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 group no-underline outline-none"
    >
      <div className="relative w-44 h-20 shrink-0">
        <Image
          src="/logo-koszulki.svg"
          alt="Śmieszne Koszulki"
          fill
          priority
          className="object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </div>
    </Link>
  );
}
