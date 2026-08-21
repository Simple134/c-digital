import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { accessCookieName, hasValidAccess } from "@/lib/proposals";
import type { Proposal } from "@/lib/supabase/types";
import PasswordGate from "./PasswordGate";

/**
 * Link público de una propuesta: /propuestas/{cliente}/{propuesta}. Sin la
 * cookie de acceso muestra el formulario de contraseña; con ella, la propuesta
 * en un iframe sandboxeado (el HTML lo sirve /api/proposals/view/[id]).
 */

export const dynamic = "force-dynamic";

async function getProposal(cliente: string, propuesta: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("proposals")
    .select("id, title, client_slug, slug, password_hash, is_active, file_path")
    .eq("client_slug", cliente)
    .eq("slug", propuesta)
    .maybeSingle();
  const p = data as Pick<
    Proposal,
    | "id"
    | "title"
    | "client_slug"
    | "slug"
    | "password_hash"
    | "is_active"
    | "file_path"
  > | null;
  return p && p.is_active ? p : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cliente: string; propuesta: string }>;
}) {
  const { cliente, propuesta } = await params;
  const p = await getProposal(cliente, propuesta);
  return {
    title: p ? p.title : "Propuesta",
    robots: { index: false, follow: false },
  };
}

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ cliente: string; propuesta: string }>;
}) {
  const { cliente, propuesta } = await params;
  const p = await getProposal(cliente, propuesta);
  if (!p) notFound();

  const cookieStore = await cookies();
  const cookie = cookieStore.get(accessCookieName(p.id))?.value;
  const unlocked = hasValidAccess(cookie, p.id, p.password_hash);

  if (!unlocked) {
    return <PasswordGate proposalId={p.id} title={p.title} />;
  }

  // El HTML se descarga aquí en el servidor (donde la cookie ya fue validada)
  // y se inyecta con srcDoc: un iframe sandboxeado sin allow-same-origin corre
  // con origen opaco y el navegador no enviaría la cookie a /api/proposals/view.
  const admin = createAdminClient();
  const { data: file, error } = await admin.storage
    .from("proposals")
    .download(p.file_path);
  if (error || !file) {
    console.error("[proposals] Error al descargar:", error);
    return (
      <p style={{ padding: "2rem", color: "#fff" }}>
        Error al cargar la propuesta.
      </p>
    );
  }
  const html = await file.text();

  return (
    <iframe
      srcDoc={html}
      title={p.title}
      // Sin allow-same-origin: el HTML subido corre aislado y no puede leer
      // cookies ni storage del sitio. allow-popups-to-escape-sandbox: los links
      // externos (ej. WhatsApp) abren en una pestaña sin sandbox — sitios como
      // api.whatsapp.com rechazan cargarse en contextos sandboxeados.
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        background: "#0a0a0a",
      }}
    />
  );
}
