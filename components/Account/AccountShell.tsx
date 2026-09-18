/**
 * Odpowiedzialność komponentu:
 * - renderuje ramę i nawigację pełnostronicowych widoków konta,
 * - prezentuje formularze logowania, rejestracji i odzyskiwania hasła,
 * - udostępnia modalny wariant formularzy uwierzytelniania,
 * - obsługuje powrót, wylogowanie i komunikaty formularzy.
 */
"use client";

import type React from "react";
import Link from "next/link";
import { CloseButton } from "@/components/buttons/CloseButton";
import { ModalBackdrop } from "@/components/modals/ModalBackdrop";
import { useAccountAuthForm, type RegisterFormState } from "./useAccountAuthForm";
import { useAccountShellControls, type AccountShellPresentation } from "./useAccountShellControls";
import type { AccountSection } from "@/types/account";
import { ACCOUNT_NAV_ITEMS } from "@/lib/account-navigation";

function ModalFrame({
  children,
  onClose,
  wide = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1c1c1c]/45 px-4 py-6 backdrop-blur-sm sm:px-6 sm:py-10"
      role="dialog"
      aria-modal="true"
    >
      <ModalBackdrop
        label="Zamknij konto"
        onClick={onClose}
        position="fixed"
      />
      <div
        className={`relative z-10 w-full ${
          wide
            ? "max-h-[calc(100svh-48px)] max-w-[1180px] overflow-y-auto sm:max-h-[calc(100svh-80px)]"
            : "max-w-[560px]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function AuthScene({
  children,
  presentation,
  onClose,
}: {
  children: React.ReactNode;
  presentation: AccountShellPresentation;
  onClose: () => void;
}) {
  if (presentation === "modal") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1c1c1c]/50 px-4 py-6 backdrop-blur-sm sm:px-6 sm:py-10"
        role="dialog"
        aria-modal="true"
      >
        <ModalBackdrop label="Zamknij" onClick={onClose} position="fixed" />
        <div className="relative z-10 flex w-full max-w-[720px] flex-col overflow-hidden rounded-[24px] shadow-[0_28px_70px_rgba(30,14,10,0.35)] md:flex-row">
          <AuthLeftPanel />
          <div className="flex flex-1 flex-col bg-white p-7 sm:p-10">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-stone-100 bg-stone-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(221,183,69,0.13),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(39,174,96,0.08),transparent_27%)]" />

      <div className="relative mx-auto flex min-h-[560px] items-center justify-center px-5 py-10 sm:px-8 sm:py-14 md:px-12">
        <div className="w-full max-w-[560px]">{children}</div>
      </div>
    </div>
  );
}

function AccountScene({
  children,
  presentation,
  onClose,
}: {
  children: React.ReactNode;
  presentation: AccountShellPresentation;
  onClose: () => void;
}) {
  if (presentation === "modal") {
    return (
      <ModalFrame onClose={onClose} wide>
        {children}
      </ModalFrame>
    );
  }

  return <div className="my-[24px]">{children}</div>;
}

function AuthPanel({ children, bare = false }: { children: React.ReactNode; bare?: boolean }) {
  if (bare) {
    return <div className="space-y-8">{children}</div>;
  }
  return (
    <section className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(221,183,69,0.10),transparent)]" />
      <div className="relative space-y-8">
        {children}
      </div>
    </section>
  );
}

function AuthLeftPanel() {
  return (
    <div className="relative flex flex-col overflow-hidden bg-black md:w-[300px] md:shrink-0">
      <div className="absolute inset-0 bg-[linear-gradient(155deg,#000000_0%,#171717_68%,#292524_100%)]" />
      <div className="absolute bottom-0 left-0 h-[280px] w-[280px] -translate-x-1/3 translate-y-1/3 rounded-full bg-[#27ae60] opacity-[0.14] blur-[60px]" />
      <div className="absolute right-0 top-0 h-[160px] w-[160px] -translate-y-1/3 translate-x-1/3 rounded-full bg-[#ddb745] opacity-[0.16] blur-[40px]" />

      <div className="relative flex flex-col gap-4 p-6 md:h-full md:justify-center md:gap-8 md:p-9">
        <div className="space-y-2 md:space-y-3">
          <h2 className="text-[18px] font-semibold leading-snug text-white md:text-[22px]">
            Twoje konto, Twoje zakupy
          </h2>
          <p className="text-sm leading-relaxed text-stone-300">
            Śledź zamówienia, zarządzaj adresami i korzystaj z szybszego procesu zakupu.
          </p>
        </div>

        <ul className="hidden space-y-2.5 md:block">
          {["Szybki podgląd zamówień", "Zapisane adresy dostawy", "Historia zakupów w jednym miejscu"].map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-stone-400">
              <span className="h-1 w-1 shrink-0 rounded-full bg-[#ddb745]" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


function AuthPanelSection({
  title,
  description,
  children,
  onClose,
  presentation,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
  presentation: AccountShellPresentation;
}) {
  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h3 className="text-xl font-semibold tracking-tight text-black">{title}</h3>
          <p className="text-sm leading-6 text-stone-500">{description}</p>
        </div>
        {presentation === "modal" ? <CloseButton onClick={onClose} /> : null}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

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
      <label className="block text-sm font-medium text-black">{label}</label>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="m-0 h-[46px] w-full rounded-xl border border-stone-200 bg-white px-4 py-0 text-sm text-black transition-colors focus:border-black focus:outline-none"
      />
    </div>
  );
}

function AuthNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {children}
    </div>
  );
}

function AuthSubmitButton({
  loading,
  idleLabel,
  loadingLabel,
}: {
  loading: boolean;
  idleLabel: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#27ae60] px-6 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[#219150] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
    >
      {loading ? loadingLabel : idleLabel}
    </button>
  );
}

function LoginForm({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
  loading,
  error,
  onClose,
  presentation,
}: {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onForgotPassword: () => void;
  loading: boolean;
  error: string;
  onClose: () => void;
  presentation: AccountShellPresentation;
}) {
  return (
    <AuthPanelSection
      title="Logowanie"
      description="Wróć do zamówień, plików i zapisanych danych."
      onClose={onClose}
      presentation={presentation}
    >
      {error ? <AuthNotice>{error}</AuthNotice> : null}

      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          <AuthField
            label="Login lub e-mail"
            name="username"
            autoComplete="username"
            value={username}
            onChange={onUsernameChange}
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-black">Hasło</label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs text-stone-500 transition-colors hover:text-black"
              >
                Zapomniałeś hasła?
              </button>
            </div>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="m-0 h-[46px] w-full rounded-xl border border-stone-200 bg-white px-4 py-0 text-sm text-black transition-colors focus:border-black focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-4">
          <AuthSubmitButton
            loading={loading}
            idleLabel="Zaloguj się"
            loadingLabel="Logowanie..."
          />
        </div>
      </form>
    </AuthPanelSection>
  );
}

function ForgotPasswordForm({
  email,
  onEmailChange,
  onSubmit,
  loading,
  error,
  success,
  onClose,
  presentation,
}: {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  error: string;
  success: boolean;
  onClose: () => void;
  presentation: AccountShellPresentation;
}) {
  return (
    <AuthPanelSection
      title="Resetowanie hasła"
      description="Wyślemy Ci link do ustawienia nowego hasła."
      onClose={onClose}
      presentation={presentation}
    >
      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Sprawdź skrzynkę e-mail — wysłaliśmy instrukcje resetowania hasła.
        </div>
      ) : (
        <>
          {error ? <AuthNotice>{error}</AuthNotice> : null}
          <form onSubmit={onSubmit} className="space-y-4">
            <AuthField
              label="Login lub e-mail"
              name="email"
              autoComplete="email"
              value={email}
              onChange={onEmailChange}
            />
            <AuthSubmitButton
              loading={loading}
              idleLabel="Wyślij link resetujący"
              loadingLabel="Wysyłanie..."
            />
          </form>
        </>
      )}
    </AuthPanelSection>
  );
}

function RegisterForm({
  form,
  onChange,
  onSubmit,
  loading,
  error,
  onClose,
  presentation,
}: {
  form: RegisterFormState;
  onChange: (next: RegisterFormState) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  error: string;
  onClose: () => void;
  presentation: AccountShellPresentation;
}) {
  return (
    <AuthPanelSection
      title="Rejestracja"
      description="Załóż konto i przyspiesz kolejne zakupy."
      onClose={onClose}
      presentation={presentation}
    >
      {error ? <AuthNotice>{error}</AuthNotice> : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <AuthField
          label="Login"
          name="username"
          autoComplete="username"
          value={form.username}
          onChange={(value) => onChange({ ...form, username: value })}
        />
        <AuthField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(value) => onChange({ ...form, email: value })}
        />
        <AuthField
          label="Hasło"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(value) => onChange({ ...form, password: value })}
        />
        <AuthField
          label="Powtórz hasło"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          value={form.passwordConfirm}
          onChange={(value) => onChange({ ...form, passwordConfirm: value })}
        />
        <AuthSubmitButton
          loading={loading}
          idleLabel="Utwórz konto"
          loadingLabel="Tworzenie konta..."
        />
      </form>
    </AuthPanelSection>
  );
}

export function AccountShell({
  children,
  presentation = "page",
  activeSection,
  onClose,
}: {
  children?: React.ReactNode;
  presentation?: AccountShellPresentation;
  activeSection?: AccountSection;
  onClose?: () => void;
}) {
  const { pathname, isModal, closeAccount } = useAccountShellControls({ presentation, onClose });
  const {
    loggedIn,
    authMode,
    loginLoading,
    registerLoading,
    username,
    password,
    registerForm,
    loginError,
    registerError,
    forgotEmail,
    forgotLoading,
    forgotError,
    forgotSuccess,
    setUsername,
    setPassword,
    setRegisterForm,
    setForgotEmail,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    logout,
    showLogin,
    showRegister,
    showForgotPassword,
  } = useAccountAuthForm();

  if (!loggedIn) {
    return (
      <AuthScene presentation={presentation} onClose={closeAccount}>
        <AuthPanel bare={isModal}>
          {authMode === "login" ? (
            <>
              <LoginForm
                username={username}
                password={password}
                onUsernameChange={setUsername}
                onPasswordChange={setPassword}
                onSubmit={handleLogin}
                onForgotPassword={showForgotPassword}
                loading={loginLoading}
                error={loginError}
                onClose={closeAccount}
                presentation={presentation}
              />
              <p className="text-center text-sm text-stone-500">
                Nie masz konta?{" "}
                <button
                  type="button"
                  onClick={showRegister}
                  className="cursor-pointer font-medium text-black transition-colors hover:text-[#27ae60]"
                >
                  Zarejestruj się
                </button>
              </p>
            </>
          ) : authMode === "forgotPassword" ? (
            <>
              <ForgotPasswordForm
                email={forgotEmail}
                onEmailChange={setForgotEmail}
                onSubmit={handleForgotPassword}
                loading={forgotLoading}
                error={forgotError}
                success={forgotSuccess}
                onClose={closeAccount}
                presentation={presentation}
              />
              <p className="text-center text-sm text-stone-500">
                <button
                  type="button"
                  onClick={showLogin}
                  className="cursor-pointer font-medium text-black transition-colors hover:text-[#27ae60]"
                >
                  ← Wróć do logowania
                </button>
              </p>
            </>
          ) : (
            <>
              <RegisterForm
                form={registerForm}
                onChange={setRegisterForm}
                onSubmit={handleRegister}
                loading={registerLoading}
                error={registerError}
                onClose={closeAccount}
                presentation={presentation}
              />
              <p className="text-center text-sm text-stone-500">
                Masz już konto?{" "}
                <button
                  type="button"
                  onClick={showLogin}
                  className="cursor-pointer font-medium text-black transition-colors hover:text-[#27ae60]"
                >
                  Zaloguj się
                </button>
              </p>
            </>
          )}
        </AuthPanel>
      </AuthScene>
    );
  }

  const currentSection =
    activeSection ??
    ACCOUNT_NAV_ITEMS.find(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.section ??
    "details";

  return (
    <AccountScene presentation={presentation} onClose={closeAccount}>
      <div className="space-y-6">
        <nav className="rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_NAV_ITEMS.map((item) => {
                const active = currentSection === item.section;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-black text-white"
                        : "text-stone-600 hover:bg-white hover:text-black"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={logout}
                className="cursor-pointer text-sm font-medium text-[#9a3a2f] transition-colors hover:text-[#6f241d]"
              >
                Wyloguj się
              </button>
              {presentation === "modal" ? (
                <CloseButton onClick={closeAccount} />
              ) : null}
            </div>
          </div>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </AccountScene>
  );
}
