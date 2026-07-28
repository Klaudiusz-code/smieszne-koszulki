"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CommerceStore } from "../core/store";

const StoreContext = createContext<CommerceStore | null>(null);

/** The factory runs once per mounted provider, including one isolated instance per SSR tree. */
export function CommerceProvider({ createStore, children }: { createStore: () => CommerceStore; children: ReactNode }) {
  const [store] = useState(createStore);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useCommerce() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("CommerceProvider is required");
  return store;
}
