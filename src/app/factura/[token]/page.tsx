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
    <main
      style={{ background: "#0a0a0a", minHeight: "100vh", overflowX: "hidden" }}
    >
      {/* Va en la página y no en el botón: el iframe imprime sin montarlo. */}
      <style>{`
        .invoice-sheet {
          width: 100%;
        }

        @media (max-width: 640px) {
          .invoice-sheet {
            padding: 32px 20px 40px !important;
            max-width: none !important;
            overflow-wrap: anywhere !important;
          }

          .invoice-top {
            display: block !important;
          }

          .invoice-status {
            text-align: left !important;
            margin-top: 32px !important;
          }

          .invoice-sheet h1 {
            margin: 36px 0 28px !important;
            font-size: 26px !important;
            line-height: 1.1 !important;
          }

          .invoice-status-line,
          .invoice-total {
            font-size: 24px !important;
            line-height: 1.15 !important;
          }

          .invoice-totals,
          .invoice-balance {
            text-align: left !important;
          }

          .invoice-items-head,
          .invoice-pay-head {
            display: none !important;
          }

          .invoice-items-row,
          .invoice-pay-row {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            margin-top: 12px !important;
          }

          .invoice-items-row span,
          .invoice-pay-row span {
            display: block !important;
            min-width: 0 !important;
            text-align: left !important;
            overflow-wrap: anywhere !important;
          }

          .invoice-items-row span::before,
          .invoice-pay-row span::before {
            content: attr(data-label);
            display: block;
            color: #888;
            font-size: 12px;
            text-align: left;
            margin-bottom: 2px;
          }

          .invoice-footer {
            margin-top: 52px !important;
          }

          .invoice-logo {
            font-size: 44px !important;
            line-height: 1 !important;
          }

          .invoice-actions button {
            left: 20px !important;
            right: 20px !important;
            width: calc(100vw - 40px) !important;
          }
        }

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
