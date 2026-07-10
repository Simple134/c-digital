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

export type TableName =
  | "plans"
  | "portfolio"
  | "posts"
  | "team_members"
  | "brands";
