/** Odczytuje parametry listingu i aktualizuje je przez nawigację bez przeładowania strony. */
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useListingParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function pushParams(params: URLSearchParams) {
    params.delete("after");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    pushParams(params);
  }

  return { pushParams, searchParams, updateParam };
}
