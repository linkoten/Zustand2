import { BlogCategory, BlogStatus } from "@/lib/generated/prisma";
import { BlogListItem } from "./type";

// ─── Gisements structured data types ────────────────────────────────────────

export type FossilRarity =
  | "COMMUN"
  | "PEU_COMMUN"
  | "RARE"
  | "TRES_RARE"
  | "EXCEPTIONNEL";

export interface FossilSpecies {
  id: string;
  name: string;
  commonName?: string;
  description: string;
  size?: string;
  layer?: string;
  period?: string;
  rarity?: FossilRarity;
  characteristics: string[];
  photos: string[];
}

export interface FossilGenus {
  id: string;
  name: string;
  description?: string;
  species: FossilSpecies[];
}

export interface FossilFamily {
  id: string;
  name: string;
  description?: string;
  genera: FossilGenus[];
}

export interface GisementsData {
  localityName: string;
  localityLocation: string;
  geologicalPeriod: string;
  geologicalStages: string[];
  introduction: string;
  fauna: FossilFamily[];
}

// ─── Activités Paléolitho structured data types ──────────────────────────────

export type ActiviteType = "SALON" | "FOUILLE" | "ARRIVAGE" | "PLANNING";

/** A fossil item shown in an activity (optionally linked to a product) */
export interface ActiviteFossil {
  id: string;
  productId?: string;
  name: string;
  category?: string;
  description?: string;
  photo?: string;
  price?: string;
}

/** Salon / foire */
export interface SalonData {
  eventName: string;
  location: string;
  organizer?: string;
  dateStart: string;
  dateEnd?: string;
  boothInfo?: string;
  fossils: ActiviteFossil[];
}

/** Voyage / fouille terrain */
export interface FouilleData {
  destination: string;
  country?: string;
  dateStart: string;
  dateEnd?: string;
  team: string[];
  summary: string;
  findings: string[];
  photos: string[];
}

/** Arrivage boutique */
export interface ArrivageData {
  arrivedAt: string;
  origin?: string;
  fossils: ActiviteFossil[];
}

/** Planification d'articles */
export interface PlanningTopic {
  id: string;
  title: string;
  category?: string;
  status: "PLANNED" | "IN_PROGRESS" | "DONE";
  notes?: string;
}

export interface PlanningData {
  topics: PlanningTopic[];
}

/** Discriminated union — one sub-type per article */
export type ActivitesData =
  | { type: "SALON"; salon: SalonData }
  | { type: "FOUILLE"; fouille: FouilleData }
  | { type: "ARRIVAGE"; arrivage: ArrivageData }
  | { type: "PLANNING"; planning: PlanningData };

// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

export interface BlogFilters {
  category?: BlogCategory;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BlogResult {
  articles: BlogListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateArticleData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  imageAlt?: string;
  category: BlogCategory;
  status: BlogStatus;
  publishedAt?: Date;
  readTime?: number;
  seoTitle?: string;
  seoDescription?: string;
  tagIds: string[];
  structuredData?: GisementsData | ActivitesData;
}

export interface UpdateArticleData {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  imageAlt?: string | null;
  category: BlogCategory;
  status: BlogStatus;
  publishedAt?: Date;
  seoTitle?: string | null;
  seoDescription?: string | null;
  tagIds: string[];
  structuredData?: GisementsData | ActivitesData | null;
}

// ✅ Nouveau type de post basé sur les données de la page
export interface BlogPost {
  id: string; // ✅ String selon votre schéma
  title: string;
  excerpt: string | null;
  slug: string;
  category: BlogCategory;
  tags: string[];
  featuredImage: string | null;
  publishedAt: string;
  readTime: number | null;
  author: {
    name: string | null; // ✅ name au lieu de firstName/lastName
  };
}

// ✅ Types basés sur le schéma Prisma réel
export interface EditableBlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  slug: string;
  category: BlogCategory;
  tags: string[]; // ✅ Array de noms de tags
  tagIds?: string[]; // IDs pour le formulaire Gisements
  featuredImage: string | null;
  imageAlt: string | null;
  status: BlogStatus;
  readTime: number | null;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  structuredData?: unknown;
}
