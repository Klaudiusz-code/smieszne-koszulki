/**
 * Odpowiedzialność komponentu:
 * - osadza mapę automatów paczkowych bezpośrednio w procesie zamówienia,
 * - przekazuje wybrany punkt dostawy do checkoutu,
 * - pokazuje dane aktualnie wybranego paczkomatu.
 */
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MapPinIcon } from "@/components/icons/MapPinIcon";
import {
  refreshEasyPackMap,
  renderEasyPackMap,
  useEasyPackWidget,
} from "./easyPackModal";

export interface ParcelLockerSelection {
  name: string;
  address: string;
}

export function ParcelLockerMap({
  value,
  onChange,
}: {
  value: ParcelLockerSelection | null;
  onChange: (locker: ParcelLockerSelection) => void;
}) {
  const ready = useEasyPackWidget();
  const reactId = useId();
  const mapId = `easypack-map-${reactId.replace(/:/g, "")}`;
  const rendered = useRef(false);
  const [mapExpanded, setMapExpanded] = useState(!value);

  useEffect(() => {
    if (!ready || !mapExpanded) {
      return;
    }

    if (!rendered.current) {
      rendered.current = renderEasyPackMap(mapId, (point) => {
        onChange({
          name: point.name,
          address: [point.address.line1, point.address.line2].filter(Boolean).join(", "),
        });
        setMapExpanded(false);
      });
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      refreshEasyPackMap();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [mapExpanded, mapId, onChange, ready]);

  return (
    <div className="space-y-3">
      {value && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-[#C4AFA8] bg-[#F8F3EF] p-3.5">
          <div className="flex min-w-0 items-start gap-2.5">
            <MapPinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#171717]/55" />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#171717]/45">
                Wybrany paczkomat
              </p>
              <p className="mt-1 text-sm font-semibold text-[#171717]">{value.name}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#171717]/60">
                {value.address}
              </p>
            </div>
          </div>
          {!mapExpanded && (
            <button
              type="button"
              onClick={() => setMapExpanded(true)}
              className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-[#171717]/55 transition-colors hover:bg-white hover:text-[#171717]"
            >
              Zmień
            </button>
          )}
        </div>
      )}

      <div
        className={`parcel-locker-map-frame relative h-[65vh] min-h-[360px] max-h-[560px] overflow-hidden rounded-xl border border-[#e7e5e4] bg-white shadow-[0_10px_30px_rgba(23,23,23,0.05)] ${
          mapExpanded ? "" : "hidden"
        }`}
      >
        <div id={mapId} className="h-full w-full" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FAF7F5] text-sm text-[#171717]/45">
            Ładowanie mapy…
          </div>
        )}
      </div>

      {mapExpanded && (
        <p className="text-xs leading-5 text-[#171717]/45">
          Znajdź punkt na mapie i użyj przycisku wyboru w jego szczegółach.
        </p>
      )}
    </div>
  );
}
