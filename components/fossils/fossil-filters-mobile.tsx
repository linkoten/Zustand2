"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, X, Sparkles, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterOptions } from "@/types/productType";
import { useFossilStore } from "@/stores/fossilStore";

interface FossilesFiltersMobileProps {
  filterOptions: FilterOptions;
  lang?: "en" | "fr";
  dict?: Record<string, Record<string, string | undefined> | undefined>;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export default function FossilesFiltersMobile({
  filterOptions,
  lang = "fr",
  dict,
  activeFiltersCount,
  onClearFilters,
}: FossilesFiltersMobileProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const { facets } = useFossilStore();

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

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const applyFilters = () => {
    const params = new URLSearchParams();
    const newFilters: Record<string, string | string[] | undefined> = {};

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
      newFilters.search = debouncedSearch.trim();
    } else {
      newFilters.search = undefined;
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

    useFossilStore.getState().resetFilters();
    window.history.pushState(null, "", `/${lang}/fossiles`);
    onClearFilters();
  };

  return (
    <div className="flex items-center gap-3">
      {/* Badge filtres actifs */}
      {activeFiltersCount > 0 && (
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 animate-pulse">
          <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          {activeFiltersCount}
          <span className="hidden sm:inline ml-1">
            {dict?.fossils?.activeFilters || "filtres"}
          </span>
        </Badge>
      )}

      {/* Bouton clear rapide */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="border-slate-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all duration-200 h-8 px-2 sm:px-3"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
          <span className="hidden sm:inline text-xs">Reset</span>
        </Button>
      )}

      {/* Dialog modal pour les filtres */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 text-amber-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200 relative"
          >
            <SlidersHorizontal className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">
              {dict?.fossils?.filters || "Filtres"}
            </span>
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0 border-2 border-white">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] bg-gradient-to-b from-white to-slate-50/50 border-0 rounded-2xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-slate-200">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-amber-600" />
              {dict?.fossils?.filters || "Filtres"}
              {activeFiltersCount > 0 && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-5">
              {/* Recherche */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-600" />
                  {dict?.fossils?.searchLabel || "Rechercher"}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder={
                      dict?.fossils?.searchPlaceholder ||
                      "Rechercher un fossile..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Séparateur */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>

              {/* Catégorie */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  {dict?.fossils?.categoryLabel || "Catégorie"}
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {filterOptions.categories.map((option) => {
                    const count = facets?.categories[option] || 0;
                    if (count === 0 && !selectedCategories.includes(option))
                      return null;
                    return (
                      <div key={option} className="flex items-start space-x-3">
                        <Checkbox
                          id={`categories-${option}`}
                          checked={selectedCategories.includes(option)}
                          onCheckedChange={(c) =>
                            toggleFilter(
                              setSelectedCategories,
                              option,
                              c as boolean,
                            )
                          }
                          className="mt-0.5 border-amber-500 data-[state=checked]:bg-amber-500"
                        />
                        <Label
                          htmlFor={`categories-${option}`}
                          className="flex-1 text-sm font-medium leading-none cursor-pointer text-slate-700"
                        >
                          {option}
                        </Label>
                        <span className="text-xs text-slate-400">
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                  {filterOptions.categories.length === 0 && (
                    <div className="text-sm text-slate-400 italic">
                      Aucune option
                    </div>
                  )}
                </div>
              </div>

              {/* Pays */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  {dict?.fossils?.countryLabel || "Pays d'origine"}
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {filterOptions.countries.map((option) => {
                    const count = facets?.countries[option] || 0;
                    if (count === 0 && !selectedCountries.includes(option))
                      return null;
                    return (
                      <div key={option} className="flex items-start space-x-3">
                        <Checkbox
                          id={`countries-${option}`}
                          checked={selectedCountries.includes(option)}
                          onCheckedChange={(c) =>
                            toggleFilter(
                              setSelectedCountries,
                              option,
                              c as boolean,
                            )
                          }
                          className="mt-0.5 border-cyan-500 data-[state=checked]:bg-cyan-500"
                        />
                        <Label
                          htmlFor={`countries-${option}`}
                          className="flex-1 text-sm font-medium leading-none cursor-pointer text-slate-700"
                        >
                          {option}
                        </Label>
                        <span className="text-xs text-slate-400">
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                  {filterOptions.countries.length === 0 && (
                    <div className="text-sm text-slate-400 italic">
                      Aucune option
                    </div>
                  )}
                </div>
              </div>

              {/* Localité */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  {dict?.fossils?.localityLabel || "Localité"}
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {filterOptions.localities.map((option) => {
                    const count = facets?.localities[option] || 0;
                    if (count === 0 && !selectedLocalities.includes(option))
                      return null;
                    return (
                      <div key={option} className="flex items-start space-x-3">
                        <Checkbox
                          id={`localities-${option}`}
                          checked={selectedLocalities.includes(option)}
                          onCheckedChange={(c) =>
                            toggleFilter(
                              setSelectedLocalities,
                              option,
                              c as boolean,
                            )
                          }
                          className="mt-0.5 border-emerald-500 data-[state=checked]:bg-emerald-500"
                        />
                        <Label
                          htmlFor={`localities-${option}`}
                          className="flex-1 text-sm font-medium leading-none cursor-pointer text-slate-700"
                        >
                          {option}
                        </Label>
                        <span className="text-xs text-slate-400">
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                  {filterOptions.localities.length === 0 && (
                    <div className="text-sm text-slate-400 italic">
                      Aucune option
                    </div>
                  )}
                </div>
              </div>

              {/* Période géologique */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                  {dict?.fossils?.periodLabel || "Période géologique"}
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {filterOptions.geologicalPeriods.map((option) => {
                    const count = facets?.periods[option] || 0;
                    if (count === 0 && !selectedPeriods.includes(option))
                      return null;
                    return (
                      <div key={option} className="flex items-start space-x-3">
                        <Checkbox
                          id={`periods-${option}`}
                          checked={selectedPeriods.includes(option)}
                          onCheckedChange={(c) =>
                            toggleFilter(
                              setSelectedPeriods,
                              option,
                              c as boolean,
                            )
                          }
                          className="mt-0.5 border-violet-400 data-[state=checked]:bg-violet-400"
                        />
                        <Label
                          htmlFor={`periods-${option}`}
                          className="flex-1 text-sm font-medium leading-none cursor-pointer text-slate-700"
                        >
                          {option}
                        </Label>
                        <span className="text-xs text-slate-400">
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                  {filterOptions.geologicalPeriods.length === 0 && (
                    <div className="text-sm text-slate-400 italic">
                      Aucune option
                    </div>
                  )}
                </div>
              </div>

              {/* Étage géologique */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  {dict?.fossils?.stageLabel || "Étage géologique"}
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {filterOptions.geologicalStages.map((option) => {
                    const count = facets?.stages[option] || 0;
                    if (count === 0 && !selectedStages.includes(option))
                      return null;
                    return (
                      <div key={option} className="flex items-start space-x-3">
                        <Checkbox
                          id={`stages-${option}`}
                          checked={selectedStages.includes(option)}
                          onCheckedChange={(c) =>
                            toggleFilter(
                              setSelectedStages,
                              option,
                              c as boolean,
                            )
                          }
                          className="mt-0.5 border-orange-500 data-[state=checked]:bg-orange-500"
                        />
                        <Label
                          htmlFor={`stages-${option}`}
                          className="flex-1 text-sm font-medium leading-none cursor-pointer text-slate-700"
                        >
                          {option}
                        </Label>
                        <span className="text-xs text-slate-400">
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                  {filterOptions.geologicalStages.length === 0 && (
                    <div className="text-sm text-slate-400 italic">
                      Aucune option
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex flex-col gap-3 pt-4 border-t border-slate-200">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full border-slate-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                {dict?.fossils?.clear || "Effacer tous les filtres"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
