import {
  Category,
  CollectionStatus,
  FossilRarity,
  GeologicalPeriod,
} from "@/lib/generated/prisma";

// ─── Species catalogue ────────────────────────────────────────────────────────

export interface FossilSpeciesItem {
  id: string;
  genus: string;
  species: string;
  commonName: string | null;
  category: Category;
  localityId: number;
  localityName: string;
  countryOfOrigin: string;
  geologicalPeriod: GeologicalPeriod;
  geologicalStage: string;
  rarity: FossilRarity | null;
  photos: string[];
  /** Status of the currently logged-in user (undefined = not logged in or not in collection) */
  userStatus?: CollectionStatus | null;
  /** Number of users who have this on their wishlist */
  wishlistCount?: number;
  /** Number of users who own this */
  ownedCount?: number;
  /** Number of shop products linked to this species */
  productCount?: number;
}

export interface FossilSpeciesDetail extends FossilSpeciesItem {
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  products: LinkedProduct[];
  userCollection?: UserCollectionEntry | null;
}

export interface LinkedProduct {
  id: number;
  title: string;
  price: number;
  status: string;
  images: { imageUrl: string }[];
}

// ─── User collection entries ──────────────────────────────────────────────────

export interface UserCollectionEntry {
  id: string;
  fossilSpeciesId: string;
  status: CollectionStatus;
  acquiredAt: Date | null;
  notes: string | null;
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export interface CreateFossilSpeciesData {
  genus: string;
  species: string;
  commonName?: string;
  description?: string;
  localityId: number;
  geologicalPeriod: GeologicalPeriod;
  geologicalStage: string;
  category: Category;
  countryOfOrigin: string;
  rarity?: FossilRarity;
  photos?: string[];
}

export type UpdateFossilSpeciesData = Partial<CreateFossilSpeciesData>;

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface CollectionFilters {
  localityId?: number;
  country?: string;
  category?: Category;
  geologicalPeriod?: GeologicalPeriod;
  geologicalStage?: string;
  rarity?: FossilRarity;
  search?: string;
  /** Filter by the logged-in user's collection status */
  status?: CollectionStatus | "NONE";
  page?: number;
  pageSize?: number;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface LocalityProgress {
  localityId: number;
  localityName: string;
  totalSpecies: number;
  ownedCount: number;
  wishlistCount: number;
}

export interface CategoryProgress {
  category: Category;
  totalSpecies: number;
  ownedCount: number;
  wishlistCount: number;
}

export interface UserCollectionStats {
  totalOwned: number;
  totalWishlist: number;
  byLocality: LocalityProgress[];
  byCategory: CategoryProgress[];
}

export interface TopWishlisted {
  id: string;
  genus: string;
  species: string;
  localityName: string;
  wishlistCount: number;
  hasStock: boolean;
}

export interface AdminCollectionStats {
  totalSpecies: number;
  totalCollectors: number;
  topWishlisted: TopWishlisted[];
}

// ─── Facets (for cascade filters + explorer) ─────────────────────────────────

/** Compact facet used by cascade filters */
export interface SpeciesFacet {
  localityId: number;
  countryOfOrigin: string;
  geologicalPeriod: string;
  geologicalStage: string;
}

/** Enriched facet used by the Explorer drill-down (superset of SpeciesFacet) */
export interface EnrichedSpeciesFacet {
  id: string;
  localityId: number;
  localityName: string;
  countryOfOrigin: string;
  geologicalPeriod: string;
  geologicalStage: string;
  category: string;
  userStatus: "OWNED" | "WISHLIST" | null;
}

// ─── Paginated response ───────────────────────────────────────────────────────

export interface PaginatedSpecies {
  items: FossilSpeciesItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
