import { useEffect, useState } from "react";

type EasyPackPoint = { name: string; address: { line1: string; line2?: string } };
type EasyPackCallback = (point: EasyPackPoint) => void;

declare global {
  interface Window {
    easyPack?: {
      init: (config: Record<string, unknown>) => void;
      mapWidget: (containerId: string, callback: EasyPackCallback) => unknown;
      map?: {
        viewChooserObj?: { resetState?: () => void };
      };
    };
    __easyPackInitialized?: boolean;
  }
}

let easyPackLoadPromise: Promise<void> | null = null;

function ensureEasyPackStyles() {
  if (document.getElementById("easypack-css")) {
    return;
  }

  const link = document.createElement("link");
  link.id = "easypack-css";
  link.rel = "stylesheet";
  link.href = "https://geowidget.easypack24.net/css/easypack.css";
  document.head.appendChild(link);
}

function isAlreadyInitializedError(error: unknown) {
  return error instanceof Error && /already initialized/i.test(error.message);
}

function initEasyPackWidget() {
  if (window.__easyPackInitialized || !window.easyPack) {
    return;
  }

  try {
    window.easyPack.init({
      defaultLocale: "pl",
      mapType: "osm",
      searchType: "osm",
      points: { types: ["parcel_locker_only"] },
      map: {
        defaultLocation: [52.2296756, 21.0122287],
        initialTypes: ["parcel_locker_only"],
        useGeolocation: false,
      },
    });
  } catch (error) {
    if (!isAlreadyInitializedError(error)) {
      throw error;
    }
  }

  window.__easyPackInitialized = true;
}

export function renderEasyPackMap(containerId: string, callback: EasyPackCallback) {
  if (!window.easyPack) {
    return false;
  }

  // SDK przechowuje mapę jako singleton. Po usunięciu poprzedniego kontenera
  // pozostawiona instancja potrafi odtworzyć mapę bez listy punktów.
  window.easyPack.map = undefined;
  window.easyPack.mapWidget(containerId, callback);
  return true;
}

export function refreshEasyPackMap() {
  window.easyPack?.map?.viewChooserObj?.resetState?.();
  window.dispatchEvent(new Event("resize"));
}

function ensureEasyPackWidget() {
  ensureEasyPackStyles();

  if (easyPackLoadPromise) {
    return easyPackLoadPromise;
  }

  easyPackLoadPromise = new Promise<void>((resolve, reject) => {
    const finish = () => {
      try {
        initEasyPackWidget();
        resolve();
      } catch (error) {
        easyPackLoadPromise = null;
        reject(error);
      }
    };

    if (window.easyPack) {
      finish();
      return;
    }

    const existingScript = document.getElementById("easypack-js");
    if (existingScript) {
      existingScript.addEventListener("load", finish, { once: true });
      existingScript.addEventListener("error", () => {
        easyPackLoadPromise = null;
        reject(new Error("Nie udało się załadować EasyPack SDK."));
      }, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "easypack-js";
    script.src = "https://geowidget.easypack24.net/js/sdk-for-javascript.js";
    script.async = true;
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => {
      easyPackLoadPromise = null;
      reject(new Error("Nie udało się załadować EasyPack SDK."));
    }, { once: true });
    document.head.appendChild(script);
  });

  return easyPackLoadPromise;
}

export function useEasyPackWidget() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    ensureEasyPackWidget()
      .then(() => {
        if (active) {
          setReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setReady(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return ready;
}
