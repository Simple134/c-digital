import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
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

export default async function PublicKanbanPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
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
        .eq("client_id", (client as Client).id)
        .order("sort_order", { ascending: true }),
      supabase.from("team_members").select("*"),
    ]);

  const cols = (columns as KanbanColumn[]) ?? [];
  const allCards = (cards as KanbanCard[]) ?? [];
  const members = (team as TeamMember[]) ?? [];

  return (
    <div style={styles.page}>
      <Header dark minimal />
      <div style={styles.board}>
        {cols.map((col) => {
          const colCards = allCards.filter((c) => c.column_id === col.id);
          return (
            <div key={col.id} style={styles.column}>
              <div style={styles.columnHeader}>
                <span>{col.title}</span>
                <span style={styles.count}>{colCards.length}</span>
              </div>
              <div style={styles.columnBody}>
                {colCards.length === 0 && (
                  <p style={styles.empty}>Sin tarjetas</p>
                )}
                {colCards.map((card) => (
                  <Card key={card.id} card={card} members={members} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({
  card,
  members,
}: {
  card: KanbanCard;
  members: TeamMember[];
}) {
  const accent = card.priority
    ? (PRIORITY_COLOR[card.priority] ?? "#555")
    : "#555";
  const assignee = members.find((m) => m.id === card.assignee_id);

  return (
    <div style={styles.card}>
      <span style={styles.cardTitle}>{card.title}</span>
      {card.description && (
        <p style={styles.cardDesc}>{card.description}</p>
      )}
      <div style={styles.cardMeta}>
        {card.priority && (
          <span
            style={{ ...styles.priority, color: accent, borderColor: accent }}
          >
            {PRIORITY_LABEL[card.priority] ?? card.priority}
          </span>
        )}
        {assignee && (
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
  board: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    gap: 16,
    overflowX: "auto",
    paddingBottom: 12,
  },
  column: {
    background: "#121212",
    border: "1px solid #1e1e1e",
    borderRadius: 12,
    minWidth: 280,
    flex: "0 0 280px",
    display: "flex",
    flexDirection: "column",
  },
  columnHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 600,
    borderBottom: "1px solid #1e1e1e",
  },
  count: {
    fontSize: 12,
    color: "#888",
    background: "#1e1e1e",
    borderRadius: 20,
    padding: "2px 9px",
  },
  columnBody: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 12,
  },
  empty: {
    color: "#555",
    fontSize: 12,
    textAlign: "center",
    padding: "12px 0",
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
  cardTitle: { fontWeight: 600, fontSize: 14 },
  cardDesc: { color: "#999", fontSize: 12, margin: 0, lineHeight: 1.4 },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
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
