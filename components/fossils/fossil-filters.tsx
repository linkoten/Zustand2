"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, X, Sparkles, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterOptions } from "@/types/productType";
import { useFossilStore } from "@/stores/fossilStore";
import { Slider } from "@/components/ui/slider";
import { AdvancedFiltersModal } from "./advanced-filters/advanced-filters-modal";

interface FossilesFiltersProps {
  filterOptions: FilterOptions;
  lang?: "en" | "fr";
  dict?: Record<string, Record<string, string | undefined> | undefined>;
}

export default function FossilesFilters({
  filterOptions,
  lang = "fr",
  dict,
}: FossilesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { facets, catalogIndex } = useFossilStore();
  const catalogReady = catalogIndex.length > 0;

  const parseArray = (str: string | null) => {
    if (!str || str === "all") return [];
    return str.split(",").filter(Boolean);
  };

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    parseArray(searchParams.get("category")),
  );
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    parseArray(searchParams.get("countryOfOrigin")),
  );
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>(
    parseArray(searchParams.get("locality")),
  );
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(
    parseArray(searchParams.get("geologicalPeriod")),
  );
  const [selectedStages, setSelectedStages] = useState<string[]>(
    parseArray(searchParams.get("geologicalStage")),
  );

  const PRICE_STEP = 10;
  const defaultMinPrice =
    Math.floor((filterOptions.minPrice || 0) / PRICE_STEP) * PRICE_STEP;
  const defaultMaxPrice =
    Math.ceil((filterOptions.maxPrice || 1000) / PRICE_STEP) * PRICE_STEP ||
    1000;
  const initialMinPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : defaultMinPrice;
  const initialMaxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : defaultMaxPrice;
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialMinPrice,
    initialMaxPrice,
  ]);

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<
    [number, number]
  >([initialMinPrice, initialMaxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPriceRange(priceRange), 600);
    return () => clearTimeout(timer);
  }, [priceRange]);

  // Handle dynamic apply whenever filters change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategories,
    selectedCountries,
    selectedLocalities,
    selectedPeriods,
    selectedStages,
    debouncedSearch,
    debouncedPriceRange,
  ]);
  const toggleFilter = (
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    val: string,
    checked: boolean,
  ) => {
    setState((prev: string[]) =>
      checked ? [...prev, val] : prev.filter((v) => v !== val),
    );
  };

  const isPriceFiltered =
    priceRange[0] !== defaultMinPrice || priceRange[1] !== defaultMaxPrice;

  const activeFilterTags: {
    label: string;
    group: string;
    remove: () => void;
  }[] = [
    ...selectedCategories.map((v) => ({
      label: v,
      group: "Cat.",
      remove: () => setSelectedCategories((p) => p.filter((x) => x !== v)),
    })),
    ...selectedCountries.map((v) => ({
      label: v,
      group: "Pays",
      remove: () => setSelectedCountries((p) => p.filter((x) => x !== v)),
    })),
    ...selectedLocalities.map((v) => ({
      label: v,
      group: "Loc.",
      remove: () => setSelectedLocalities((p) => p.filter((x) => x !== v)),
    })),
    ...selectedPeriods.map((v) => ({
      label: v,
      group: "Pér.",
      remove: () => setSelectedPeriods((p) => p.filter((x) => x !== v)),
    })),
    ...selectedStages.map((v) => ({
      label: v,
      group: "Ét.",
      remove: () => setSelectedStages((p) => p.filter((x) => x !== v)),
    })),
    ...(searchTerm.trim()
      ? [
          {
            label: searchTerm.trim(),
            group: "Rech.",
            remove: () => setSearchTerm(""),
          },
        ]
      : []),
    ...(isPriceFiltered
      ? [
          {
            label: `${priceRange[0]}–${priceRange[1]} €`,
            group: "Prix",
            remove: () => setPriceRange([defaultMinPrice, defaultMaxPrice]),
          },
        ]
      : []),
  ];

  const activeFiltersCount = activeFilterTags.length;

  const applyFilters = () => {
    const params = new URLSearchParams();
    const newFilters: Record<string, string | string[] | undefined> = {};

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
      newFilters.search = debouncedSearch.trim();
    } else {
      newFilters.search = undefined;
    }

    if (debouncedPriceRange[0] !== defaultMinPrice) {
      params.set("minPrice", debouncedPriceRange[0].toString());
      newFilters.minPrice = debouncedPriceRange[0].toString();
    } else {
      newFilters.minPrice = undefined;
    }

    if (debouncedPriceRange[1] !== defaultMaxPrice) {
      params.set("maxPrice", debouncedPriceRange[1].toString());
      newFilters.maxPrice = debouncedPriceRange[1].toString();
    } else {
      newFilters.maxPrice = undefined;
    }

    if (selectedCategories.length > 0) {
      const val = selectedCategories.join(",");
      params.set("category", val);
      newFilters.category = val;
    } else {
      newFilters.category = undefined;
    }

    if (selectedCountries.length > 0) {
      const val = selectedCountries.join(",");
      params.set("countryOfOrigin", val);
      newFilters.countryOfOrigin = val;
    } else {
      newFilters.countryOfOrigin = undefined;
    }

    if (selectedLocalities.length > 0) {
      const val = selectedLocalities.join(",");
      params.set("locality", val);
      newFilters.locality = val;
    } else {
      newFilters.locality = undefined;
    }

    if (selectedPeriods.length > 0) {
      const val = selectedPeriods.join(",");
      params.set("geologicalPeriod", val);
      newFilters.geologicalPeriod = val;
    } else {
      newFilters.geologicalPeriod = undefined;
    }

    if (selectedStages.length > 0) {
      const val = selectedStages.join(",");
      params.set("geologicalStage", val);
      newFilters.geologicalStage = val;
    } else {
      newFilters.geologicalStage = undefined;
    }

    params.set("page", "1");
    newFilters.page = "1";

    useFossilStore.getState().updateFilters(newFilters);
    window.history.pushState(
      null,
      "",
      `/${lang}/fossiles?${params.toString()}`,
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCountries([]);
    setSelectedLocalities([]);
    setSelectedPeriods([]);
    setSelectedStages([]);
    setSearchTerm("");
    setPriceRange([defaultMinPrice, defaultMaxPrice]);

    useFossilStore.getState().resetFilters();
    window.history.pushState(null, "", `/${lang}/fossiles`);
  };

  return (
    <Card className="h-[calc(100vh-3rem)] shadow-xl bg-[var(--silex)] border border-[var(--parchemin)]/10 backdrop-blur-sm flex flex-col">
      {/* Header fixe - hauteur définie */}
      <CardHeader className="pb-4 bg-[var(--silex)] rounded-t-lg border-b border-[var(--parchemin)]/10 flex-shrink-0 h-16">
        <div className="flex items-center justify-between h-full">
          <CardTitle className="text-xl font-serif font-bold text-[var(--parchemin)] flex items-center gap-2">
            <div className="relative">
              <Filter className="w-5 h-5 text-[var(--terracotta)]" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--terracotta)] rounded-full animate-ping"></div>
            </div>
            {dict?.fossils?.filters || "Filtres"}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Badge className="bg-[var(--terracotta)] text-white border-0 shadow-md animate-pulse">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Contenu scrollable - prend l'espace restant */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <CardContent className="space-y-6 p-6">
            {/* Recherche améliorée */}
            <div className="space-y-3">
              <Label
                htmlFor="search"
                className="text-sm font-semibold text-[var(--parchemin)]/80 flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-[var(--terracotta)]" />
                {dict?.fossils?.searchLabel || "Rechercher"}
              </Label>
              <div className="relative group">
                <div className="absolute inset-0 bg-[var(--terracotta)]/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--parchemin)]/40 w-4 h-4 group-hover:text-[var(--terracotta)] transition-colors duration-200" />
                  <Input
                    id="search"
                    placeholder={
                      dict?.fossils?.searchPlaceholder ||
                      "Rechercher un fossile..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[var(--parchemin)]/20 focus:border-[var(--terracotta)] bg-[var(--parchemin)]/5 text-[var(--parchemin)] placeholder:text-[var(--parchemin)]/40 backdrop-blur-sm transition-all duration-200 hover:border-[var(--parchemin)]/40"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-[var(--parchemin)]/60 hover:text-red-400 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Séparateur visuel */}
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--parchemin)]/20 to-transparent"></div>

            {/* Filtres Avancés Modal */}
            <div className="mb-6">
              <AdvancedFiltersModal
                filterOptions={filterOptions}
                selectedPeriods={selectedPeriods}
                setSelectedPeriods={setSelectedPeriods}
                selectedStages={selectedStages}
                setSelectedStages={setSelectedStages}
                selectedLocalities={selectedLocalities}
                setSelectedLocalities={setSelectedLocalities}
                triggerSearch={applyFilters}
              />
            </div>

            {/* Filtres avec design amélioré */}
            <div className="space-y-6">
              {/* Price Range */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-[var(--parchemin)]/80 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--terracotta)] rounded-full"></div>
                  {dict?.fossils?.priceRangeLabel || "Prix (€)"}
                </Label>
                <div className="px-2 pt-2 pb-4">
                  <Slider
                    min={filterOptions.minPrice || 0}
                    max={filterOptions.maxPrice || 1000}
                    step={10}
                    value={priceRange}
                    onValueChange={(val: [number, number]) =>
                      setPriceRange(val)
                    }
                    className="py-4"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-medium text-[var(--parchemin)]/70 bg-[var(--parchemin)]/10 py-1 px-2 rounded-md">
                      {priceRange[0]} €
                    </span>
                    <span className="text-xs font-medium text-[var(--parchemin)]/70 bg-[var(--parchemin)]/10 py-1 px-2 rounded-md">
                      {priceRange[1]} €
                    </span>
                  </div>
                </div>
              </div>

              {/* Catégorie */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[var(--parchemin)]/80 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--terracotta)] rounded-full"></div>
                  {dict?.fossils?.categoryLabel || "Catégorie"}
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {filterOptions.categories.map((option) => {
                    const count = facets?.categories[option] || 0;
                    if (
                      catalogReady &&
                      count === 0 &&
                      !selectedCategories.includes(option)
                    )
                      return null;
                    return (
                      <div key={option} className="flex items-start space-x-3">
                        <Checkbox
                          id={`selectedCategories-${option}`}
                          checked={selectedCategories.includes(option)}
                          onCheckedChange={(c) =>
                            toggleFilter(
                              setSelectedCategories,
                              option,
                              c as boolean,
                            )
                          }
                          className="mt-0.5 border-[var(--terracotta)]/50 data-[state=checked]:bg-[var(--terracotta)]"
                        />
                        <Label
                          htmlFor={`selectedCategories-${option}`}
                          className="flex-1 text-sm font-medium leading-none cursor-pointer text-[var(--parchemin)]/90"
                        >
                          {option}
                        </Label>
                        <span className="text-xs text-[var(--parchemin)]/50">
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                  {filterOptions.categories.length === 0 && (
                    <div className="text-sm text-[var(--parchemin)]/50 italic">
                      Aucune option
                    </div>
                  )}
                </div>
              </div>

              {/* Pays */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[var(--parchemin)]/80 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--terracotta)] rounded-full"></div>
                  {dict?.fossils?.countryLabel || "Pays d'origine"}
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {filterOptions.countries.map((option) => {
                    const count = facets?.countries[option] || 0;
                    if (
                      catalogReady &&
                      count === 0 &&
                      !selectedCountries.includes(option)
                    )
                      return null;
                    return (
                      <div key={option} className="flex items-start space-x-3">
                        <Checkbox
                          id={`selectedCountries-${option}`}
                          checked={selectedCountries.includes(option)}
                          onCheckedChange={(c) =>
                            toggleFilter(
                              setSelectedCountries,
                              option,
                              c as boolean,
                            )
                          }
                          className="mt-0.5 border-[var(--terracotta)]/50 data-[state=checked]:bg-[var(--terracotta)]"
                        />
                        <Label
                          htmlFor={`selectedCountries-${option}`}
                          className="flex-1 text-sm font-medium leading-none cursor-pointer text-[var(--parchemin)]/90"
                        >
                          {option}
                        </Label>
                        <span className="text-xs text-[var(--parchemin)]/50">
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                  {filterOptions.countries.length === 0 && (
                    <div className="text-sm text-[var(--parchemin)]/50 italic">
                      Aucune option
                    </div>
                  )}
                </div>
              </div>

              {/* Localité */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[var(--parchemin)]/80 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--terracotta)] rounded-full"></div>
                  {dict?.fossils?.localityLabel || "Localité"}
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {filterOptions.localities.map((option) => {
                    const count = facets?.localities[option] || 0;
                    if (
                      catalogReady &&
                      count === 0 &&
                      !selectedLocalities.includes(option)
                    )
                      return null;
                    return (
                      <div key={option} className="flex items-start space-x-3">
                        <Checkbox
                          id={`selectedLocalities-${option}`}
                          checked={selectedLocalities.includes(option)}
                          onCheckedChange={(c) =>
                            toggleFilter(
                              setSelectedLocalities,
                              option,
                              c as boolean,
                            )
                          }
                          className="mt-0.5 border-[var(--terracotta)]/50 data-[state=checked]:bg-[var(--terracotta)]"
                        />
                        <Label
                          htmlFor={`selectedLocalities-${option}`}
                          className="flex-1 text-sm font-medium leading-none cursor-pointer text-[var(--parchemin)]/90"
                        >
                          {option}
                        </Label>
                        <span className="text-xs text-[var(--parchemin)]/50">
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                  {filterOptions.localities.length === 0 && (
                    <div className="text-sm text-[var(--parchemin)]/50 italic">
                      Aucune option
                    </div>
                  )}
                </div>
              </div>

              {/* Période géologique */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[var(--parchemin)]/80 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--terracotta)] rounded-full"></div>
                  {dict?.fossils?.periodLabel || "Période géologique"}
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {filterOptions.geologicalPeriods.map((option) => {
                    const count = facets?.periods[option] || 0;
                    if (
                      catalogReady &&
                      count === 0 &&
                      !selectedPeriods.includes(option)
                    )
                      return null;
                    return (
                      <div key={option} className="flex items-start space-x-3">
                        <Checkbox
                          id={`selectedPeriods-${option}`}
                          checked={selectedPeriods.includes(option)}
                          onCheckedChange={(c) =>
                            toggleFilter(
                              setSelectedPeriods,
                              option,
                              c as boolean,
                            )
                          }
                          className="mt-0.5 border-[var(--terracotta)]/50 data-[state=checked]:bg-[var(--terracotta)]"
                        />
                        <Label
                          htmlFor={`selectedPeriods-${option}`}
                          className="flex-1 text-sm font-medium leading-none cursor-pointer text-[var(--parchemin)]/90"
                        >
                          {option}
                        </Label>
                        <span className="text-xs text-[var(--parchemin)]/50">
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                  {filterOptions.geologicalPeriods.length === 0 && (
                    <div className="text-sm text-[var(--parchemin)]/50 italic">
                      Aucune option
                    </div>
                  )}
                </div>
              </div>

              {/* Étage géologique */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[var(--parchemin)]/80 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--terracotta)] rounded-full"></div>
                  {dict?.fossils?.stageLabel || "Étage géologique"}
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {filterOptions.geologicalStages.map((option) => {
                    const count = facets?.stages[option] || 0;
                    if (
                      catalogReady &&
                      count === 0 &&
                      !selectedStages.includes(option)
                    )
                      return null;
                    return (
                      <div key={option} className="flex items-start space-x-3">
                        <Checkbox
                          id={`selectedStages-${option}`}
                          checked={selectedStages.includes(option)}
                          onCheckedChange={(c) =>
                            toggleFilter(
                              setSelectedStages,
                              option,
                              c as boolean,
                            )
                          }
                          className="mt-0.5 border-[var(--terracotta)]/50 data-[state=checked]:bg-[var(--terracotta)]"
                        />
                        <Label
                          htmlFor={`selectedStages-${option}`}
                          className="flex-1 text-sm font-medium leading-none cursor-pointer text-[var(--parchemin)]/90"
                        >
                          {option}
                        </Label>
                        <span className="text-xs text-[var(--parchemin)]/50">
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                  {filterOptions.geologicalStages.length === 0 && (
                    <div className="text-sm text-[var(--parchemin)]/50 italic">
                      Aucune option
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </ScrollArea>
      </div>

      {/* Footer - active filters + clear button */}
      <CardFooter className="flex flex-col gap-3 p-4 border-t border-[var(--parchemin)]/10 bg-[var(--silex)] flex-shrink-0">
        {activeFilterTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 w-full max-h-28 overflow-y-auto custom-scrollbar">
            {activeFilterTags.map((tag) => (
              <button
                key={`${tag.group}-${tag.label}`}
                onClick={tag.remove}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--terracotta)]/15 border border-[var(--terracotta)]/30 text-[var(--parchemin)]/90 hover:bg-[var(--terracotta)]/30 hover:border-[var(--terracotta)]/60 transition-colors cursor-pointer"
              >
                <span className="text-[var(--parchemin)]/50 text-[10px] leading-none">
                  {tag.group}
                </span>
                <span className="text-xs">{tag.label}</span>
                <X className="w-2.5 h-2.5 opacity-60 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full border-[var(--parchemin)]/20 text-[var(--parchemin)]/80 hover:border-red-500/50 hover:text-red-400 transition-all duration-200 transform hover:scale-[1.02]"
          >
            <X className="w-4 h-4 mr-2" />
            {dict?.fossils?.clear || "Effacer"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
