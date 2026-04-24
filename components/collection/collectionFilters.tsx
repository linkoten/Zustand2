"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { EnrichedSpeciesFacet } from "@/types/collectionType";

const CATEGORIES = [
  { value: "TRILOBITE", label: "Trilobite" },
  { value: "AMMONITE", label: "Ammonite" },
  { value: "DENT", label: "Dent" },
  { value: "ECHINODERME", label: "Échinoderme" },
  { value: "POISSON", label: "Poisson" },
  { value: "VERTEBRE", label: "Vertébré" },
  { value: "GASTROPODE", label: "Gastéropode" },
  { value: "AUTRE_ARTHROPODE", label: "Autre arthropode" },
  { value: "AUTRES", label: "Autres" },
] as const;

const GEO_PERIODS = [
  { value: "CAMBRIEN", label: "Cambrien" },
  { value: "ORDOVICIEN", label: "Ordovicien" },
  { value: "SILURIEN", label: "Silurien" },
  { value: "DEVONIEN", label: "Dévonien" },
  { value: "CARBONIFERE", label: "Carbonifère" },
  { value: "PERMIEN", label: "Permien" },
  { value: "TRIAS", label: "Trias" },
  { value: "JURASSIQUE", label: "Jurassique" },
  { value: "CRETACE", label: "Crétacé" },
  { value: "PALEOGENE", label: "Paléogène" },
  { value: "NEOGENE", label: "Néogène" },
  { value: "QUATERNAIRE", label: "Quaternaire" },
] as const;

const STATUS_OPTIONS = [
  { value: "OWNED", label: "Possédés" },
  { value: "WISHLIST", label: "Wishlist" },
  { value: "NONE", label: "Non collectés" },
] as const;

interface Locality {
  id: number;
  name: string;
}

interface CollectionFiltersProps {
  localities: Locality[];
  facets: EnrichedSpeciesFacet[];
  isLoggedIn: boolean;
}

