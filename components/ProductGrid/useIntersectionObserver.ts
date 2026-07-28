/** Obserwuje widoczność elementu i zwraca informację o jego przecięciu z viewportem. */
import { useEffect, useRef, type RefObject } from "react";

export function useIntersectionObserver<T extends Element>(
  ref: RefObject<T | null>,
  enabled: boolean,
  onIntersect: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit,
) {
  const onIntersectRef = useRef(onIntersect);
  const root = options?.root ?? null;
  const rootMargin = options?.rootMargin;
  const threshold = options?.threshold;

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => onIntersectRef.current(entry),
      { root, rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, ref, root, rootMargin, threshold]);
}
