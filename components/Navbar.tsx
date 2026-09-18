"use client";

import { ACCOUNT_FEATURES_ENABLED } from "@/lib/features";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccountModal } from "@/contexts/account-modal/useAccountModal";
import { useAuthState } from "@/contexts/auth-state/useAuthState";
import { useCartCount } from "@/contexts/cart-count/useCartCount";
import { UserIcon } from "@/components/icons/UserIcon";
import Logo from "./Logo";

const links = [
  { href: "/produkty", label: "Sklep" },
  { href: "/wlasny-nadruk", label: "Własny nadruk" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount } = useCartCount();
  const { loggedIn } = useAuthState();
  const { openAccountModal } = useAccountModal();

  return (
    <nav className="mx-4 md:mx-8">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-stone-200/50 bg-white/80 px-6 shadow-lg shadow-black/[0.03] backdrop-blur-xl">
        <Logo />

        <div className="hidden items-center gap-8 text-[13px] font-medium uppercase tracking-wider text-stone-500 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors duration-200 hover:text-black ${
                pathname === link.href ? "text-black" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {ACCOUNT_FEATURES_ENABLED && (loggedIn ? (
            <Link
              href="/konto"
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-stone-100"
              aria-label="Moje konto"
            >
              <UserIcon className="h-5 w-5 text-black" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={openAccountModal}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-colors hover:bg-stone-100"
              aria-label="Zaloguj się"
            >
              <UserIcon className="h-5 w-5 text-black" />
            </button>
          ))}

          <Link
            href="/koszyk"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-stone-100"
            aria-label={`Koszyk, liczba produktów: ${cartCount}`}
          >
            <svg
              className="h-5 w-5 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#27ae60] px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-stone-100 md:hidden"
            aria-label="Menu"
            aria-expanded={open}
          >
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-5 bg-black transition-all duration-300 ${
                  open ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-black transition-all duration-300 ${
                  open ? "scale-0 opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-black transition-all duration-300 ${
                  open ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden rounded-b-2xl border-x border-b border-stone-200/50 bg-white/90 backdrop-blur-xl transition-all duration-500 ease-in-out md:hidden ${
          open ? "mt-2 max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-4 px-6 py-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-stone-600 transition-colors hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
