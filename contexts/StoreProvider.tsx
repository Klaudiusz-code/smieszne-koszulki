"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CommerceProvider, useCommerce } from "@/packages/commerce/react";
import { createBrowserStore } from "@/lib/store/browser";
import { useAuthState } from "./auth-state/useAuthState";

function SessionBoundary({ children }: { children: ReactNode }) {
  const store = useCommerce();
  const { loggedIn, userName } = useAuthState();
  const previousSession = useRef({ loggedIn, userName });
  useEffect(() => {
    const previous = previousSession.current;
    if (previous.loggedIn !== loggedIn || previous.userName !== userName) store.resetSession();
    previousSession.current = { loggedIn, userName };
  }, [store, loggedIn, userName]);
  return children;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  return <CommerceProvider createStore={createBrowserStore}><SessionBoundary>{children}</SessionBoundary></CommerceProvider>;
}
