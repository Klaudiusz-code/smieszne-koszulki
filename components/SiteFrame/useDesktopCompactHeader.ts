/** Wyznacza zwarty wariant nagłówka desktopowego na podstawie ścieżki i przewijania strony. */
import { useEffect, useRef, useState } from "react";

export function useDesktopCompactHeader(pathname: string) {
  const headerRef = useRef<HTMLElement | null>(null);
  const isScrollingUpRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    function updateVisibility() {
      frame = 0;
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollYRef.current;

      if (Math.abs(scrollDelta) > 4) {
        isScrollingUpRef.current = scrollDelta < 0;
        lastScrollYRef.current = currentScrollY;
      }

      const headerBottom = headerRef.current?.getBoundingClientRect().bottom ?? 0;
      const shouldShow = window.innerWidth >= 1024 && headerBottom <= 0 && isScrollingUpRef.current;

      setIsVisible((current) => (current === shouldShow ? current : shouldShow));
    }

    function scheduleUpdate() {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(updateVisibility);
    }

    lastScrollYRef.current = window.scrollY;
    isScrollingUpRef.current = false;

    const initialTimer = window.setTimeout(updateVisibility, 0);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.clearTimeout(initialTimer);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [pathname]);

  return { headerRef, isVisible };
}
