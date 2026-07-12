// Tipos de las tablas editables del CMS.

export interface Plan {
  id: string;
  name: string;
  slug: string;
  usd: string | null;
  period: string | null;
  dop: string | null;
  featured: boolean;
  features: string[];
  team: string | null;
  plan_limit: string | null;
  sort_order: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string | null;
  href: string | null;
  img: string | null;
  cls: string | null;
  sort_order: number;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  img: string | null;
  post_date: string | null;
  read_time: string | null;
  published: boolean;
  sort_order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo: string | null;
  sort_order: number;
}

export interface Brand {
  id: string;
  name: string;
  image: string;
  sort_order: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  sort_order: number;
}

export interface KanbanCard {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: string | null;
  assignee_id: string | null;
  sort_order: number;
}

export type AuditLevel = "green" | "yellow" | "red";

export interface FormSubmissionAnswer {
  level: AuditLevel;
  text: string;
}

export type FormSubmissionStatus =
  "nuevo" | "contactado" | "en_seguimiento" | "cerrado" | "descartado";

// Registro de una persona que completó la Auditoría Digital (/form).
export interface FormSubmission {
  id: string;
  name: string;
  business: string;
  phone: string | null;
  email: string;
  sector: string | null;
  selected_areas: string[];
  answers: Record<string, Record<string, FormSubmissionAnswer>>;
  notes: Record<string, string>;
  priorities: string[];
  scores: Record<string, AuditLevel>;
  status: FormSubmissionStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Estados de seguimiento de una solicitud de reunión (comparte el mismo
// vocabulario que las auditorías para mantener consistencia en el panel).
export type MeetingRequestStatus = FormSubmissionStatus;

// Registro de una persona que agendó una consulta (/contacto/agendar).
export interface MeetingRequest {
  id: string;
  name: string;
  role: string | null;
  email: string;
  phone: string | null;
  business: string | null;
  sector: string | null;
  stage: string | null;
  digital: string[];
  challenge: string | null;
  services: string[];
  budget: string | null;
  note: string | null;
  meeting_date: string | null;
  meeting_time: string | null;
  meeting_start: string | null;
  meet_link: string | null;
  calendar_event_id: string | null;
  status: MeetingRequestStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TableName =
  | "plans"
  | "portfolio"
  | "posts"
  | "team_members"
  | "brands"
  | "kanban_columns"
  | "kanban_cards"
  | "form_submissions"
  | "meeting_requests";
