"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";

import Logo from "./Logo";

const links = [
  { href: "/sklep", label: "Sklep" },
  { href: "/wlasny-nadruk", label: "Jak to działa?" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />

        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-500">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-black transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <Link
          href="/koszyk"
          className="relative w-10 h-10 flex items-center justify-center hover:bg-stone-50 rounded-full transition-colors"
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
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#27ae60] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden w-10 h-10 flex items-center justify-center"
          aria-label="Menu"
        >
          <div className="space-y-1.5">
            <span
              className={`block w-5 h-0.5 bg-black transition-transform duration-200 ${
                open ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-black transition-opacity duration-200 ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-black transition-transform duration-200 ${
                open ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-6 space-y-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-600 hover:text-black"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/sklep"
            onClick={() => setOpen(false)}
            className="block w-full text-center px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full"
          >
            Przejdź do sklepu
          </Link>
        </div>
      )}
    </nav>
  );
}
