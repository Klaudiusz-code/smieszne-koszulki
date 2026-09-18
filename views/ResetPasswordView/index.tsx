/** Renderuje stronę ustawienia nowego hasła i izoluje widok zależny od parametrów URL. */
import { Suspense } from "react";
import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";
import { ResetPasswordView } from "./ResetPasswordView";

export const metadata: Metadata = createSeoMetadata({
  title: "Resetowanie hasła",
  description: "Ustaw nowe hasło do swojego konta.",
  path: "/resetuj-haslo",
});

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordView />
    </Suspense>
  );
}
