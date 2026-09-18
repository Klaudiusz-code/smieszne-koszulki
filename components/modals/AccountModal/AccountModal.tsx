/**
 * Odpowiedzialność komponentu:
 * - łączy globalny stan modala z formularzami uwierzytelniania,
 * - renderuje logowanie, rejestrację i odzyskiwanie hasła,
 * - pozostawia ustawienia zalogowanego klienta normalnym widokom stron.
 */
"use client";

import { ACCOUNT_FEATURES_ENABLED } from "@/lib/features";

import { useAccountModal } from "@/contexts/account-modal/useAccountModal";
import { useAuthState } from "@/contexts/auth-state/useAuthState";
import { AccountShell } from "@/components/Account/AccountShell";

export function AccountModal() {
  const { isOpen, closeAccountModal } = useAccountModal();
  const { loggedIn } = useAuthState();

  if (!ACCOUNT_FEATURES_ENABLED || !isOpen || loggedIn) {
    return null;
  }

  return (
    <AccountShell
      presentation="modal"
      onClose={closeAccountModal}
    />
  );
}
