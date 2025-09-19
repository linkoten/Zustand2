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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, X, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterOptions } from "@/types/productType";

interface FossilesFiltersProps {
  filterOptions: FilterOptions;
  lang?: "en" | "fr";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: any;
}

export default function FossilesFilters({
  filterOptions,
  lang = "fr",
  dict,
}: FossilesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Compter les filtres actifs
  const activeFiltersCount = [
    selectedCategory !== "all",
    selectedCountry !== "all",
    selectedLocality !== "all",
    selectedPeriod !== "all",
    selectedStage !== "all",
    searchTerm.trim() !== "",
  ].filter(Boolean).length;

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
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedCountry("all");
    setSelectedLocality("all");
    setSelectedPeriod("all");
    setSelectedStage("all");
    setSearchTerm("");
    router.push(`/${lang}/fossiles`);
  };

  return (
    <Card className="max-h-[calc(100vh-3rem)] shadow-xl border-0 bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm flex flex-col">
      {/* Header fixe avec hauteur minimale */}
      <CardHeader className="pb-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg flex-shrink-0 min-h-[100px]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="relative">
              <Filter className="w-5 h-5 text-amber-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
            </div>
            {dict?.fossils?.filters || "Filtres"}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md animate-pulse">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Contenu scrollable avec hauteur calculée */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <CardContent className="space-y-6 p-6">
            {/* Recherche améliorée */}
            <div className="space-y-3">
              <Label
                htmlFor="search"
                className="text-sm font-semibold text-slate-700 flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-amber-600" />
                {dict?.fossils?.searchLabel || "Rechercher"}
              </Label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-hover:text-amber-500 transition-colors duration-200" />
                  <Input
                    id="search"
                    placeholder={
                      dict?.fossils?.searchPlaceholder ||
                      "Rechercher un fossile..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-amber-500 focus:ring-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-slate-400 hover:text-slate-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Séparateur visuel */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>

            {/* Filtres avec design amélioré */}
            <div className="space-y-5">
              {/* Catégorie */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  {dict?.fossils?.categoryLabel || "Catégorie"}
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="border-slate-200 focus:border-amber-500 focus:ring-amber-500 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
                    <SelectValue
                      placeholder={
                        dict?.fossils?.allCategories || "Toutes les catégories"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 shadow-xl">
                    <SelectItem value="all" className="hover:bg-amber-50">
                      {dict?.fossils?.allCategories || "Toutes les catégories"}
                    </SelectItem>
                    {filterOptions.categories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="hover:bg-amber-50"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pays */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {dict?.fossils?.countryLabel || "Pays d'origine"}
                </Label>
                <Select
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                >
                  <SelectTrigger className="border-slate-200 focus:border-amber-500 focus:ring-amber-500 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
                    <SelectValue
                      placeholder={
                        dict?.fossils?.allCountries || "Tous les pays"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 shadow-xl">
                    <SelectItem value="all" className="hover:bg-amber-50">
                      {dict?.fossils?.allCountries || "Tous les pays"}
                    </SelectItem>
                    {filterOptions.countries.map((country) => (
                      <SelectItem
                        key={country}
                        value={country}
                        className="hover:bg-amber-50"
                      >
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Localité */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {dict?.fossils?.localityLabel || "Localité"}
                </Label>
                <Select
                  value={selectedLocality}
                  onValueChange={setSelectedLocality}
                >
                  <SelectTrigger className="border-slate-200 focus:border-amber-500 focus:ring-amber-500 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
                    <SelectValue
                      placeholder={
                        dict?.fossils?.allLocalities || "Toutes les localités"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 shadow-xl">
                    <SelectItem value="all" className="hover:bg-amber-50">
                      {dict?.fossils?.allLocalities || "Toutes les localités"}
                    </SelectItem>
                    {filterOptions.localities.map((locality) => (
                      <SelectItem
                        key={locality}
                        value={locality}
                        className="hover:bg-amber-50"
                      >
                        {locality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Période géologique */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  {dict?.fossils?.periodLabel || "Période géologique"}
                </Label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="border-slate-200 focus:border-amber-500 focus:ring-amber-500 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
                    <SelectValue
                      placeholder={
                        dict?.fossils?.allPeriods || "Toutes les périodes"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 shadow-xl">
                    <SelectItem value="all" className="hover:bg-amber-50">
                      {dict?.fossils?.allPeriods || "Toutes les périodes"}
                    </SelectItem>
                    {filterOptions.geologicalPeriods.map((period) => (
                      <SelectItem
                        key={period}
                        value={period}
                        className="hover:bg-amber-50"
                      >
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Étage géologique */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  {dict?.fossils?.stageLabel || "Étage géologique"}
                </Label>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="border-slate-200 focus:border-amber-500 focus:ring-amber-500 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
                    <SelectValue
                      placeholder={
                        dict?.fossils?.allStages || "Tous les étages"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 shadow-xl">
                    <SelectItem value="all" className="hover:bg-amber-50">
                      {dict?.fossils?.allStages || "Tous les étages"}
                    </SelectItem>
                    {filterOptions.geologicalStages.map((stage) => (
                      <SelectItem
                        key={stage}
                        value={stage}
                        className="hover:bg-amber-50"
                      >
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </ScrollArea>
      </div>

      {/* Footer fixe avec hauteur minimale */}
      <CardFooter className="flex flex-col gap-3 p-6 border-t bg-gradient-to-r from-white to-slate-50 flex-shrink-0 min-h-[140px]">
        <Button
          onClick={applyFilters}
          className="w-full bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 hover:from-amber-700 hover:via-amber-800 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border-0"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {dict?.fossils?.applyFilters || "Appliquer les filtres"}
        </Button>
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full border-slate-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all duration-200 transform hover:scale-[1.02]"
          >
            <X className="w-4 h-4 mr-2" />
            {dict?.fossils?.clear || "Effacer"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
