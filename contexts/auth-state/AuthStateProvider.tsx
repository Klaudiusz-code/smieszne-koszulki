/**
 * Odpowiedzialność komponentu:
 * - utrzymuje bieżący stan uwierzytelnienia klienta,
 * - synchronizuje dane sesji z przeglądarką i backendem,
 * - udostępnia operacje odświeżania oraz czyszczenia sesji.
 */
"use client";

import { useEffect, useState } from "react";
import { ACCOUNT_FEATURES_ENABLED } from "@/lib/features";
import { AuthStateContext } from "./authStateContext";

export function AuthStateProvider({
  children,
  initialLoggedIn = false,
  initialUserName = "",
}: {
  children: React.ReactNode;
  initialLoggedIn?: boolean;
  initialUserName?: string;
}) {
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);
  const [userName, setUserName] = useState(initialUserName);

  useEffect(() => {
    if (!ACCOUNT_FEATURES_ENABLED) return;
    let active = true;
    let pending = false;
    async function verify() {
      if (pending) return;
      pending = true;
      try {
        const response = await fetch("/api/token-info", { cache: "no-store" });
        if (!response.ok) throw new Error("Session unavailable");
        const data = await response.json();
        if (active) {
          setLoggedIn(data.logged_in === true);
          setUserName(data.logged_in ? data.user_name || "" : "");
        }
      } catch {
        if (active) { setLoggedIn(false); setUserName(""); }
      } finally { pending = false; }
    }
    void verify();
    const timer = window.setInterval(() => void verify(), 60000);
    window.addEventListener("focus", verify);
    window.addEventListener("store:session-expired", verify);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", verify);
      window.removeEventListener("store:session-expired", verify);
    };
  }, []);

  function syncAuth(nextLoggedIn: boolean, nextUserName = "") {
    setLoggedIn(nextLoggedIn);
    setUserName(nextLoggedIn ? nextUserName : "");
  }

  function setAuthenticated(nextUserName = "") {
    syncAuth(true, nextUserName);
  }

  function setLoggedOut() {
    syncAuth(false);
  }

  return (
    <AuthStateContext.Provider
      value={{ loggedIn, userName, setAuthenticated, setLoggedOut, syncAuth }}
    >
      {children}
    </AuthStateContext.Provider>
  );
}
