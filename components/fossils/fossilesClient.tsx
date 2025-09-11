"use client";

import { useState, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { FossilCard } from "./fossil-card";
import { SerializedProduct } from "@/types/type";
import { FilterOptions } from "@/types/productType";

interface FossilesClientProps {
  fossils: SerializedProduct[];
  filterOptions: FilterOptions;
  lang?: "en" | "fr";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: any;
}
export default function FossilesClient({
  fossils,
  filterOptions,
  lang = "fr",
  dict,
}: FossilesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
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
  const [showFilters, setShowFilters] = useState(false);

  // Filtrage des fossiles...
  const filteredFossils = useMemo(() => {
    return fossils.filter((fossil) => {
      const matchesSearch = fossil.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || fossil.category === selectedCategory;
      const matchesCountry =
        selectedCountry === "all" || fossil.countryOfOrigin === selectedCountry;
      const matchesLocality =
        selectedLocality === "all" ||
        fossil.locality?.name === selectedLocality;
      const matchesPeriod =
        selectedPeriod === "all" || fossil.geologicalPeriod === selectedPeriod;
      const matchesStage =
        selectedStage === "all" || fossil.geologicalStage === selectedStage;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCountry &&
        matchesLocality &&
        matchesPeriod &&
        matchesStage
      );
    });
  }, [
    fossils,
    searchTerm,
    selectedCategory,
    selectedCountry,
    selectedLocality,
    selectedPeriod,
    selectedStage,
  ]);

  const applyFilters = () => {
    const params = new URLSearchParams();
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

    router.push(`/fossiles?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedCountry("all");
    setSelectedLocality("all");
    setSelectedPeriod("all");
    setSelectedStage("all");
    setSearchTerm("");
    router.push("/fossiles");
  };

  return (
    <div className="space-y-6">
      {/* Barre de recherche et filtres */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">
              {dict?.fossils?.searchLabel || "Rechercher"}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                placeholder={
                  dict?.fossils?.searchPlaceholder || "Rechercher un fossile..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {dict?.fossils?.filters || "Filtres"}
          </Button>
        </div>

        {/* Filtres */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {dict?.fossils?.filters || "Filtres"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">
                    {dict?.fossils?.categoryLabel || "Catégorie"}
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          dict?.fossils?.allCategories ||
                          "Toutes les catégories"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {dict?.fossils?.allCategories ||
                          "Toutes les catégories"}
                      </SelectItem>
                      {filterOptions.categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="country">
                    {dict?.fossils?.countryLabel ||
                      (lang === "fr" ? "Pays d'origine" : "Country of origin")}
                  </Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          dict?.fossils?.allCountries ||
                          (lang === "fr" ? "Tous les pays" : "All countries")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {dict?.fossils?.allCountries ||
                          (lang === "fr" ? "Tous les pays" : "All countries")}
                      </SelectItem>
                      {filterOptions.countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="locality">
                    {dict?.fossils?.localityLabel ||
                      (lang === "fr" ? "Localité" : "Locality")}
                  </Label>
                  <Select
                    value={selectedLocality}
                    onValueChange={setSelectedLocality}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          dict?.fossils?.allLocalities ||
                          (lang === "fr"
                            ? "Toutes les localités"
                            : "All localities")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {dict?.fossils?.allLocalities ||
                          (lang === "fr"
                            ? "Toutes les localités"
                            : "All localities")}
                      </SelectItem>
                      {filterOptions.localities.map((locality) => (
                        <SelectItem key={locality} value={locality}>
                          {locality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="period">
                    {dict?.fossils?.periodLabel ||
                      (lang === "fr"
                        ? "Période géologique"
                        : "Geological period")}
                  </Label>
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          dict?.fossils?.allPeriods ||
                          (lang === "fr"
                            ? "Toutes les périodes"
                            : "All periods")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {dict?.fossils?.allPeriods ||
                          (lang === "fr"
                            ? "Toutes les périodes"
                            : "All periods")}
                      </SelectItem>
                      {filterOptions.geologicalPeriods.map((period) => (
                        <SelectItem key={period} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="stage">
                    {dict?.fossils?.stageLabel ||
                      (lang === "fr" ? "Étage géologique" : "Geological stage")}
                  </Label>
                  <Select
                    value={selectedStage}
                    onValueChange={setSelectedStage}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          dict?.fossils?.allStages ||
                          (lang === "fr" ? "Tous les étages" : "All stages")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {dict?.fossils?.allStages ||
                          (lang === "fr" ? "Tous les étages" : "All stages")}
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

              <div className="flex gap-2">
                <Button onClick={applyFilters}>
                  {dict?.fossils?.applyFilters ||
                    (lang === "fr" ? "Appliquer les filtres" : "Apply filters")}
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  {dict?.fossils?.clear ||
                    (lang === "fr" ? "Effacer" : "Clear")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Grille des fossiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFossils.map((fossil) => (
          <FossilCard key={fossil.id} fossil={fossil} dict={dict} lang={lang} />
        ))}
      </div>

      {filteredFossils.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {dict?.fossils?.empty ||
              (lang === "fr"
                ? "Aucun fossile ne correspond à vos critères de recherche."
                : "No fossils match your search criteria.")}
          </p>
          <Button variant="outline" onClick={clearFilters} className="mt-4">
            {dict?.fossils?.clearFilters ||
              (lang === "fr" ? "Effacer les filtres" : "Clear filters")}
          </Button>
        </div>
      )}
    </div>
  );
}
