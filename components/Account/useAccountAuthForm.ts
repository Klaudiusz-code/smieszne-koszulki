/**
 * Odpowiedzialność hooka:
 * - zarządza formularzami logowania, rejestracji i odzyskiwania hasła,
 * - waliduje dane oraz komunikuje się z endpointami uwierzytelniania,
 * - obsługuje wylogowanie, przełączanie trybów i komunikaty błędów.
 */
import { useState, type FormEvent } from "react";
import { useAuthState } from "@/contexts/auth-state/useAuthState";
import { htmlToPlainText } from "@/lib/html-text";

export interface RegisterFormState {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export type AuthMode = "login" | "register" | "forgotPassword";

const EMPTY_REGISTER_FORM: RegisterFormState = {
  username: "",
  email: "",
  password: "",
  passwordConfirm: "",
};

function getAuthError(error: unknown, fallback: string) {
  if (typeof error !== "string") {
    return fallback;
  }

  return htmlToPlainText(error) || fallback;
}

export function useAccountAuthForm() {
  const { loggedIn, setLoggedOut } = useAuthState();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(EMPTY_REGISTER_FORM);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  function showLogin() {
    setAuthMode("login");
    setRegisterError("");
    setForgotError("");
    setForgotSuccess(false);
  }

  function showRegister() {
    setAuthMode("register");
    setLoginError("");
    setForgotError("");
    setForgotSuccess(false);
  }

  function showForgotPassword() {
    setAuthMode("forgotPassword");
    setLoginError("");
    setForgotEmail("");
    setForgotError("");
    setForgotSuccess(false);
  }

  async function handleForgotPassword(event: FormEvent) {
    event.preventDefault();
    setForgotLoading(true);
    setForgotError("");

    if (!forgotEmail.trim()) {
      setForgotError("Podaj login lub e-mail.");
      setForgotLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/wp-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: forgotEmail.trim() }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setForgotError(
          getAuthError(data.error, "Nie udało się wysłać e-maila."),
        );
        return;
      }

      setForgotSuccess(true);
    } catch {
      setForgotError("Nie udało się połączyć z serwerem.");
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/wp-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setLoginError(getAuthError(data.error, "Nie udało się zalogować."));
        return;
      }

      window.location.reload();
    } catch {
      setLoginError("Nie udało się połączyć z serwerem.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setRegisterLoading(true);
    setRegisterError("");

    if (!registerForm.username.trim() || !registerForm.email.trim() || !registerForm.password) {
      setRegisterError("Uzupełnij login, e-mail i hasło.");
      setRegisterLoading(false);
      return;
    }

    if (registerForm.password.length < 12) {
      setRegisterError("Hasło powinno mieć co najmniej 12 znaków.");
      setRegisterLoading(false);
      return;
    }

    if (registerForm.password !== registerForm.passwordConfirm) {
      setRegisterError("Hasła nie są takie same.");
      setRegisterLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/wp-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setRegisterError(
          getAuthError(data.error, "Nie udało się utworzyć konta."),
        );
        return;
      }

      window.location.reload();
    } catch {
      setRegisterError("Nie udało się połączyć z serwerem.");
    } finally {
      setRegisterLoading(false);
    }
  }

  async function logout() {
    try {
      const response = await fetch("/api/wp-logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      setLoggedOut();
      window.location.reload();
    } catch {
      setLoginError("Nie udało się wylogować. Spróbuj ponownie.");
    }
  }

  return {
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
  };
}
