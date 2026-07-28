"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import Logo from "./Logo";

const links = [
  { href: "/sklep", label: "Sklep" },
  { href: "/wlasny-nadruk", label: "Własny nadruk" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-4 z-50 mx-4 md:mx-8 mt-4">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/[0.03] border border-stone-200/50 px-6 h-16 flex items-center justify-between">
        <Logo />

        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium uppercase tracking-wider text-stone-500">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-black transition-colors duration-200"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/koszyk"
            className="relative w-10 h-10 flex items-center justify-center hover:bg-stone-100 rounded-xl transition-colors"
            aria-label="Koszyk"
          >
            <svg
              className="w-5 h-5 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#27ae60] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex items-center justify-center hover:bg-stone-100 rounded-xl transition-colors"
            aria-label="Menu"
          >
            <div className="space-y-1.5">
              <span
                className={`block w-5 h-0.5 bg-black transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-black transition-all duration-300 ${open ? "opacity-0 scale-0" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-black transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </div>
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out bg-white/90 backdrop-blur-xl rounded-b-2xl border-x border-b border-stone-200/50 ${open ? "max-h-64 opacity-100 mt-2" : "max-h-0 opacity-0"}`}
      >
        <div className="px-6 py-6 space-y-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-stone-600 hover:text-black transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
