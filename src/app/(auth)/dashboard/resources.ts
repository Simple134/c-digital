import type { TableName } from "@/lib/supabase/types";

export type FieldType =
  "text" | "textarea" | "richtext" | "number" | "boolean" | "image" | "list";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  optional?: boolean;
  help?: string;
}

export interface Resource {
  table: TableName;
  label: string;
  singular: string;
  titleKey: string;
  subtitleKey?: string;
  imageKey?: string;
  fields: Field[];
}

export const RESOURCES: Resource[] = [
  {
    table: "plans",
    label: "Planes",
    singular: "plan",
    titleKey: "name",
    subtitleKey: "usd",
    fields: [
      { key: "name", label: "Nombre", type: "text" },
      { key: "slug", label: "Slug (único, sin espacios)", type: "text" },
      { key: "usd", label: "Precio USD", type: "text", optional: true },
      {
        key: "period",
        label: "Período (ej. /mes)",
        type: "text",
        optional: true,
      },
      { key: "dop", label: "Precio DOP", type: "text", optional: true },
      { key: "featured", label: "Destacado", type: "boolean" },
      {
        key: "features",
        label: "Características (una por línea)",
        type: "list",
      },
      { key: "team", label: "Equipo asignado", type: "text", optional: true },
      {
        key: "plan_limit",
        label: "Nota / límite",
        type: "text",
        optional: true,
      },
      { key: "sort_order", label: "Orden", type: "number" },
    ],
  },
  {
    table: "portfolio",
    label: "Portafolio",
    singular: "proyecto",
    titleKey: "title",
    subtitleKey: "category",
    imageKey: "img",
    fields: [
      { key: "title", label: "Título", type: "text" },
      { key: "category", label: "Categoría", type: "text", optional: true },
      {
        key: "href",
        label: "Enlace (ej. /trabajos/web)",
        type: "text",
        optional: true,
      },
      { key: "img", label: "Imagen de portada", type: "image", optional: true },
      {
        key: "cls",
        label: "Clase CSS (item-1 … item-5)",
        type: "text",
        optional: true,
        help: "Controla la posición en el grid del home.",
      },
      { key: "sort_order", label: "Orden", type: "number" },
    ],
  },
  {
    table: "posts",
    label: "Blog",
    singular: "artículo",
    titleKey: "title",
    subtitleKey: "category",
    imageKey: "img",
    fields: [
      { key: "title", label: "Título", type: "text" },
      { key: "slug", label: "Slug (único, sin espacios)", type: "text" },
      { key: "category", label: "Categoría", type: "text", optional: true },
      { key: "excerpt", label: "Resumen", type: "textarea", optional: true },
      {
        key: "content",
        label: "Contenido (HTML)",
        type: "richtext",
        optional: true,
        help: "Acepta etiquetas HTML: <h2>, <p>, <ul><li>, <strong>, etc.",
      },
      { key: "img", label: "Imagen de portada", type: "image", optional: true },
      {
        key: "post_date",
        label: "Fecha (texto)",
        type: "text",
        optional: true,
      },
      {
        key: "read_time",
        label: "Tiempo de lectura",
        type: "text",
        optional: true,
      },
      { key: "published", label: "Publicado", type: "boolean" },
      { key: "sort_order", label: "Orden", type: "number" },
    ],
  },
  {
    table: "team_members",
    label: "Equipo",
    singular: "miembro",
    titleKey: "name",
    subtitleKey: "role",
    imageKey: "photo",
    fields: [
      { key: "name", label: "Nombre", type: "text" },
      { key: "role", label: "Cargo", type: "text", optional: true },
      { key: "bio", label: "Biografía", type: "textarea", optional: true },
      { key: "photo", label: "Foto", type: "image", optional: true },
      { key: "sort_order", label: "Orden", type: "number" },
    ],
  },
  {
    table: "brands",
    label: "Marcas",
    singular: "marca",
    titleKey: "name",
    imageKey: "image",
    fields: [
      { key: "name", label: "Nombre", type: "text" },
      { key: "image", label: "Logo", type: "image" },
      { key: "sort_order", label: "Orden", type: "number" },
    ],
  },
];

// Valores por defecto al crear un registro nuevo.
export function emptyRecord(resource: Resource): Record<string, unknown> {
  const rec: Record<string, unknown> = {};
  for (const f of resource.fields) {
    if (f.type === "boolean") rec[f.key] = false;
    else if (f.type === "number") rec[f.key] = 0;
    else if (f.type === "list") rec[f.key] = [];
    else rec[f.key] = "";
  }
  return rec;
}
