"use client";

import type { RefObject } from "react";
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";

export function SiteHeader({
  siteHeaderRef,
}: {
  pathname: string;
  siteHeaderRef: RefObject<HTMLElement | null>;
  isDesktopCompactHeaderVisible: boolean;
}) {
  return (
    <>
      <TopBar />
      <header ref={siteHeaderRef} className="sticky top-0 z-50 pt-4">
        <Navbar />
      </header>
    </>
  );
}
