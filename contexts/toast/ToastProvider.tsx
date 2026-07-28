/**
 * Odpowiedzialność komponentu:
 * - udostępnia globalne API krótkich powiadomień,
 * - zarządza czasem życia i zamykaniem komunikatów,
 * - renderuje responsywną warstwę wizualną powiadomień.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HeartIcon } from "@/components/icons/HeartIcon";
import { XIcon } from "@/components/icons/XIcon";
import { ToastContext } from "./toastContext";
import { useWindowIsBelow } from "./useWindowIsBelow";

interface ToastAnchor {
  top: number;
  right: number;
}

interface Toast {
  id: number;
  message: string;
  leaving: boolean;
  anchor?: ToastAnchor;
  variant?: "add" | "remove";
}

let nextId = 1;

function ToastCard({
  toast,
  onDismiss,
  fullWidth,
}: {
  toast: Toast;
  onDismiss: () => void;
  fullWidth?: boolean;
}) {
  const isRemove = toast.variant === "remove";
  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-2xl border border-[#eaded7] bg-white px-4 py-3.5 shadow-[0_8px_30px_rgba(78,52,46,0.18)] transition-all duration-300 ${
        toast.leaving ? "translate-y-[-6px] opacity-0" : "translate-y-0 opacity-100"
      } ${fullWidth ? "w-full" : "w-[220px]"}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isRemove ? "bg-[#f0eeec] text-cd-brown/40" : "bg-[#fdf0eb] text-[#b94040]"}`}>
        <HeartIcon filled={!isRemove} className="h-4 w-4" />
      </span>
      <p className="flex-1 text-sm font-medium text-cd-brown">{toast.message}</p>
      <button
        type="button"
        aria-label="Zamknij"
        onClick={onDismiss}
        className="ml-1 shrink-0 text-[#b0958e] transition-colors hover:text-cd-brown"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const isMobile = useWindowIsBelow(640);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    timers.current.delete(id);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
  }, []);

  const showToast = useCallback(
    (message: string, anchorEl?: HTMLElement, variant?: "add" | "remove") => {
      const id = nextId++;
      let anchor: ToastAnchor | undefined;
      if (anchorEl) {
        const rect = anchorEl.getBoundingClientRect();
        anchor = {
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        };
      }
      setToasts((prev) => [...prev, { id, message, leaving: false, anchor, variant }]);
      const timer = setTimeout(() => dismiss(id), 3500);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const activeTimers = timers.current;

    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const stackedToasts = isMobile ? toasts : toasts.filter((t) => !t.anchor);
  const anchoredToasts = !isMobile ? toasts.filter((t) => t.anchor) : [];

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Mobile: full-width stack at top — Desktop: fallback for toasts without anchor */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 top-4 z-[9999] flex flex-col gap-2 sm:inset-x-auto sm:left-auto sm:right-5 sm:top-5 sm:w-[320px]"
      >
        {stackedToasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} fullWidth />
        ))}
      </div>

      {/* Desktop: anchored near the clicked button */}
      {anchoredToasts.map((t) => (
        <div
          key={t.id}
          aria-live="polite"
          style={{ top: t.anchor!.top, right: t.anchor!.right }}
          className="pointer-events-none fixed z-[9999]"
        >
          <ToastCard toast={t} onDismiss={() => dismiss(t.id)} />
        </div>
      ))}
    </ToastContext.Provider>
  );
}
