/** Informuje, czy bieżąca szerokość okna jest mniejsza od podanego progu. */
import { useEffect, useState } from "react";

export function useWindowIsBelow(width: number) {
  const [matches, setMatches] = useState(true);

  useEffect(() => {
    const check = () => setMatches(window.innerWidth < width);

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, [width]);

  return matches;
}
