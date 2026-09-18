/** Renderuje stylizowane pole wyboru zachowujące natywne zachowanie formularza. */
"use client";

import { useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { useDismissibleLayer } from "@/hooks/useDismissibleLayer";

export interface SelectOption {
  value: string;
  label: string;
}

export function CustomSelect({
  value,
  options,
  onChange,
  size = "md",
  align = "left",
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  size?: "sm" | "md";
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLabel = options.find((o) => o.value === value)?.label ?? "";

  useDismissibleLayer({
    ref,
    enabled: open,
    onDismiss: () => setOpen(false),
  });

  const height = size === "sm" ? "h-9" : "h-11";
  const textSize = size === "sm" ? "text-[14px]" : "text-[15px]";
  const dropdownAlign = align === "right" ? "right-0" : "left-0";

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${height} ${textSize} flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-white pl-4 pr-3 font-medium text-cd-brown hover:bg-[#fafaf9] transition-colors`}
      >
        {currentLabel}
        <ChevronDownIcon className={`h-[15px] w-[15px] shrink-0 text-cd-brown/40 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className={`absolute ${dropdownAlign} top-full z-20 mt-1 min-w-full overflow-hidden rounded-lg border border-[#e7e5e4] bg-white shadow-md`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block w-full whitespace-nowrap px-4 py-2 text-left text-[14px] transition-colors ${
                option.value === value
                  ? "bg-[#171717] font-medium text-white"
                  : "text-cd-brown hover:bg-[#fafaf9]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
