"use client";

/**
 * Botón flotante de la página pública de la factura (la que abre el cliente
 * desde el correo). El dashboard no lo usa: allí se imprime desde un iframe
 * oculto, ver InvoicePrintButton.
 *
 * Las reglas `@media print` no viven aquí sino en la página, porque el iframe
 * imprime sin montar este botón y aun así necesita el fondo negro.
 */
export default function PrintTrigger() {
  return (
    <div className="invoice-actions">
      <button type="button" onClick={() => window.print()} style={btn}>
        Descargar PDF
      </button>
    </div>
  );
}

const btn: React.CSSProperties = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 10,
  background: "#00e5a0",
  color: "#000",
  border: "none",
  borderRadius: 8,
  padding: "10px 18px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};
