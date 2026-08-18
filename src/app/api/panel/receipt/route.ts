import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPanelClient } from "@/lib/supabase/guards";

// Comprobantes razonables: fotos y PDF. 10 MB cubre cualquier volante real.
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
]);

/**
 * El cliente sube un volante/comprobante de pago sobre una de sus facturas.
 * El archivo va al bucket privado `payment-receipts`; se sirve con URL firmada.
 */
export async function POST(request: NextRequest) {
  const client = await getPanelClient();
  if (!client) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const invoiceId = String(form.get("invoiceId") ?? "");
  const note = String(form.get("note") ?? "").trim() || null;
  const file = form.get("file");

  if (!invoiceId || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Faltan la factura o el archivo." },
      { status: 400 },
    );
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "El archivo debe pesar entre 1 byte y 10 MB." },
      { status: 400 },
    );
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Solo se aceptan PDF o imágenes (JPG, PNG, WEBP, HEIC)." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // La factura tiene que ser suya: el id viene del navegador.
  const { data: invoice } = await admin
    .from("invoices")
    .select("id")
    .eq("id", invoiceId)
    .eq("client_id", client.id)
    .maybeSingle();
  if (!invoice) {
    return NextResponse.json(
      { error: "Factura no encontrada." },
      { status: 404 },
    );
  }

  const ext = (file.name.split(".").pop() || "bin").toLowerCase().slice(0, 8);
  const path = `${client.id}/${invoiceId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("payment-receipts")
    .upload(path, await file.arrayBuffer(), { contentType: file.type });

  if (uploadError) {
    console.error("[panel/receipt] Error al subir:", uploadError);
    return NextResponse.json(
      { error: "No se pudo subir el archivo." },
      { status: 500 },
    );
  }

  const { error: insertError } = await admin.from("invoice_receipts").insert({
    invoice_id: invoiceId,
    client_id: client.id,
    file_path: path,
    note,
  });

  if (insertError) {
    // Sin la fila el archivo quedaría huérfano e invisible: se limpia.
    await admin.storage.from("payment-receipts").remove([path]);
    console.error("[panel/receipt] Error al registrar:", insertError);
    return NextResponse.json(
      { error: "No se pudo registrar el comprobante." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
