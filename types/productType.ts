import { RatingStats, UserRating } from "./ratingType";
import { SerializedProduct, SerializedProductImage } from "./type";

export interface CreateProductData {
  title: string;
  category: string;
  genre: string;
  species: string;
  price: number;
  countryOfOrigin: string;
  locality: string;
  geologicalPeriod: string;
  geologicalStage: string;
  description?: string;
  weight: number; // ✅ Nouveau champ obligatoire
  images: Array<{
    url: string;
    altText?: string;
  }>;
}

export interface FilterOptions {
  categories: string[];
  countries: string[];
  localities: string[];
  geologicalPeriods: string[];
  geologicalStages: string[];
}

export interface FossilesClientProps {
  fossils: SerializedProduct[];
  filterOptions: FilterOptions;
}

// ✅ Utiliser un type personnalisé au lieu du type Prisma brut
export interface EditableProduct {
  id: number;
  title: string;
  description: string | null;
  price: number; // ✅ number au lieu de Decimal
  category: string;
  countryOfOrigin: string;
  locality: string | null;
  geologicalPeriod: string;
  geologicalStage: string | null;
  weight: number | null;
  status: string;
}

export interface EditProductFormProps {
  product: EditableProduct;
}

export interface FilterOptions {
  categories: string[];
  countries: string[];
  localities: string[];
  geologicalPeriods: string[];
  geologicalStages: string[];
}

export interface ActiveFilters {
  category?: string;
  countryOfOrigin?: string;
  locality?: string;
  geologicalPeriod?: string;
  geologicalStage?: string;
}

export interface FossilesFiltersProps {
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  resultsCount: number;
}

export interface FossilRequestFormData {
  name: string;
  email: string;
  phone: string;
  fossilType: string;
  description: string;
  maxBudget: string;
  geologicalPeriod: string;
  category: string;
  countryOfOrigin: string;
  locality: string;
}

export interface FavoriteButtonProps {
  productId: number;
  isFavorite: boolean;
  variant?: "default" | "overlay";
  size?: "sm" | "md" | "lg";
}

export interface SearchParams {
  category?: string;
  countryOfOrigin?: string;
  locality?: string;
  geologicalPeriod?: string;
  geologicalStage?: string;
}

export interface ProductCarouselProps {
  images: SerializedProductImage[];
  productTitle: string;
}

export interface ProductPageClientProps {
  product: SerializedProduct;
  similarProducts: SerializedProduct[];
  ratingStats: RatingStats;
  userRating: UserRating | null;
}
