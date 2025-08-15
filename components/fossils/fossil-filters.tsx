"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Category,
  GeologicalPeriod,
  ProductStatus,
} from "@/lib/generated/prisma";
import { FossilFiltersProps } from "@/types/type";
import { X } from "lucide-react";

export function FossilFilters({
  selectedCategory,
  selectedStatus,
  selectedPeriod,
  onCategoryChange,
  onStatusChange,
  onPeriodChange,
  onClearFilters,
}: FossilFiltersProps) {
  const hasFilters = selectedCategory || selectedStatus || selectedPeriod;

  return (
    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Filtre par catégorie */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Catégorie</h4>
          <div className="flex flex-wrap gap-2">
            {Object.values(Category).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  onCategoryChange(
                    selectedCategory === category ? undefined : category
                  )
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Filtre par statut */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Statut</h4>
          <div className="flex flex-wrap gap-2">
            {Object.values(ProductStatus).map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  onStatusChange(selectedStatus === status ? undefined : status)
                }
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Bouton pour effacer les filtres */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="mt-2"
        >
          <X className="w-4 h-4 mr-2" />
          Effacer les filtres
        </Button>
      )}
    </div>
  );
}
