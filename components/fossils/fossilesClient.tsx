"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/product/productCard";
import { SerializedProduct } from "@/types/type";
import FossilesFilters from "./fossil-filters";

interface FossilesClientProps {
  fossils: SerializedProduct[];
  filterOptions: {
    categories: string[];
    countries: string[];
    localities: string[];
    geologicalPeriods: string[];
    geologicalStages: string[];
  };
}

// ✅ Interface pour les filtres actifs
interface ActiveFilters {
  category?: string;
  countryOfOrigin?: string;
  locality?: string;
  geologicalPeriod?: string;
  geologicalStage?: string;
}

export default function FossilesClient({
  fossils,
  filterOptions,
}: FossilesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Récupérer les filtres actifs depuis l'URL
  const activeFilters: ActiveFilters = {
    category: searchParams.get("category") || undefined,
    countryOfOrigin: searchParams.get("countryOfOrigin") || undefined,
    locality: searchParams.get("locality") || undefined,
    geologicalPeriod: searchParams.get("geologicalPeriod") || undefined,
    geologicalStage: searchParams.get("geologicalStage") || undefined,
  };

  // ✅ Nettoyer les valeurs undefined
  const cleanActiveFilters = Object.fromEntries(
    Object.entries(activeFilters).filter(([_, value]) => value !== undefined)
  ) as Record<string, string>;

  // ✅ Type approprié pour handleFiltersChange
  const handleFiltersChange = (newFilters: ActiveFilters) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    const newUrl = queryString ? `/fossiles?${queryString}` : "/fossiles";

    router.push(newUrl);
  };

  return (
    <>
      <FossilesFilters
        filterOptions={filterOptions}
        activeFilters={cleanActiveFilters}
        onFiltersChange={handleFiltersChange}
        resultsCount={fossils.length}
      />

      {fossils.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {Object.keys(cleanActiveFilters).length > 0
              ? "Aucun fossile ne correspond à vos critères de recherche."
              : "Aucun fossile disponible pour le moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {fossils.map((fossil) => (
            <ProductCard key={fossil.id} product={fossil} />
          ))}
        </div>
      )}
    </>
  );
}