export default function CollectionFilters({
  localities,
  facets,
  isLoggedIn,
}: CollectionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = (key: string) => searchParams.get(key) ?? "";

  // ── Search: local state + 1 second debounce ───────────────────────────────
  const [searchValue, setSearchValue] = useState(get("search"));
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync search box when URL is changed externally (e.g. "clear all")
  useEffect(() => {
    setSearchValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("search", value);
      else params.delete("search");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 1000);
  }

  // ── Generic multi-key push ─────────────────────────────────────────────────
  function pushParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  // ── Active selections ──────────────────────────────────────────────────────
  const activeLocality = get("localityId");
  const activeCountry = get("country");
  const activePeriod = get("geologicalPeriod");
  const activeStage = get("geologicalStage");
  const activeCategory = get("category");
  const activeStatus = get("status");

  // ── Cascading: for filter X, apply all OTHER active filters ───────────────
  function compatible(
    exclude: "locality" | "country" | "period" | "stage",
  ): EnrichedSpeciesFacet[] {
    return facets.filter((f) => {
      if (
        exclude !== "locality" &&
        activeLocality &&
        f.localityId !== Number(activeLocality)
      )
        return false;
      if (
        exclude !== "country" &&
        activeCountry &&
        f.countryOfOrigin !== activeCountry
      )
        return false;
      if (
        exclude !== "period" &&
        activePeriod &&
        f.geologicalPeriod !== activePeriod
      )
        return false;
      if (
        exclude !== "stage" &&
        activeStage &&
        f.geologicalStage !== activeStage
      )
        return false;
      return true;
    });
  }

  const availableLocalityIds = new Set(
    compatible("locality").map((f) => f.localityId),
  );
  const availableCountries = [
    ...new Set(compatible("country").map((f) => f.countryOfOrigin)),
  ].sort();
  const availablePeriods = new Set(
    compatible("period").map((f) => f.geologicalPeriod),
  );
  const availableStages = [
    ...new Set(compatible("stage").map((f) => f.geologicalStage)),
  ].sort();

  // ── Cascade-aware handlers (auto-clear children when parent changes) ───────
  function handleLocalityChange(value: string) {
    const updates: Record<string, string> = {
      localityId: value === "all" ? "" : value,
    };
    if (value && value !== "all") {
      const lf = facets.filter((f) => f.localityId === Number(value));
      const lPeriods = new Set(lf.map((f) => f.geologicalPeriod));
      const lCountries = new Set(lf.map((f) => f.countryOfOrigin));
      const lStages = new Set(lf.map((f) => f.geologicalStage));
      if (activePeriod && !lPeriods.has(activePeriod)) {
        updates.geologicalPeriod = "";
        updates.geologicalStage = "";
      }
      if (activeCountry && !lCountries.has(activeCountry)) updates.country = "";
      if (activeStage && !lStages.has(activeStage))
        updates.geologicalStage = "";
    }
    pushParams(updates);
  }

  function handleCountryChange(value: string) {
    const updates: Record<string, string> = {
      country: value === "all" ? "" : value,
    };
    if (value && value !== "all") {
      const cf = facets.filter((f) => f.countryOfOrigin === value);
      const cPeriods = new Set(cf.map((f) => f.geologicalPeriod));
      const cStages = new Set(cf.map((f) => f.geologicalStage));
      if (activePeriod && !cPeriods.has(activePeriod)) {
        updates.geologicalPeriod = "";
        updates.geologicalStage = "";
      } else if (activeStage && !cStages.has(activeStage))
        updates.geologicalStage = "";
    }
    pushParams(updates);
  }

  function handlePeriodChange(value: string) {
    const updates: Record<string, string> = {
      geologicalPeriod: value === "all" ? "" : value,
    };
    if (value && value !== "all") {
      const pf = facets.filter((f) => f.geologicalPeriod === value);
      const pStages = new Set(pf.map((f) => f.geologicalStage));
      if (activeStage && !pStages.has(activeStage))
        updates.geologicalStage = "";
    } else {
      updates.geologicalStage = ""; // clear stage when period is cleared
    }
    pushParams(updates);
  }

  // ── Has active filters? ────────────────────────────────────────────────────
  const hasFilters = [
    activeCategory,
    activeLocality,
    activeCountry,
    activePeriod,
    activeStage,
    activeStatus,
    get("search"),
  ].some(Boolean);

  const filterSection = (label: string, dimmed?: boolean) => (
    <p
      className={`text-xs uppercase tracking-wider font-medium ${dimmed ? "text-parchemin/25" : "text-parchemin/50"}`}
    >
      {label}
    </p>
  );

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="space-y-1.5">
        {filterSection("Recherche")}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchemin/40" />
          <Input
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Genre, espèce, nom commun..."
            className="pl-9 pr-8 bg-silex/50 border-silex/30 text-parchemin"
          />
          {searchValue && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-parchemin/40 hover:text-parchemin"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        {filterSection("Catégorie")}
        <Select
          value={activeCategory}
          onValueChange={(v) => pushParams({ category: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-full bg-silex/50 border-silex/30 text-parchemin text-sm h-9">
            <SelectValue placeholder="Toutes catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Locality */}
      <div className="space-y-1.5">
        {filterSection("Gisement")}
        <Select value={activeLocality} onValueChange={handleLocalityChange}>
          <SelectTrigger className="w-full bg-silex/50 border-silex/30 text-parchemin text-sm h-9">
            <SelectValue placeholder="Tous les gisements" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les gisements</SelectItem>
            {localities
              .filter((l) => availableLocalityIds.has(l.id))
              .map((l) => (
                <SelectItem key={l.id} value={String(l.id)}>
                  {l.name}
                </SelectItem>
              ))}
            {localities
              .filter((l) => !availableLocalityIds.has(l.id))
              .map((l) => (
                <SelectItem
                  key={l.id}
                  value={String(l.id)}
                  disabled
                  className="opacity-30"
                >
                  {l.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Country */}
      <div className="space-y-1.5">
        {filterSection("Pays")}
        <Select value={activeCountry} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-full bg-silex/50 border-silex/30 text-parchemin text-sm h-9">
            <SelectValue placeholder="Tous les pays" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les pays</SelectItem>
            {availableCountries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Geological period */}
      <div className="space-y-1.5">
        {filterSection("Période géologique")}
        <Select value={activePeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-full bg-silex/50 border-silex/30 text-parchemin text-sm h-9">
            <SelectValue placeholder="Toutes périodes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes périodes</SelectItem>
            {GEO_PERIODS.filter((p) => availablePeriods.has(p.value)).map(
              (p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ),
            )}
            {GEO_PERIODS.filter((p) => !availablePeriods.has(p.value)).map(
              (p) => (
                <SelectItem
                  key={p.value}
                  value={p.value}
                  disabled
                  className="opacity-30"
                >
                  {p.label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Geological stage */}
      <div className="space-y-1.5">
        {filterSection("Étage stratigraphique", availableStages.length === 0)}
        <Select
          value={activeStage}
          onValueChange={(v) =>
            pushParams({ geologicalStage: v === "all" ? "" : v })
          }
          disabled={availableStages.length === 0}
        >
          <SelectTrigger className="w-full bg-silex/50 border-silex/30 text-parchemin text-sm h-9 disabled:opacity-40">
            <SelectValue
              placeholder={
                availableStages.length === 0
                  ? "Choisir une période d'abord"
                  : "Tous les étages"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les étages</SelectItem>
            {availableStages.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Collection status (logged in only) */}
      {isLoggedIn && (
        <div className="space-y-1.5">
          {filterSection("Ma collection")}
          <Select
            value={activeStatus}
            onValueChange={(v) => pushParams({ status: v === "all" ? "" : v })}
          >
            <SelectTrigger className="w-full bg-silex/50 border-silex/30 text-parchemin text-sm h-9">
              <SelectValue placeholder="Tout voir" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout voir</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Active badges + clear all */}
      {hasFilters && (
        <div className="space-y-2 pt-2 border-t border-silex/20">
          <div className="flex flex-wrap gap-1.5">
            {activeCategory && (
              <Badge
                variant="outline"
                className="text-xs border-silex/30 text-parchemin/70 gap-1 cursor-pointer"
                onClick={() => pushParams({ category: "" })}
              >
                {CATEGORIES.find((c) => c.value === activeCategory)?.label}{" "}
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {activeLocality && (
              <Badge
                variant="outline"
                className="text-xs border-silex/30 text-parchemin/70 gap-1 cursor-pointer"
                onClick={() => handleLocalityChange("all")}
              >
                {localities.find((l) => String(l.id) === activeLocality)?.name}{" "}
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {activeCountry && (
              <Badge
                variant="outline"
                className="text-xs border-silex/30 text-parchemin/70 gap-1 cursor-pointer"
                onClick={() => pushParams({ country: "" })}
              >
                {activeCountry} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {activePeriod && (
              <Badge
                variant="outline"
                className="text-xs border-silex/30 text-parchemin/70 gap-1 cursor-pointer"
                onClick={() => handlePeriodChange("all")}
              >
                {GEO_PERIODS.find((p) => p.value === activePeriod)?.label}{" "}
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {activeStage && (
              <Badge
                variant="outline"
                className="text-xs border-silex/30 text-parchemin/70 gap-1 cursor-pointer"
                onClick={() => pushParams({ geologicalStage: "" })}
              >
                {activeStage} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {activeStatus && (
              <Badge
                variant="outline"
                className="text-xs border-silex/30 text-parchemin/70 gap-1 cursor-pointer"
                onClick={() => pushParams({ status: "" })}
              >
                {STATUS_OPTIONS.find((s) => s.value === activeStatus)?.label}{" "}
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchValue("");
              router.push(pathname);
            }}
            className="w-full text-parchemin/50 hover:text-parchemin text-xs h-7"
          >
            <X className="w-3 h-3 mr-1" />
            Tout effacer
          </Button>
        </div>
      )}
    </div>
  );
}
