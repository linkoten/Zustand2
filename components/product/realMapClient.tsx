"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Package, Globe, X, Filter } from "lucide-react";

// Import dynamique pour éviter SSR sur ProductMap
const ProductMap = dynamic(() => import("@/components/product/productMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-silex/50">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-parchemin/10 rounded-full mx-auto animate-pulse flex items-center justify-center">
          <Globe className="w-8 h-8 text-parchemin/30" />
        </div>
        <p className="text-sm text-parchemin/50">Chargement de la carte…</p>
      </div>
    </div>
  ),
});

const GEOLOGICAL_COLORS: Record<string, string> = {
  CAMBRIEN: "#1A9D6F",
  ORDOVICIEN: "#B3E1B6",
  SILURIEN: "#E6F4A8",
  DEVONIEN: "#CB8C37",
  CARBONIFERE: "#67A599",
  PERMIEN: "#F04028",
  TRIAS: "#81D2E8",
  JURASSIQUE: "#34B2C9",
  CRETACE: "#7FC64E",
  PALEOGENE: "#FD9A52",
  NEOGENE: "#F9F97F",
  QUATERNAIRE: "#F9F97F",
};

interface LocalityData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  geologicalPeriods: string[];
  geologicalStages: string[];
  availableProductCount: number;
}

interface RealMapClientProps {
  localities: LocalityData[];
  lang: "fr" | "en";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export default function RealMapClient({
  localities,
  lang,
  dict,
}: RealMapClientProps) {
  const [search, setSearch] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [flyTo, setFlyTo] = useState<string | undefined>(undefined);
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);

  // Toutes les périodes présentes dans les localités
  const allPeriods = useMemo(() => {
    const set = new Set<string>();
    localities.forEach((loc) => loc.geologicalPeriods.forEach((p) => set.add(p)));
    return Array.from(set).sort();
  }, [localities]);

  // Localités filtrées selon la recherche et la période
  const filteredLocalities = useMemo(() => {
    return localities.filter((loc) => {
      const matchesSearch =
        !search || loc.name.toLowerCase().includes(search.toLowerCase());
      const matchesPeriod =
        !selectedPeriod || loc.geologicalPeriods.includes(selectedPeriod);
      return matchesSearch && matchesPeriod;
    });
  }, [localities, search, selectedPeriod]);

  // Stats
  const totalAvailable = filteredLocalities.reduce(
    (sum, l) => sum + l.availableProductCount,
    0,
  );

  function handleLocalityClick(name: string) {
    setFlyTo(name);
    setSelectedLocalities([name]);
    setTimeout(() => setFlyTo(undefined), 1000);
  }

  function clearFilters() {
    setSearch("");
    setSelectedPeriod(null);
    setSelectedLocalities([]);
  }

  const hasActiveFilters = !!search || !!selectedPeriod;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-silex/60 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-terracotta/20 rounded-lg">
              <MapPin className="w-5 h-5 text-terracotta" />
            </div>
            <div>
              <p className="text-2xl font-black text-parchemin">
                {filteredLocalities.length}
              </p>
              <p className="text-xs text-parchemin/60">
                {lang === "fr" ? "Localités" : "Localities"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-silex/60 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-parchemin">
                {totalAvailable}
              </p>
              <p className="text-xs text-parchemin/60">
                {lang === "fr" ? "Fossiles dispo." : "Fossils available"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-silex/60 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-parchemin">
                {allPeriods.length}
              </p>
              <p className="text-xs text-parchemin/60">
                {lang === "fr" ? "Périodes géol." : "Geol. periods"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-silex/60 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Filter className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-parchemin">
                {selectedPeriod
                  ? filteredLocalities.length
                  : localities.length}
              </p>
              <p className="text-xs text-parchemin/60">
                {lang === "fr" ? "Sites actifs" : "Active sites"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="space-y-3">
        {/* Recherche */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchemin/40" />
            <Input
              placeholder={
                lang === "fr"
                  ? "Rechercher une localité…"
                  : "Search a locality…"
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-silex/60 border-parchemin/20 text-parchemin placeholder:text-parchemin/40 focus:border-terracotta/50"
            />
          </div>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="icon"
              className="border-parchemin/20 text-parchemin/60 hover:text-parchemin hover:bg-silex/60 shrink-0"
              title={lang === "fr" ? "Effacer les filtres" : "Clear filters"}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Filtres par période */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPeriod(null)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
              !selectedPeriod
                ? "bg-terracotta text-primary-foreground border-terracotta"
                : "bg-silex/60 text-parchemin/70 border-parchemin/20 hover:border-parchemin/40"
            }`}
          >
            {lang === "fr" ? "Toutes" : "All"}
          </button>
          {allPeriods.map((period) => (
            <button
              key={period}
              onClick={() =>
                setSelectedPeriod(selectedPeriod === period ? null : period)
              }
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                selectedPeriod === period
                  ? "text-white border-transparent"
                  : "bg-silex/60 text-parchemin/70 border-parchemin/20 hover:border-parchemin/40"
              }`}
              style={
                selectedPeriod === period
                  ? {
                      backgroundColor:
                        GEOLOGICAL_COLORS[period] || "#808080",
                      borderColor: GEOLOGICAL_COLORS[period] || "#808080",
                    }
                  : {}
              }
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Carte + liste côte à côte */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Carte */}
        <div
          className="rounded-2xl overflow-hidden border border-parchemin/10 shadow-2xl"
          style={{ height: 520 }}
        >
          <ProductMap
            localities={filteredLocalities}
            lang={lang}
            dict={dict}
            height={520}
            flyToLocality={flyTo}
            selectedLocalities={selectedLocalities}
            onLocalitySelect={(name) => setSelectedLocalities([name])}
          />
        </div>

        {/* Liste des localités */}
        <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
          {filteredLocalities.length === 0 ? (
            <div className="text-center py-12 text-parchemin/40">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                {lang === "fr" ? "Aucune localité" : "No locality found"}
              </p>
            </div>
          ) : (
            filteredLocalities.map((loc) => (
              <button
                key={loc.id}
                onClick={() => handleLocalityClick(loc.name)}
                className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                  selectedLocalities.includes(loc.name)
                    ? "bg-terracotta/10 border-terracotta/40"
                    : "bg-silex/40 border-parchemin/10 hover:border-parchemin/30 hover:bg-silex/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="font-semibold text-sm text-parchemin leading-tight">
                    {loc.name}
                  </p>
                  {loc.availableProductCount > 0 && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs shrink-0">
                      {loc.availableProductCount}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {loc.geologicalPeriods.slice(0, 2).map((period) => (
                    <span
                      key={period}
                      className="text-[9px] px-1.5 py-0.5 rounded-full text-white font-bold"
                      style={{
                        backgroundColor:
                          GEOLOGICAL_COLORS[period] || "#808080",
                      }}
                    >
                      {period}
                    </span>
                  ))}
                  {loc.geologicalPeriods.length > 2 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-parchemin/10 text-parchemin/50">
                      +{loc.geologicalPeriods.length - 2}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
