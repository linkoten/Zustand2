"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X, RefreshCw } from "lucide-react";
import { ActiveFilters, FilterOptions } from "@/types/productType";
import { categoryLabels, geologicalPeriodLabels } from "@/lib/constant";

interface FossilesFiltersProps {
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  resultsCount: number;
}
export default function FossilesFilters({
  filterOptions,
  activeFilters,
  onFiltersChange,
  resultsCount,
}: FossilesFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (
    key: keyof ActiveFilters,
    value: string | undefined
  ) => {
    const newFilters = { ...activeFilters };
    if (value && value !== "all") {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {Object.keys(activeFilters).length}
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {resultsCount} résultat{resultsCount > 1 ? "s" : ""}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Masquer" : "Afficher"} les filtres
            </Button>
          </div>
        </div>

        {/* Filtres actifs */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2">
            {activeFilters.category && (
              <Badge variant="default" className="flex items-center gap-1">
                {categoryLabels[activeFilters.category] ||
                  activeFilters.category}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("category", undefined)}
                />
              </Badge>
            )}

            {activeFilters.countryOfOrigin && (
              <Badge variant="default" className="flex items-center gap-1">
                {activeFilters.countryOfOrigin}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("countryOfOrigin", undefined)}
                />
              </Badge>
            )}

            {activeFilters.locality && (
              <Badge variant="default" className="flex items-center gap-1">
                {activeFilters.locality}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("locality", undefined)}
                />
              </Badge>
            )}

            {activeFilters.geologicalPeriod && (
              <Badge variant="default" className="flex items-center gap-1">
                {geologicalPeriodLabels[activeFilters.geologicalPeriod] ||
                  activeFilters.geologicalPeriod}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("geologicalPeriod", undefined)}
                />
              </Badge>
            )}

            {activeFilters.geologicalStage && (
              <Badge variant="default" className="flex items-center gap-1">
                {activeFilters.geologicalStage}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("geologicalStage", undefined)}
                />
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Tout effacer
            </Button>
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Catégorie */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <Select
                value={activeFilters.category || "all"}
                onValueChange={(value) => updateFilter("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {filterOptions.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {categoryLabels[category] || category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pays d'origine */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Pays d&apos;origine</label>
              <Select
                value={activeFilters.countryOfOrigin || "all"}
                onValueChange={(value) =>
                  updateFilter("countryOfOrigin", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  {filterOptions.countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Localité */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Localité</label>
              <Select
                value={activeFilters.locality || "all"}
                onValueChange={(value) => updateFilter("locality", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les localités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les localités</SelectItem>
                  {filterOptions.localities.map((locality) => (
                    <SelectItem key={locality} value={locality}>
                      {locality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Période géologique */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Période géologique</label>
              <Select
                value={activeFilters.geologicalPeriod || "all"}
                onValueChange={(value) =>
                  updateFilter("geologicalPeriod", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les périodes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  {filterOptions.geologicalPeriods.map((period) => (
                    <SelectItem key={period} value={period}>
                      {geologicalPeriodLabels[period] || period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Étage géologique */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Étage géologique</label>
              <Select
                value={activeFilters.geologicalStage || "all"}
                onValueChange={(value) =>
                  updateFilter("geologicalStage", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les étages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les étages</SelectItem>
                  {filterOptions.geologicalStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
