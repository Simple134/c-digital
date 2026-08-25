import { redirect } from "next/navigation";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTeamMember } from "@/lib/supabase/guards";
import type {
  Client,
  ClientFile,
  Invoice,
  InvoiceItem,
  InvoicePayment,
  InvoiceReceipt,
  KanbanCard,
  KanbanColumn,
  MeetingRequest,
  Project,
} from "@/lib/supabase/types";
import Panel, { type PanelFile, type PanelReceipt } from "./Panel";

export const metadata = { title: "Panel de cliente" };

// Las URLs firmadas caducan: la página no puede servirse desde caché estática.
export const dynamic = "force-dynamic";

/** Vigencia de las URLs firmadas de archivos y comprobantes. */
const SIGNED_URL_TTL = 60 * 60;

/**
 * Panel del cliente: /panel
 *
 * Protegido por sesión de Supabase (mismo guard que /dashboard). El usuario
 * autenticado se vincula a su fila de `clients` vía `auth_user_id`, sellada en
 * el registro (/panel/registro). Los datos se leen con el service role: el
 * vínculo sesión→cliente ya se validó aquí, igual que en /proyecto/[token].
 */
export default async function ClientPanelPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: clientRow } = await admin
    .from("clients")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // Sesión válida pero sin cliente vinculado: si es del equipo va a su
  // dashboard; si no, se le informa (redirigir a /login con sesión
  // activa crearía un loop con el middleware).
  if (!clientRow) {
    if (await isTeamMember()) redirect("/dashboard");
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "#999",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontSize: 14,
          textAlign: "center",
        }}
      >
        Tu cuenta no está vinculada a ningún cliente. Escríbenos para activarla.
      </main>
    );
  }
  const client = clientRow as Client;

  const [
    { data: columns },
    { data: cards },
    { data: invoices },
    { data: projects },
    { data: files },
    { data: meetings },
  ] = await Promise.all([
    admin
      .from("kanban_columns")
      .select("*")
      .order("sort_order", { ascending: true }),
    admin
      .from("kanban_cards")
      .select("*")
      .eq("client_id", client.id)
      .order("sort_order", { ascending: true }),
    admin
      .from("invoices")
      .select("*")
      .eq("client_id", client.id)
      .order("issued_at", { ascending: false }),
    admin
      .from("projects")
      .select("*")
      .eq("client_id", client.id)
      .order("sort_order", { ascending: true }),
    admin
      .from("client_files")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    admin
      .from("meeting_requests")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
  ]);

  const invoiceRows = (invoices as Invoice[]) ?? [];
  const invoiceIds = invoiceRows.map((i) => i.id);

  // Ítems, abonos y comprobantes de todas sus facturas: queries planas, no N+1.
  const [{ data: items }, { data: payments }, { data: receipts }] =
    invoiceIds.length
      ? await Promise.all([
          admin.from("invoice_items").select("*").in("invoice_id", invoiceIds),
          admin
            .from("invoice_payments")
            .select("*")
            .in("invoice_id", invoiceIds),
          admin
            .from("invoice_receipts")
            .select("*")
            .in("invoice_id", invoiceIds)
            .order("created_at", { ascending: false }),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }];

  // URLs firmadas para los buckets privados, resueltas aquí y no en el
  // cliente: el navegador nunca toca el service role.
  const fileRows = (files as ClientFile[]) ?? [];
  const receiptRows = (receipts as InvoiceReceipt[]) ?? [];

  const filePaths = fileRows
    .map((f) => f.file_path)
    .filter(Boolean) as string[];
  const receiptPaths = receiptRows.map((r) => r.file_path);

  const [signedFiles, signedReceipts] = await Promise.all([
    filePaths.length
      ? admin.storage
          .from("client-files")
          .createSignedUrls(filePaths, SIGNED_URL_TTL)
      : Promise.resolve({ data: [] }),
    receiptPaths.length
      ? admin.storage
          .from("payment-receipts")
          .createSignedUrls(receiptPaths, SIGNED_URL_TTL)
      : Promise.resolve({ data: [] }),
  ]);

  const signedByPath = new Map(
    [...(signedFiles.data ?? []), ...(signedReceipts.data ?? [])].map((s) => [
      s.path,
      s.signedUrl,
    ]),
  );

  const panelFiles: PanelFile[] = fileRows.map((f) => ({
    ...f,
    signedUrl: f.file_path ? (signedByPath.get(f.file_path) ?? null) : null,
  }));
  const panelReceipts: PanelReceipt[] = receiptRows.map((r) => ({
    ...r,
    signedUrl: signedByPath.get(r.file_path) ?? null,
  }));

  return (
    <Panel
      client={client}
      projects={(projects as Project[]) ?? []}
      columns={(columns as KanbanColumn[]) ?? []}
      cards={(cards as KanbanCard[]) ?? []}
      invoices={invoiceRows}
      items={(items as InvoiceItem[]) ?? []}
      payments={(payments as InvoicePayment[]) ?? []}
      files={panelFiles}
      receipts={panelReceipts}
      meetings={(meetings as MeetingRequest[]) ?? []}
    />
  );
}
