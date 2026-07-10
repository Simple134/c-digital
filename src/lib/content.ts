import { createClient } from "@/lib/supabase/client";
import type {
  Brand,
  Plan,
  PortfolioItem,
  Post,
  TeamMember,
} from "@/lib/supabase/types";

// Módulo de acceso a contenido para las páginas públicas.
// Cada función devuelve los datos de Supabase normalizados al formato que
// ya espera el JSX existente. Si falla la consulta, devuelve null para que
// la página use sus valores por defecto (el sitio nunca queda en blanco).

export async function getPlans() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return null;
  return (data as Plan[]).map((p) => ({
    name: p.name,
    slug: p.slug,
    usd: p.usd ?? "",
    period: p.period ?? undefined,
    dop: p.dop ?? "",
    featured: p.featured,
    features: p.features ?? [],
    team: p.team ?? "",
    limit: p.plan_limit ?? undefined,
  }));
}

export async function getPortfolio() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return null;
  return (data as PortfolioItem[]).map((p) => ({
    href: p.href ?? "#",
    img: p.img ?? "",
    category: p.category ?? "",
    title: p.title,
    cls: p.cls ?? "",
  }));
}

export async function getPosts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return null;
  return (data as Post[]).map((p) => ({
    id: p.slug,
    category: p.category ?? "",
    title: p.title,
    excerpt: p.excerpt ?? "",
    date: p.post_date ?? "",
    img: p.img ?? "",
  }));
}

export async function getPostBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as Post;
}

export async function getTeam() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return null;
  return (data as TeamMember[]).map((m) => ({
    name: m.name,
    role: m.role ?? "",
    bio: m.bio ?? "",
    photo: m.photo ?? "",
  }));
}

export async function getBrands() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return null;
  return (data as Brand[]).map((b) => ({
    image: b.image,
    name: b.name,
    title: b.name,
  }));
}
