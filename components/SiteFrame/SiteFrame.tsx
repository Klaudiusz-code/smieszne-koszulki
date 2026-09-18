/**
 * Łączy serwerową zawartość strony z klienckim nagłówkiem i obsługą bieżącej trasy.
 */
"use client";

import {
  Suspense,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader/SiteHeader";
import { useDesktopCompactHeader } from "./useDesktopCompactHeader";
import { useSessionStorageItem } from "./useSessionStorageItem";

function ReturnPathRecorder({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const currentPath = search ? `${pathname}?${search}` : pathname;

  useSessionStorageItem(
    "wptest:return-to",
    currentPath,
    !pathname.startsWith("/konto"),
  );

  return null;
}

export function SiteFrame({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const {
    headerRef: siteHeaderRef,
    isVisible: isDesktopCompactHeaderVisible,
  } = useDesktopCompactHeader(pathname);
  const stickyOffsetStyle = {
    "--cd-desktop-compact-header-offset": isDesktopCompactHeaderVisible
      ? "70px"
      : "0px",
  } as CSSProperties;
  const ownsPageLayout =
    pathname === "/" ||
    pathname === "/produkty" ||
    pathname === "/sklep" ||
    pathname === "/kontakt" ||
    pathname === "/koszyk" ||
    pathname === "/wlasny-nadruk" ||
    pathname.startsWith("/kategoria/") ||
    pathname.startsWith("/produkt/") ||
    pathname.startsWith("/zamowienie");

  if (pathname === "/resetuj-haslo") {
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={null}>
        <ReturnPathRecorder pathname={pathname} />
      </Suspense>

      <SiteHeader
        pathname={pathname}
        siteHeaderRef={siteHeaderRef}
        isDesktopCompactHeaderVisible={isDesktopCompactHeaderVisible}
      />

      <main
        className={
          ownsPageLayout
            ? "w-full flex-1"
            : "mx-auto w-full max-w-7xl flex-1 px-6 py-12"
        }
        style={stickyOffsetStyle}
      >
        {children}
      </main>

      {footer}
    </>
  );
}
