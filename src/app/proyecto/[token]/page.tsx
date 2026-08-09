import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import { fmtDateTime } from "@/lib/format";
import { dueBadge, dueState } from "@/lib/delivery";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Client,
  KanbanCard,
  KanbanColumn,
  TeamMember,
} from "@/lib/supabase/types";

const PRIORITY_LABEL: Record<string, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

const PRIORITY_COLOR: Record<string, string> = {
  alta: "#ff8080",
  media: "#e6b800",
  baja: "#5aa9ff",
};

/**
 * Ordena las tarjetas dentro de una fase para la vista del cliente.
 *
 * TODO(josue): define el criterio. Las tarjetas llegan ya ordenadas por
 * `sort_order` (el orden interno del equipo). Decide si las que esperan al
 * cliente (`assigned_to_client`) suben al principio de su fase o si el orden
 * del tablero se respeta tal cual y el resaltado visual basta.
 */
function sortCardsForClient(cards: KanbanCard[]): KanbanCard[] {
  return cards;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("clients")
    .select("name")
    .eq("public_token", token)
    .maybeSingle();

  const name = (data as Pick<Client, "name"> | null)?.name;
  return { title: name ? `Proyecto · ${name}` : "Proyecto" };
}

export default async function PublicKanbanPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name")
    .eq("public_token", token)
    .maybeSingle();

  if (!client) notFound();

  const [{ data: columns }, { data: cards }, { data: team }] =
    await Promise.all([
      supabase
        .from("kanban_columns")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("kanban_cards")
        .select("*")
        .eq("client_id", (client as Pick<Client, "id" | "name">).id)
        .order("sort_order", { ascending: true }),
      supabase.from("team_members").select("*"),
    ]);

  const cols = (columns as KanbanColumn[]) ?? [];
  const allCards = (cards as KanbanCard[]) ?? [];
  const members = (team as TeamMember[]) ?? [];

  // Cada columna del tablero es una fase del roadmap: ya vienen ordenadas por
  // `sort_order` y marcadas con `is_done`, así que no hace falta nada nuevo en
  // la base para contar avance.
  const phases = cols.map((col) => ({
    col,
    cards: sortCardsForClient(allCards.filter((c) => c.column_id === col.id)),
  }));
  const done = allCards.filter((c) => c.completed_at).length;
  // La fase actual es la primera sin terminar que tenga trabajo dentro.
  const currentId = phases.find((p) => !p.col.is_done && p.cards.length)?.col.id;

  return (
    <div style={styles.page}>
      <Header dark minimal />
      <header style={styles.intro}>
        <span style={styles.introLabel}>Proyecto de</span>
        <h1 style={styles.introTitle}>
          {(client as Pick<Client, "id" | "name">).name}
        </h1>
        <div style={styles.progressRow}>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: allCards.length
                  ? `${(done / allCards.length) * 100}%`
                  : 0,
              }}
            />
          </div>
          <span style={styles.progressText}>
            {done} de {allCards.length} completadas
          </span>
        </div>
      </header>
      <div style={styles.roadmap}>
        {phases.map(({ col, cards: phaseCards }, i) => {
          const isCurrent = col.id === currentId;
          return (
            <section key={col.id} style={styles.phase}>
              <div style={styles.phaseHeader}>
                <span
                  style={{
                    ...styles.phaseDot,
                    ...(col.is_done ? styles.phaseDotDone : null),
                    ...(isCurrent ? styles.phaseDotCurrent : null),
                  }}
                />
                <span style={styles.phaseIndex}>Fase {i + 1}</span>
                <h2 style={styles.phaseTitle}>{col.title}</h2>
                {isCurrent && <span style={styles.currentTag}>En curso</span>}
                <span style={styles.count}>{phaseCards.length}</span>
              </div>
              <div style={styles.phaseBody}>
                {phaseCards.length === 0 && (
                  <p style={styles.empty}>Nada por aquí todavía</p>
                )}
                {phaseCards.map((card) => (
                  <Card key={card.id} card={card} members={members} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Card({ card, members }: { card: KanbanCard; members: TeamMember[] }) {
  const accent = card.priority
    ? (PRIORITY_COLOR[card.priority] ?? "#555")
    : "#555";
  const assignee = members.find((m) => m.id === card.assignee_id);
  const waitingOnClient = card.assigned_to_client;
  // El estado de plazo se calcula con la zona del negocio, así que sale igual
  // aquí (Server Component en UTC) que en el dashboard del equipo.
  const dueInfo = dueBadge(
    dueState(card.due_date, card.completed_at),
    card.due_date,
  );

  return (
    <div
      style={{
        ...styles.card,
        ...(waitingOnClient ? styles.cardWaitingClient : null),
      }}
    >
      {waitingOnClient && (
        <span style={styles.waitingTag}>Pendiente de ti</span>
      )}
      <span style={styles.cardTitle}>
        <span aria-hidden style={styles.cardMark}>
          {card.completed_at ? "✓" : "○"}
        </span>
        {card.title}
      </span>
      {card.image_url && (
        // Se enlaza al original para que el cliente pueda ampliarla.
        <a href={card.image_url} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.image_url}
            alt={`Referencia de: ${card.title}`}
            style={styles.cardImage}
          />
        </a>
      )}
      {card.description && <p style={styles.cardDesc}>{card.description}</p>}
      {card.created_at && (
        <span style={styles.createdAt}>
          Creada el {fmtDateTime(card.created_at)}
        </span>
      )}
      <div style={styles.cardMeta}>
        {dueInfo && (
          <span
            style={{
              ...styles.dueBadge,
              color: dueInfo.color,
              borderColor: dueInfo.color,
            }}
          >
            {dueInfo.label}
          </span>
        )}
        {card.priority && (
          <span
            style={{ ...styles.priority, color: accent, borderColor: accent }}
          >
            {PRIORITY_LABEL[card.priority] ?? card.priority}
          </span>
        )}
        {!waitingOnClient && assignee && (
          <span style={styles.assignee} title={assignee.name}>
            {assignee.name}
          </span>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#fff",
    padding: "120px 24px 40px",
  },
  intro: {
    maxWidth: 1200,
    margin: "0 auto 24px",
  },
  introLabel: {
    display: "block",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#777",
  },
  introTitle: {
    margin: "6px 0 0",
    fontSize: 28,
    fontWeight: 600,
    letterSpacing: -0.5,
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    background: "#1e1e1e",
    borderRadius: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#5aa9ff",
    borderRadius: 20,
  },
  progressText: {
    fontSize: 11,
    color: "#888",
    whiteSpace: "nowrap",
  },
  roadmap: {
    maxWidth: 720,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
  },
  phase: {
    // Sin `gap`: la separación vive en el padding inferior para que el borde
    // izquierdo salga como una línea continua y no troceada por fase.
    // `paddingTop: 0` anula el `section { padding-top: var(--section-pad-y) }`
    // global de globals.css, pensado para las secciones de la web pública.
    borderLeft: "1px solid #1e1e1e",
    paddingLeft: 20,
    paddingTop: 0,
    paddingBottom: 18,
  },
  phaseHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  phaseDot: {
    // Se monta sobre la línea del borde izquierdo (padding 20 + mitad del punto).
    marginLeft: -27,
    flex: "0 0 auto",
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#2a2a2a",
    border: "2px solid #0a0a0a",
    boxSizing: "content-box",
  },
  phaseDotDone: { background: "#5aa9ff" },
  phaseDotCurrent: { background: "#e6b800" },
  phaseIndex: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#777",
  },
  phaseTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    // Los h2 globales son display (uppercase, tracking -2px): ilegible a 16px.
    textTransform: "none",
    letterSpacing: -0.2,
  },
  currentTag: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#0a0a0a",
    background: "#e6b800",
    borderRadius: 5,
    padding: "2px 7px",
  },
  count: {
    fontSize: 12,
    color: "#888",
    background: "#1e1e1e",
    borderRadius: 20,
    padding: "2px 9px",
    marginLeft: "auto",
  },
  phaseBody: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  empty: {
    color: "#555",
    fontSize: 12,
    margin: 0,
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 10,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  cardWaitingClient: {
    borderColor: "#7a5c1a",
    background: "#1d1a12",
  },
  waitingTag: {
    alignSelf: "flex-start",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#0a0a0a",
    background: "#e6b800",
    borderRadius: 5,
    padding: "2px 7px",
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: 14,
    display: "flex",
    alignItems: "baseline",
    gap: 8,
  },
  cardMark: { color: "#5aa9ff", fontSize: 12 },
  cardDesc: { color: "#999", fontSize: 12, margin: 0, lineHeight: 1.4 },
  createdAt: { fontSize: 10, color: "#666", letterSpacing: 0.3 },
  cardImage: {
    width: "100%",
    maxHeight: 160,
    objectFit: "cover",
    borderRadius: 6,
    display: "block",
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  dueBadge: {
    fontSize: 10,
    letterSpacing: 0.3,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
    padding: "2px 8px",
    whiteSpace: "nowrap",
  },
  priority: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
    padding: "2px 8px",
  },
  assignee: {
    fontSize: 12,
    color: "#bbb",
    marginLeft: "auto",
  },
};
