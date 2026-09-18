/** Uruchamia przekazany efekt po zmianie ścieżki, pomijając pierwsze renderowanie. */
import { useEffect, useRef } from "react";

export function usePathChangeEffect(pathname: string, onPathChange: () => void) {
  const onPathChangeRef = useRef(onPathChange);

  useEffect(() => {
    onPathChangeRef.current = onPathChange;
  }, [onPathChange]);

  useEffect(() => {
    onPathChangeRef.current();
  }, [pathname]);
}
