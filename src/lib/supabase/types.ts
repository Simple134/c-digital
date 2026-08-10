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
  email: string | null;
  auth_user_id: string | null;
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
  // Columna terminal: al entrar aquí una tarjeta se considera entregada y se
  // sella su `completed_at`. Es un flag y no el título/orden porque las columnas
  // son editables: renombrar "Hecho" no debe romper el reporte de rendimiento.
  is_done: boolean;
}

export interface KanbanCard {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: string | null;
  assignee_id: string | null;
  client_id: string | null;
  // true = la tarea está pendiente del cliente, no del equipo. `assignee_id`
  // sigue indicando quién la supervisa por nuestro lado (puede ser null).
  assigned_to_client: boolean;
  // Imagen de referencia de la tarea. `image_path` es el objeto en el bucket
  // `kanban-attachments`; `image_url` su URL pública ya resuelta.
  image_url: string | null;
  image_path: string | null;
  // Fecha límite de entrega (solo día, sin hora). Null = no medible.
  due_date: string | null;
  // Instante en que la tarjeta entró a una columna terminal. Se sella una vez y
  // se limpia si vuelve a salir, para que reabrir una tarea no falsee la métrica.
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  public_token: string;
  // Destinatario de los avisos de tareas pendientes del cliente. Null = no se
  // le puede notificar (el tablero lo advierte en lugar de fallar).
  email: string | null;
  // Razón social. Si está presente es el nombre que se imprime en la factura;
  // `name` sigue siendo el nombre corto con el que se le llama en el panel.
  company: string | null;
  contact_name: string | null;
  phone: string | null;
  // RNC o cédula, imprescindible para una factura con ITBIS válida en RD.
  tax_id: string | null;
  address: string | null;
  // Ya normalizada con esquema (https://…) al guardarse, para poder enlazarla
  // sin volver a validarla en cada lugar que la muestre.
  website: string | null;
  // Solo el día (YYYY-MM-DD): sirve para felicitarlo, no para facturar.
  birth_date: string | null;
  notes: string | null;
  // Campos adicionales que define el equipo, distintos para cada cliente
  // (Instagram, número de contrato, contacto secundario…). Mapa plano por
  // CHECK en la base de datos: nada de anidamiento.
  custom_fields: Record<string, string>;
  // false = archivado. Desaparece de los selectores de factura y de tareas pero
  // conserva su historial, que es justo lo que borrarlo destruiría.
  active: boolean;
  sort_order: number;
  created_at: string;
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
  | "clients"
  | "form_submissions"
  | "meeting_requests"
  | "invoices"
  | "invoice_items"
  | "invoice_payments";

/* ---------------- Facturación ---------------- */

// A quién se le factura: un cliente externo o un miembro del equipo (lo que se
// le debe por su trabajo). Las dos FKs son excluyentes, con CHECK en la BD.
export type InvoiceParty = "client" | "team";

export type InvoiceCurrency = "DOP" | "USD";

export interface Invoice {
  id: string;
  number: string;
  party_type: InvoiceParty;
  client_id: string | null;
  team_member_id: string | null;
  // Nombre y correo congelados al emitir: la factura ya enviada no debe cambiar
  // si después se renombra o se borra el cliente.
  party_name: string;
  party_email: string | null;
  // Resto del snapshot fiscal, congelado igual que el nombre. Solo se llena para
  // clientes: a un miembro del equipo no se le factura con RNC.
  party_company: string | null;
  party_tax_id: string | null;
  party_phone: string | null;
  party_address: string | null;
  issued_at: string;
  currency: InvoiceCurrency;
  discount: number;
  tax_rate: number;
  description: string | null;
  note: string | null;
  public_token: string;
  // Espejo en Gestiono, necesario para cobrar con Stripe: Gestiono solo genera
  // links de pago sobre facturas suyas. Nulo mientras no se haya pedido el link.
  // `gestiono_link_amount` se congela porque el link cobra el saldo del momento
  // en que se generó, no el saldo actual.
  gestiono_pending_record_id: number | null;
  gestiono_share_url: string | null;
  gestiono_link_amount: number | null;
  gestiono_linked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  concept: string;
  unit_price: number;
  quantity: number;
  unit: string;
  sort_order: number;
}

// Un abono. Varios por factura: así el PDF lista método y fecha de cada pago y
// el saldo se deriva de la suma, sin campo `paid_amount` que desincronizar.
export interface InvoicePayment {
  id: string;
  invoice_id: string;
  method: string;
  amount: number;
  paid_at: string;
  note: string | null;
  created_at: string;
}
