"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface FossilesFiltersMobileProps {
  filterOptions: FilterOptions;
  lang?: "en" | "fr";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: any;
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

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [selectedCountry, setSelectedCountry] = useState(
    searchParams.get("countryOfOrigin") || "all"
  );
  const [selectedLocality, setSelectedLocality] = useState(
    searchParams.get("locality") || "all"
  );
  const [selectedPeriod, setSelectedPeriod] = useState(
    searchParams.get("geologicalPeriod") || "all"
  );
  const [selectedStage, setSelectedStage] = useState(
    searchParams.get("geologicalStage") || "all"
  );

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (selectedCategory && selectedCategory !== "all")
      params.set("category", selectedCategory);
    if (selectedCountry && selectedCountry !== "all")
      params.set("countryOfOrigin", selectedCountry);
    if (selectedLocality && selectedLocality !== "all")
      params.set("locality", selectedLocality);
    if (selectedPeriod && selectedPeriod !== "all")
      params.set("geologicalPeriod", selectedPeriod);
    if (selectedStage && selectedStage !== "all")
      params.set("geologicalStage", selectedStage);

    params.set("page", "1");
    router.push(`/${lang}/fossiles?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedCountry("all");
    setSelectedLocality("all");
    setSelectedPeriod("all");
    setSelectedStage("all");
    setSearchTerm("");
    onClearFilters();
    setIsOpen(false);
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
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  {dict?.fossils?.categoryLabel || "Catégorie"}
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="border-slate-200 focus:border-amber-500 focus:ring-amber-500">
                    <SelectValue
                      placeholder={
                        dict?.fossils?.allCategories || "Toutes les catégories"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {dict?.fossils?.allCategories || "Toutes les catégories"}
                    </SelectItem>
                    {filterOptions.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pays */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {dict?.fossils?.countryLabel || "Pays d'origine"}
                </Label>
                <Select
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                >
                  <SelectTrigger className="border-slate-200 focus:border-amber-500 focus:ring-amber-500">
                    <SelectValue
                      placeholder={
                        dict?.fossils?.allCountries || "Tous les pays"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {dict?.fossils?.allCountries || "Tous les pays"}
                    </SelectItem>
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
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {dict?.fossils?.localityLabel || "Localité"}
                </Label>
                <Select
                  value={selectedLocality}
                  onValueChange={setSelectedLocality}
                >
                  <SelectTrigger className="border-slate-200 focus:border-amber-500 focus:ring-amber-500">
                    <SelectValue
                      placeholder={
                        dict?.fossils?.allLocalities || "Toutes les localités"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {dict?.fossils?.allLocalities || "Toutes les localités"}
                    </SelectItem>
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
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  {dict?.fossils?.periodLabel || "Période géologique"}
                </Label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="border-slate-200 focus:border-amber-500 focus:ring-amber-500">
                    <SelectValue
                      placeholder={
                        dict?.fossils?.allPeriods || "Toutes les périodes"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {dict?.fossils?.allPeriods || "Toutes les périodes"}
                    </SelectItem>
                    {filterOptions.geologicalPeriods.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Étage géologique */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  {dict?.fossils?.stageLabel || "Étage géologique"}
                </Label>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="border-slate-200 focus:border-amber-500 focus:ring-amber-500">
                    <SelectValue
                      placeholder={
                        dict?.fossils?.allStages || "Tous les étages"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {dict?.fossils?.allStages || "Tous les étages"}
                    </SelectItem>
                    {filterOptions.geologicalStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex flex-col gap-3 pt-4 border-t border-slate-200">
            <Button
              onClick={applyFilters}
              className="w-full bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 hover:from-amber-700 hover:via-amber-800 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {dict?.fossils?.applyFilters || "Appliquer les filtres"}
            </Button>

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
