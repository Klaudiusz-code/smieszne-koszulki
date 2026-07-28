"use client";

import { createContext } from "react";

export interface AuthStateContextValue {
  loggedIn: boolean;
  userName: string;
  setAuthenticated: (nextUserName?: string) => void;
  setLoggedOut: () => void;
  syncAuth: (nextLoggedIn: boolean, nextUserName?: string) => void;
}

export const AuthStateContext = createContext<AuthStateContextValue | null>(null);
