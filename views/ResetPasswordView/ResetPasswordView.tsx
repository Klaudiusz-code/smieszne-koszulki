/**
 * Odpowiedzialność komponentu:
 * - weryfikuje dane procesu resetowania hasła,
 * - zbiera i waliduje nowe hasło użytkownika,
 * - prezentuje wynik operacji oraz możliwe dalsze kroki.
 */
"use client";

import { Button } from "@/components/buttons/Button";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CompanyLogo } from "@/components/CompanyLogo/CompanyLogo";

function AuthField({
  label,
  value,
  onChange,
  type = "text",
  name,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  name?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-cd-brown">{label}</label>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="m-0 h-[46px] w-full rounded-xl border border-[#eaded7] bg-white px-4 py-0 text-sm text-cd-brown transition-colors focus:border-cd-gold focus:outline-none"
      />
    </div>
  );
}

function Notice({ children, variant = "error" }: { children: React.ReactNode; variant?: "error" | "success" }) {
  const styles =
    variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export function ResetPasswordView() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key") ?? "";
  const login = searchParams.get("login") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isValidLink = key.length > 0 && login.length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 12) {
      setError("Hasło powinno mieć co najmniej 12 znaków.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Hasła nie są takie same.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/wp-set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, login, password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Nie udało się zresetować hasła.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Nie udało się połączyć z serwerem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-svh overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#fafaf9_0%,#ffffff_54%,#f1e2da_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,179,0,0.12),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(78,52,46,0.1),transparent_25%)]" />

      <div className="relative mx-auto flex min-h-svh max-w-[1600px] items-start justify-center px-5 pt-12 pb-10 sm:px-8 sm:pt-16">
        <div className="w-full max-w-[480px]">
          <div className="mb-8 flex justify-center">
            <Link href="/">
              <CompanyLogo className="h-[54px] w-auto text-cd-brown sm:h-[74px]" />
            </Link>
          </div>

          <section className="rounded-[24px] border border-[#eaded7] bg-white p-6 shadow-[0_18px_50px_rgba(78,52,46,0.12)] sm:p-8">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h1 className="text-xl font-semibold text-cd-brown">Nowe hasło</h1>
                <p className="text-sm leading-6 text-[#7d625a]">
                  {isValidLink
                    ? "Ustaw nowe hasło do swojego konta."
                    : "Link resetowania hasła jest nieprawidłowy lub wygasł."}
                </p>
              </div>

              {!isValidLink ? (
                <Notice variant="error">
                  Link resetowania hasła jest nieprawidłowy lub wygasł. Spróbuj ponownie wysłać prośbę o reset.
                </Notice>
              ) : success ? (
                <Notice variant="success">
                  Hasło zostało zmienione. Możesz się teraz zalogować nowym hasłem.
                </Notice>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error ? <Notice>{error}</Notice> : null}
                  <AuthField
                    label="Nowe hasło"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={setPassword}
                  />
                  <AuthField
                    label="Powtórz nowe hasło"
                    name="passwordConfirm"
                    type="password"
                    autoComplete="new-password"
                    value={passwordConfirm}
                    onChange={setPasswordConfirm}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="form"
                    loading={loading}
                    loadingLabel="Zapisywanie..."
                    className="w-full"
                  >
                    Ustaw nowe hasło
                  </Button>
                </form>
              )}
            </div>
          </section>

          <p className="mt-6 text-center text-sm text-[#7d625a]">
            <Link href="/" className="font-medium text-cd-brown transition-colors hover:text-[#27ae60]">
              ← Wróć do strony głównej
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
