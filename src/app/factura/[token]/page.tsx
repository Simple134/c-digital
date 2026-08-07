import { notFound } from "next/navigation";
import InvoiceDoc from "@/components/invoice/InvoiceDoc";
import PrintTrigger from "@/components/invoice/PrintTrigger";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Invoice,
  InvoiceItem,
  InvoicePayment,
} from "@/lib/supabase/types";

/**
 * Factura pública: /factura/[public_token]
 *
 * Se resuelve con la service role key igual que /proyecto/[token]. Las
 * políticas RLS de `invoices` no dan lectura a anon a propósito —los montos
 * facturados no son datos públicos—, así que el token opaco de 32 hex es lo
 * único que abre la puerta, y solo a esta factura.
 */

// El estado de la factura cambia con cada abono: no cachear.
export const dynamic = "force-dynamic";

async function loadInvoice(token: string) {
  const supabase = createAdminClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("public_token", token)
    .maybeSingle();

  if (!invoice) return null;

  const [items, payments] = await Promise.all([
    supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoice.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("invoice_payments")
      .select("*")
      .eq("invoice_id", invoice.id)
      .order("paid_at", { ascending: true }),
  ]);

  return {
    invoice: invoice as Invoice,
    items: (items.data as InvoiceItem[]) ?? [],
    payments: (payments.data as InvoicePayment[]) ?? [],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await loadInvoice(token);
  return {
    title: data ? `Factura #${data.invoice.number} · C Digital` : "Factura",
    robots: { index: false, follow: false },
  };
}

export default async function FacturaPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ bare?: string }>;
}) {
  const { token } = await params;
  // `bare=1`: el dashboard carga esta página en un iframe oculto solo para
  // imprimirla, así que el botón flotante sobra.
  const { bare } = await searchParams;
  const data = await loadInvoice(token);
  if (!data) notFound();

  return (
    <main style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      {/* Va en la página y no en el botón: el iframe imprime sin montarlo. */}
      <style>{`
        @media print {
          .invoice-actions { display: none !important; }
          @page { margin: 0; }
          html, body { background: #0a0a0a !important; }
          /* Sin esto Chrome descarta los fondos y sale la hoja en blanco. */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      {bare !== "1" && <PrintTrigger />}
      <InvoiceDoc {...data} />
    </main>
  );
}
