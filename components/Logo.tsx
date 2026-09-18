import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 no-underline outline-none"
    >
      <div className="relative h-20 w-44 shrink-0">
        <Image
          src="/logo-koszulki.svg"
          alt="Zabawne Koszulki"
          fill
          priority
          className="object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </div>
    </Link>
  );
}
