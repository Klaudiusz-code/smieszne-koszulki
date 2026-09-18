/**
 * Renderuje wskazaną sekcję konta jako pełny widok z nawigacją między trasami.
 */
"use client";

import Addresses from "@/components/Addresses/Addresses";
import Details from "@/components/Details/Details";
import Files from "@/components/Files/Files";
import Orders from "@/components/Orders/Orders";
import { AccountShell } from "@/components/Account/AccountShell";
import { Button } from "@/components/buttons/Button";
import { LockIcon } from "@/components/icons/LockIcon";
import { useAccountModal } from "@/contexts/account-modal/useAccountModal";
import { useAuthState } from "@/contexts/auth-state/useAuthState";
import type { AccountSection } from "@/types/account";

function AccountSectionContent({ section }: { section: AccountSection }) {
  if (section === "orders") {
    return <Orders />;
  }

  if (section === "files") {
    return <Files />;
  }

  if (section === "addresses") {
    return <Addresses />;
  }

  return <Details />;
}

export function AccountView({ section }: { section: AccountSection }) {
  const { loggedIn } = useAuthState();
  const { openAccountModal } = useAccountModal();

  if (!loggedIn) {
    return (
      <div className="mt-[64px]">
        <section
          aria-labelledby="account-access-title"
          className="relative overflow-hidden rounded-[24px] border border-[#eaded7] bg-white px-6 py-16 text-center shadow-[0_16px_42px_rgba(78,52,46,0.08)] sm:px-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,179,0,0.10),transparent_38%)]" />
          <div className="relative mx-auto flex max-w-[560px] flex-col items-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cd-cream text-cd-brown">
              <LockIcon className="h-6 w-6" />
            </span>
            <h1
              id="account-access-title"
              className="mt-6 text-[30px] font-medium text-cd-brown sm:text-[34px]"
            >
              Brak dostępu
            </h1>
            <p className="mt-3 text-[16px] leading-7 text-cd-brown/65">
              Zaloguj się, aby zobaczyć dane konta, zamówienia, adresy i pliki do pobrania.
            </p>
            <Button
              variant="primary"
              size="form"
              elevated
              onClick={() => openAccountModal()}
              className="mt-7 px-7"
            >
              Zaloguj się
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <AccountShell presentation="page" activeSection={section}>
      <AccountSectionContent section={section} />
    </AccountShell>
  );
}
