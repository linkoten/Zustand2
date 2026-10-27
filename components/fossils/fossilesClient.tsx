"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Grid2x2,
  Grid3x3,
  LayoutGrid,
  List,
} from "lucide-react";
import { FossilCard } from "./fossil-card";
import { FossilListItem } from "./fossil-list-item";
import { SerializedProduct } from "@/types/type";
import { FilterOptions } from "@/types/productType";
import FossilesFilters from "./fossil-filters";
import FossilesFiltersMobile from "./fossil-filters-mobile";
import { useFossilStore } from "@/stores/fossilStore";

type ViewMode = "grid-2" | "grid-3" | "grid-4" | "list";

const VIEW_MODE_STORAGE_KEY = "fossilsViewMode";

const desktopGridColsClass: Record<Exclude<ViewMode, "list">, string> = {
  "grid-2": "lg:grid-cols-2",
  "grid-3": "lg:grid-cols-3",
  "grid-4": "lg:grid-cols-4",
};

interface FossilesClientProps {
  fossilsData: {
    fossils: SerializedProduct[];
    totalCount: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  filterOptions: FilterOptions;
  lang?: "en" | "fr";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: any;
  userId?: string | null;
  catalogData?: Record<string, string | null>[];
}

export default function FossilesClient({
  fossilsData: initialData,
  filterOptions,
  lang = "fr",
  dict,
  userId,
  catalogData,
}: FossilesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { setFossilData, setInitialFilters, setUserId, loadCatalogIndex } =
    useFossilStore();
  const { fossilData, isLoading, goToNextPage, goToPrevPage } = useFossilStore();

  const isInitialized = useRef(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid-2");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY) as ViewMode | null;
    if (stored) setViewMode(stored);
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  };

  useEffect(() => {
    if (!isInitialized.current) {
      setInitialFilters({
        search: searchParams.get("search") || undefined,
        category: searchParams.get("category") || undefined,
        countryOfOrigin: searchParams.get("countryOfOrigin") || undefined,
        locality: searchParams.get("locality") || undefined,
        geologicalPeriod: searchParams.get("geologicalPeriod") || undefined,
        geologicalStage: searchParams.get("geologicalStage") || undefined,
        sort: searchParams.get("sort") || undefined,
        minPrice: searchParams.get("minPrice") || undefined,
        maxPrice: searchParams.get("maxPrice") || undefined,
      });
      setFossilData(initialData);
      setUserId(userId || null);
      loadCatalogIndex(catalogData);
      isInitialized.current = true;
    }
  }, [
    searchParams,
    initialData,
    setFossilData,
    setInitialFilters,
    setUserId,
    userId,
    loadCatalogIndex,
    catalogData,
  ]);

  const currentData = isInitialized.current ? fossilData : initialData;
  const { fossils, totalCount, hasNextPage, page: currentPage, totalPages } =
    currentData;

  // Filtres actifs (hors page/sort) pour le badge et les puces affichées
  const filterLabels: Record<string, string> = {
    search: dict?.fossils?.searchLabel || "Recherche",
    category: dict?.fossils?.categoryLabel || "Catégorie",
    countryOfOrigin: dict?.fossils?.countryLabel || "Pays",
    locality: dict?.fossils?.localityLabel || "Localité",
    geologicalPeriod: dict?.fossils?.periodLabel || "Période",
    geologicalStage: dict?.fossils?.stageLabel || "Étage",
    minPrice: "Prix min",
    maxPrice: "Prix max",
  };

  const activeFilterEntries = Array.from(searchParams.entries()).filter(
    ([key, value]) => {
      if (key === "page" || key === "sort" || !value || value === "all")
        return false;
      if (
        key === "minPrice" &&
        value === (filterOptions.minPrice || 0).toString()
      )
        return false;
      if (
        key === "maxPrice" &&
        value === (filterOptions.maxPrice || 1000).toString()
      )
        return false;
      return true;
    },
  );
  const activeFiltersCount = activeFilterEntries.length;

  const clearAllFilters = () => {
    useFossilStore.getState().resetFilters();
    window.history.pushState(null, "", `/${lang}/fossiles`);
  };

  const removeFilterChip = (key: string) => {
    const params = new URLSearchParams(window.location.search);
    params.delete(key);
    params.delete("page");
    useFossilStore.getState().updateFilters({ [key]: undefined });
    window.history.pushState(
      null,
      "",
      `/${lang}/fossiles${params.toString() ? `?${params.toString()}` : ""}`,
    );
  };

  const updatePageParam = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const query = params.toString();
    window.history.pushState(
      null,
      "",
      `/${lang}/fossiles${query ? `?${query}` : ""}`,
    );
  };

