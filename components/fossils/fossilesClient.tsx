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
import { FossilesClientProps } from "@/types/productType";
import { FossilCard } from "./fossil-card";

export default function FossilesClient({
  fossils,
  filterOptions,
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
            <Label htmlFor="search">Rechercher</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                placeholder="Rechercher un fossile..."
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
            Filtres
          </Button>
        </div>

        {/* Filtres */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {filterOptions.categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="country">Pays d&apos;origine</Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
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

                <div>
                  <Label htmlFor="locality">Localité</Label>
                  <Select
                    value={selectedLocality}
                    onValueChange={setSelectedLocality}
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

                <div>
                  <Label htmlFor="period">Période géologique</Label>
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les périodes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les périodes</SelectItem>
                      {filterOptions.geologicalPeriods.map((period) => (
                        <SelectItem key={period} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="stage">Étage géologique</Label>
                  <Select
                    value={selectedStage}
                    onValueChange={setSelectedStage}
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

              <div className="flex gap-2">
                <Button onClick={applyFilters}>Appliquer les filtres</Button>
                <Button variant="outline" onClick={clearFilters}>
                  Effacer
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
          <FossilCard key={fossil.id} fossil={fossil} />
        ))}
      </div>

      {filteredFossils.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Aucun fossile ne correspond à vos critères de recherche.
          </p>
          <Button variant="outline" onClick={clearFilters} className="mt-4">
            Effacer les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
