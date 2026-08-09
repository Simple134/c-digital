"use client";

import { useEffect, useState } from "react";

/**
 * `true` cuando la ventana es de teléfono. Los estilos del panel son objetos JS
 * inline, así que las media queries de CSS no aplican: hay que decidir la
 * variante en JS.
 *
 * Arranca en `false` para que el HTML del servidor y el del primer render del
 * cliente coincidan (la vista de escritorio es la neutra); el valor real llega
 * en el efecto, ya en el navegador.
 */
export default function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [breakpoint]);

  return isMobile;
}