  const handleNextPage = () => {
    goToNextPage();
    updatePageParam(currentPage + 1);
  };

  const handlePrevPage = () => {
    goToPrevPage();
    updatePageParam(Math.max(1, currentPage - 1));
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === "default") {
      params.delete("sort");
      useFossilStore.getState().updateFilters({ sort: undefined });
    } else {
      params.set("sort", value);
      useFossilStore.getState().updateFilters({ sort: value });
    }
    window.history.pushState(
      null,
      "",
      `/${lang}/fossiles?${params.toString()}`,
    );
  };

  return (
    <div className="group space-y-4 sm:space-y-6 lg:space-y-8">
      {/* En-tête avec filtres mobile - VISIBLE UNIQUEMENT SUR MOBILE */}
      <div className="lg:hidden">
        <div className="bg-[var(--silex)] border border-[var(--parchemin)]/10 rounded-xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            {/* Statistiques compactes */}
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--parchemin)] mb-2">
                {dict?.fossils?.catalogTitle || "Catalogue de fossiles"}
              </h2>
              <p className="text-[var(--parchemin)]/60 text-sm sm:text-base">
                {totalCount > 0 ? (
                  <>
                    <span className="font-bold text-[var(--terracotta)]">
                      {totalCount}
                    </span>{" "}
                    {dict?.fossils?.results || "résultats"}
                  </>
                ) : (
                  dict?.fossils?.noResults || "Aucun résultat trouvé"
                )}
              </p>
            </div>

            {/* Bouton filtres + badge */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-1 border border-[var(--parchemin)]/20 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid-2" ? "default" : "ghost"}
                  size="icon"
                  title={dict?.fossils?.view2Cols || "2 colonnes"}
                  onClick={() => handleViewModeChange("grid-2")}
                  className="h-8 w-8"
                >
                  <Grid2x2 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid-3" ? "default" : "ghost"}
                  size="icon"
                  title={dict?.fossils?.view3Cols || "3 colonnes"}
                  onClick={() => handleViewModeChange("grid-3")}
                  className="h-8 w-8"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid-4" ? "default" : "ghost"}
                  size="icon"
                  title={dict?.fossils?.view4Cols || "4 colonnes"}
                  onClick={() => handleViewModeChange("grid-4")}
                  className="h-8 w-8"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  title={dict?.fossils?.viewList || "Liste"}
                  onClick={() => handleViewModeChange("list")}
                  className="h-8 w-8"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Select
                value={searchParams.get("sort") || "default"}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-full sm:w-[200px] border-[var(--parchemin)]/20 bg-[var(--silex)] text-[var(--parchemin)] focus:ring-[var(--terracotta)]">
                  <SelectValue placeholder="Trier par..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2321] text-[var(--parchemin)] border-[#d4af37]/20 shadow-2xl z-[100] opacity-100">
                  <SelectItem
                    value="default"
                    className="focus:bg-[var(--terracotta)]/10 focus:text-[var(--parchemin)]"
                  >
                    Par défaut
                  </SelectItem>
                  <SelectItem
                    value="name_asc"
                    className="focus:bg-[var(--terracotta)]/10 focus:text-[var(--parchemin)]"
                  >
                    Nom (A-Z)
                  </SelectItem>
                  <SelectItem
                    value="name_desc"
                    className="focus:bg-[var(--terracotta)]/10 focus:text-[var(--parchemin)]"
                  >
                    Nom (Z-A)
                  </SelectItem>
                  <SelectItem
                    value="price_asc"
                    className="focus:bg-[var(--terracotta)]/10 focus:text-[var(--parchemin)]"
                  >
                    Prix croissant
                  </SelectItem>
                  <SelectItem
                    value="price_desc"
                    className="focus:bg-[var(--terracotta)]/10 focus:text-[var(--parchemin)]"
                  >
                    Prix décroissant
                  </SelectItem>
                </SelectContent>
              </Select>

              <FossilesFiltersMobile
                filterOptions={filterOptions}
                lang={lang}
                dict={dict}
                activeFiltersCount={activeFiltersCount}
                onClearFilters={clearAllFilters}
              />
            </div>

            {/* Puces de filtres actifs - mobile */}
            {activeFilterEntries.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {activeFilterEntries.map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => removeFilterChip(key)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--terracotta)]/15 border border-[var(--terracotta)]/30 text-[var(--parchemin)] text-xs hover:bg-[var(--terracotta)]/25 transition-colors duration-200"
                  >
                    <span className="text-[var(--parchemin)]/60">
                      {filterLabels[key] || key}:
                    </span>
                    <span className="font-medium max-w-[8rem] truncate">
                      {value}
                    </span>
                    <X className="w-3 h-3 flex-shrink-0" />
                  </button>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-[var(--parchemin)]/50 hover:text-red-400 underline underline-offset-2 transition-colors"
                >
                  {dict?.fossils?.clearFilters || "Tout effacer"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layout principal - DESKTOP/TABLET avec sidebar */}
      <div className="hidden lg:flex gap-8 min-h-screen">
        {/* Sidebar de filtres fixe - DESKTOP SEULEMENT */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-6">
            <FossilesFilters
              filterOptions={filterOptions}
              lang={lang}
              dict={dict}
            />
          </div>
        </div>

        {/* Contenu principal desktop */}
        <div className="flex-1 space-y-6">
          {/* En-tête avec statistiques - DESKTOP */}
          <div className="bg-[var(--silex)] border border-[var(--parchemin)]/10 rounded-xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-3xl font-serif font-bold text-[var(--parchemin)] mb-2">
                  {dict?.fossils?.catalogTitle || "Catalogue de fossiles"}
                </h2>
                <p className="text-[var(--parchemin)]/60 text-lg">
                  {totalCount > 0 ? (
                    <>
                      {dict?.fossils?.showingResults || "Affichage de"}{" "}
                      <span className="font-bold text-[var(--terracotta)]">
                        {(currentPage - 1) * 20 + 1}-
                        {Math.min(currentPage * 20, totalCount)}
                      </span>{" "}
                      {dict?.fossils?.of || "sur"}{" "}
                      <span className="font-bold text-[var(--parchemin)]">
                        {totalCount}
                      </span>{" "}
                      {dict?.fossils?.results || "résultats"}
                    </>
                  ) : (
                    dict?.fossils?.noResults || "Aucun résultat trouvé"
                  )}
                </p>
              </div>

              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[var(--terracotta)] px-4 py-2 text-sm font-semibold text-[var(--parchemin)] shadow-lg">
                  <Filter className="w-4 h-4" />
                  {activeFiltersCount}{" "}
                  {dict?.fossils?.activeFilters || (activeFiltersCount > 1 ? "filtres actifs" : "filtre actif")}
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-col items-end gap-3 border-t border-[var(--parchemin)]/10 pt-4">
              <div className="flex items-center gap-1 border border-[var(--parchemin)]/20 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid-2" ? "default" : "ghost"}
                    size="icon"
                    title={dict?.fossils?.view2Cols || "2 colonnes"}
                    onClick={() => handleViewModeChange("grid-2")}
                    className="h-8 w-8"
                  >
                    <Grid2x2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid-3" ? "default" : "ghost"}
                    size="icon"
                    title={dict?.fossils?.view3Cols || "3 colonnes"}
                    onClick={() => handleViewModeChange("grid-3")}
                    className="h-8 w-8"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid-4" ? "default" : "ghost"}
                    size="icon"
                    title={dict?.fossils?.view4Cols || "4 colonnes"}
                    onClick={() => handleViewModeChange("grid-4")}
                    className="h-8 w-8"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    title={dict?.fossils?.viewList || "Liste"}
                    onClick={() => handleViewModeChange("list")}
                    className="h-8 w-8"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <Select
                  value={searchParams.get("sort") || "default"}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[200px] border-[var(--parchemin)]/20 bg-[var(--silex)] text-[var(--parchemin)] focus:ring-[var(--terracotta)]">
                    <SelectValue placeholder="Trier par..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2321] text-[var(--parchemin)] border-[#d4af37]/20 shadow-2xl z-[100] opacity-100">
                    <SelectItem
                      value="default"
                      className="focus:bg-[var(--terracotta)]/10 focus:text-[var(--parchemin)]"
                    >
                      Par défaut
                    </SelectItem>
                    <SelectItem
                      value="name_asc"
                      className="focus:bg-[var(--terracotta)]/10 focus:text-[var(--parchemin)]"
                    >
                      Nom (A-Z)
                    </SelectItem>
                    <SelectItem
                      value="name_desc"
                      className="focus:bg-[var(--terracotta)]/10 focus:text-[var(--parchemin)]"
                    >
                      Nom (Z-A)
                    </SelectItem>
                    <SelectItem
                      value="price_asc"
                      className="focus:bg-[var(--terracotta)]/10 focus:text-[var(--parchemin)]"
                    >
                      Prix croissant
                    </SelectItem>
                    <SelectItem
                      value="price_desc"
                      className="focus:bg-[var(--terracotta)]/10 focus:text-[var(--parchemin)]"
                    >
                      Prix décroissant
                    </SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>

          {/* Puces de filtres actifs - desktop */}
          {activeFilterEntries.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 -mt-2">
              {activeFilterEntries.map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => removeFilterChip(key)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--terracotta)]/15 border border-[var(--terracotta)]/30 text-[var(--parchemin)] text-sm hover:bg-[var(--terracotta)]/25 transition-colors duration-200"
                >
                  <span className="text-[var(--parchemin)]/60">
                    {filterLabels[key] || key}:
                  </span>
                  <span className="font-medium max-w-[10rem] truncate">
                    {value}
                  </span>
                  <X className="w-3 h-3 flex-shrink-0" />
                </button>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm text-[var(--parchemin)]/50 hover:text-red-400 underline underline-offset-2 transition-colors"
              >
                {dict?.fossils?.clearFilters || "Tout effacer"}
              </button>
            </div>
          )}

          {/* Grille des fossiles desktop */}
          {isLoading && fossils.length === 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-8 w-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col bg-[#1a2321] border border-[var(--parchemin)]/10 rounded-xl overflow-hidden animate-pulse shadow-md"
                >
                  <div className="w-full aspect-[4/3] bg-white/5"></div>
                  <div className="p-4 lg:p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="h-6 bg-white/5 rounded-md w-2/5"></div>
                      <div className="h-5 bg-white/5 rounded-md w-1/4"></div>
                    </div>
                    <div className="h-4 bg-white/5 rounded-md w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded-md w-1/2"></div>
                    <div className="h-10 bg-white/5 rounded-md w-full mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : fossils.length > 0 ? (
            <>
              {viewMode === "list" ? (
                <div className="flex flex-col gap-3">
                  {fossils.map((fossil) => (
                    <FossilListItem
                      key={fossil.id}
                      fossil={fossil}
                      dict={dict}
                      lang={lang}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className={`grid grid-cols-2 ${desktopGridColsClass[viewMode]} gap-4 lg:gap-8 transition-opacity duration-200 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {fossils.map((fossil) => (
                    <FossilCard
                      key={fossil.id}
                      fossil={fossil}
                      dict={dict}
                      lang={lang}
                      density={viewMode === "grid-4" ? "dense" : viewMode === "grid-3" ? "compact" : "comfortable"}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* État vide desktop */
            <div className="bg-[var(--silex)] border border-[var(--parchemin)]/10 rounded-xl p-16 shadow-xl backdrop-blur-sm text-center">
              <div className="max-w-md mx-auto">
                <div className="relative w-20 h-20 bg-[var(--parchemin)]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Search className="w-10 h-10 text-[var(--parchemin)]/40" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--terracotta)] rounded-full animate-ping"></div>
                </div>
                <h3 className="text-2xl font-serif font-bold text-[var(--parchemin)] mb-3">
                  {dict?.fossils?.empty || "Aucun fossile trouvé"}
                </h3>
                <p className="text-[var(--parchemin)]/60 mb-8 text-lg leading-relaxed">
                  {dict?.fossils?.emptyDescription ||
                    "Aucun fossile ne correspond à vos critères de recherche."}
                </p>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="border-[var(--parchemin)]/20 text-[var(--parchemin)] hover:border-[var(--terracotta)]/50 hover:bg-[var(--terracotta)]/10 transform hover:scale-105 transition-all duration-200 shadow-md"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {dict?.fossils?.clearFilters || "Effacer les filtres"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal mobile - SANS SIDEBAR */}
      <div className="lg:hidden space-y-4 sm:space-y-6">
        {/* Grille des fossiles mobile avec marges */}
        {isLoading && fossils.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 px-1 sm:px-0 w-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col bg-[#1a2321] border border-[var(--parchemin)]/10 rounded-xl overflow-hidden animate-pulse shadow-md"
              >
                <div className="w-full aspect-square bg-white/5"></div>
                <div className="p-3 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="h-4 bg-white/5 rounded-md w-1/2"></div>
                    <div className="h-3 bg-white/5 rounded-md w-1/4"></div>
                  </div>
                  <div className="h-3 bg-white/5 rounded-md w-3/4"></div>
                  <div className="h-8 bg-white/5 rounded-md w-full mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : fossils.length > 0 ? (
          <>
            {viewMode === "list" ? (
              <div className="flex flex-col gap-3 px-1 sm:px-0">
                {fossils.map((fossil) => (
                  <FossilListItem
                    key={fossil.id}
                    fossil={fossil}
                    dict={dict}
                    lang={lang}
                  />
                ))}
              </div>
            ) : (
              <div className={`grid grid-cols-2 gap-3 sm:gap-6 px-1 sm:px-0 transition-opacity duration-200 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
                {fossils.map((fossil) => (
                  <FossilCard
                    key={fossil.id}
                    fossil={fossil}
                    dict={dict}
                    lang={lang}
                  />
                ))}
              </div>
            )}

          </>
        ) : (
          /* État vide mobile */
          <div className="bg-[var(--silex)] border border-[var(--parchemin)]/10 rounded-xl p-8 sm:p-12 shadow-xl backdrop-blur-sm text-center mx-2 sm:mx-0">
            <div className="max-w-md mx-auto">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-[var(--parchemin)]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--parchemin)]/40" />
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-[var(--terracotta)] rounded-full animate-ping"></div>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--parchemin)] mb-3">
                {dict?.fossils?.empty || "Aucun fossile trouvé"}
              </h3>
              <p className="text-[var(--parchemin)]/60 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
                {dict?.fossils?.emptyDescription ||
                  "Aucun fossile ne correspond à vos critères de recherche."}
              </p>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="border-[var(--parchemin)]/20 text-[var(--parchemin)] hover:border-[var(--terracotta)]/50 hover:bg-[var(--terracotta)]/10 transform hover:scale-105 transition-all duration-200 shadow-md"
                >
                  <X className="w-4 h-4 mr-2" />
                  {dict?.fossils?.clearFilters || "Effacer les filtres"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pagination flottante, fixée en bas à droite */}
      {mounted &&
        !isLoading &&
        fossils.length > 0 &&
        (currentPage > 1 || hasNextPage) &&
        createPortal(
        <div className="fixed bottom-4 right-4 z-30">
          <div className="flex items-center gap-1.5 bg-[var(--silex)]/95 border border-[var(--parchemin)]/20 rounded-full px-2 py-1.5 shadow-xl backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              aria-label={dict?.fossils?.previous || "Précédent"}
              className="h-8 w-8 rounded-full text-[var(--parchemin)] hover:bg-[var(--terracotta)]/20 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-1.5 text-xs font-medium text-[var(--parchemin)]/80 whitespace-nowrap">
              {currentPage}
              {totalPages > 1 ? ` / ${totalPages}` : ""}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextPage}
              disabled={!hasNextPage}
              aria-label={dict?.fossils?.next || "Suivant"}
              className="h-8 w-8 rounded-full text-[var(--parchemin)] hover:bg-[var(--terracotta)]/20 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>,
        document.body,
        )}
    </div>
  );
}
