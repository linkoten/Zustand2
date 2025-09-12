import { Locality } from "@/lib/generated/prisma";

export interface CreateProductData {
  title: string;
  category: string;
  genre: string;
  species: string;
  price: number;
  countryOfOrigin: string;
  locality: Locality;
  geologicalPeriod: string;
  geologicalStage: string;
  description?: string;
  description2?: string;

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

// ✅ Utiliser un type personnalisé au lieu du type Prisma brut
export interface EditableProduct {
  id: number;
  title: string;
  description?: string;
  description2?: string;
  price: number; // ✅ number au lieu de Decimal
  category: string;
  countryOfOrigin: string;
  locality: Locality;
  geologicalPeriod: string;
  geologicalStage: string | null;
  weight: number | null;
  status: string;
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

export interface SearchParams {
  category?: string;
  countryOfOrigin?: string;
  locality?: string;
  geologicalPeriod?: string;
  geologicalStage?: string;
}
