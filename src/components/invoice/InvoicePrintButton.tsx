"use client";

import { useCallback, useState } from "react";

/**
 * "Ver factura": abre el diálogo de impresión nativo del navegador sin salir
 * del dashboard.
 *
 * La factura se carga en un iframe oculto y se imprime desde ahí. El diálogo de
 * Chrome ya es las tres cosas que hacen falta —vista previa, "Guardar como PDF"
 * e imprimir—, así que abrir una pestaña intermedia solo añadía un clic y
 * mostraba el sitio público alrededor del documento.
 *
 * El iframe es same-origin, así que `contentWindow.print()` está permitido; con
 * un dominio distinto el navegador lo bloquearía.
 */
export default function InvoicePrintButton({
  token,
  style,
  children = "Ver factura",
}: {
  token: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  const open = useCallback(() => {
    if (loading) return;
    setLoading(true);

    const frame = document.createElement("iframe");
    // `visibility: hidden` en vez de `display: none`: un iframe sin caja no
    // llega a maquetar su contenido y saldría una hoja en blanco.
    frame.setAttribute(
      "style",
      "position:fixed;right:0;bottom:0;width:820px;height:1160px;border:0;visibility:hidden;",
    );
    // `bare=1` quita el botón flotante de la página pública: aquí sobra.
    frame.src = `/factura/${token}?bare=1`;

    // `loading` cubre solo la carga del documento, no el diálogo. `print()`
    // bloquea el hilo de JavaScript mientras el diálogo está abierto: cualquier
    // intento de apagar el estado después de llamarlo se queda congelado hasta
    // que el usuario lo cierra, y `afterprint` no llega en todos los
    // navegadores cuando se cancela. El botón quedaba en "Preparando…" para
    // siempre.
    const discard = () => window.setTimeout(() => frame.remove(), 1000);

    frame.onload = () => {
      const win = frame.contentWindow;
      setLoading(false);
      if (!win) return discard();

      // Un tick para que React pinte el botón ya restaurado antes de que el
      // diálogo congele el hilo.
      window.setTimeout(() => {
        // Sin `focus()` Safari imprime la ventana padre en vez del iframe.
        win.focus();
        win.addEventListener("afterprint", discard, { once: true });
        win.print();
        // Red de seguridad por si `afterprint` nunca llega: el iframe no debe
        // quedarse acumulándose en el DOM.
        window.setTimeout(discard, 60_000);
      }, 0);
    };

    frame.onerror = () => {
      setLoading(false);
      discard();
    };
    document.body.appendChild(frame);
  }, [token, loading]);

  return (
    <button type="button" onClick={open} disabled={loading} style={style}>
      {loading ? "Preparando…" : children}
    </button>
  );
}
