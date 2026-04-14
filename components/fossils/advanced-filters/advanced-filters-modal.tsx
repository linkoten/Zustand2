"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlidersHorizontal, Map, Clock, Search, X } from "lucide-react";
import { GeologicalTimeline } from "./geological-timeline";
import { FilterOptions, LocalityMapData } from "@/types/productType";
import { useFossilStore } from "@/stores/fossilStore";

// Chargement dynamique pour éviter le SSR avec Leaflet
const ProductMap = dynamic(() => import("@/components/product/productMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-black/30 rounded-lg flex items-center justify-center border border-terracotta/20">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-terracotta/20 mx-auto animate-pulse" />
        <p className="text-parchemin/50 text-sm">Chargement de la carte...</p>
      </div>
    </div>
  ),
});

interface AdvancedFiltersModalProps {
  filterOptions: FilterOptions;
  selectedPeriods: string[];
  setSelectedPeriods: React.Dispatch<React.SetStateAction<string[]>>;
  selectedStages: string[];
  setSelectedStages: React.Dispatch<React.SetStateAction<string[]>>;
  selectedLocalities: string[];
  setSelectedLocalities: React.Dispatch<React.SetStateAction<string[]>>;
  triggerSearch: () => void;
}

export function AdvancedFiltersModal({
  filterOptions,
  selectedPeriods,
  setSelectedPeriods,
  selectedStages,
  setSelectedStages,
  selectedLocalities,
  setSelectedLocalities,
  triggerSearch,
}: AdvancedFiltersModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { catalogIndex } = useFossilStore();

  const [localitySearch, setLocalitySearch] = useState("");
  const [flyToLocality, setFlyToLocality] = useState<string | undefined>(undefined);
  // (Cela évite des requêtes trop fréquentes)
  const [tempPeriods, setTempPeriods] = useState<string[]>(selectedPeriods);
  const [tempStages, setTempStages] = useState<string[]>(selectedStages);
  const [tempLocalities, setTempLocalities] =
    useState<string[]>(selectedLocalities);

  // Synchroniser quand on ouvre le modal
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setTempPeriods(selectedPeriods);
      setTempStages(selectedStages);
      setTempLocalities(selectedLocalities);
    }
  };

  // Localities filtered by the search query
  const filteredLocalityObjects = localitySearch.trim()
    ? (filterOptions.localityObjects ?? []).filter((loc) =>
        loc.name.toLowerCase().includes(localitySearch.toLowerCase()),
      )
    : (filterOptions.localityObjects ?? []);

  // Stages that have fossils for the currently selected periods
  const stagesForSelectedPeriods: string[] =
    tempPeriods.length === 0
      ? filterOptions.geologicalStages
      : [
          ...new Set(
            catalogIndex
              .filter((p: { geologicalPeriod: string; geologicalStage: string }) =>
                tempPeriods.includes(p.geologicalPeriod),
              )
              .map((p: { geologicalStage: string }) => p.geologicalStage)
              .filter(Boolean),
          ),
        ];

  const handlePeriodToggle = (period: string) => {
    setTempPeriods((prev) =>
      prev.includes(period)
        ? prev.filter((p) => p !== period)
        : [...prev, period],
    );
  };

  // Ajoutera handleLocalityToggle plus tard si map intégrée, etc.

  const applyFilters = () => {
    setSelectedPeriods(tempPeriods);
    setSelectedStages(tempStages);
    setSelectedLocalities(tempLocalities);
    setIsOpen(false);
    // triggerSearch is intentionally NOT called here to avoid a race condition:
    // The parent's useEffect watches selectedLocalities/Periods/Stages and will
    // call applyFilters() automatically after these state updates are committed.
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex justify-center items-center gap-2 border-terracotta/50 text-terracotta hover:bg-terracotta hover:text-parchemin font-serif"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres Avancés
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-silex border-terracotta/30 text-parchemin max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-terracotta">
            Exploration Avancée
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="timeline"
          className="flex-1 overflow-hidden flex flex-col mt-4"
        >
          <TabsList className="grid w-full grid-cols-2 bg-black/30 border border-terracotta/10">
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-terracotta data-[state=active]:text-parchemin font-serif text-parchemin/70"
            >
              <Clock className="w-4 h-4 mr-2" /> Eres & Étages
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-terracotta data-[state=active]:text-parchemin font-serif text-parchemin/70"
            >
              <Map className="w-4 h-4 mr-2" /> Carte de Provenance
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="timeline"
            className="flex-1 overflow-y-auto pr-2 mt-4 space-y-6"
          >
            {/* Frise chronologique visuelle */}
            <GeologicalTimeline
              selectedPeriods={tempPeriods}
              onPeriodToggle={handlePeriodToggle}
              availablePeriods={filterOptions.geologicalPeriods}
            />

            {/* Sélecteur d'étage (Stages) sous la frise */}
            {tempPeriods.length > 0 &&
              stagesForSelectedPeriods.length > 0 && (
                <div className="p-4 bg-black/20 rounded-lg border border-terracotta/10 mt-6">
                  <h4 className="text-sm font-semibold text-terracotta mb-3">
                    Étages correspondants ({stagesForSelectedPeriods.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {stagesForSelectedPeriods.map((stage) => (
                      <button
                        key={stage}
                        onClick={() =>
                          setTempStages((prev) =>
                            prev.includes(stage)
                              ? prev.filter((s) => s !== stage)
                              : [...prev, stage],
                          )
                        }
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          tempStages.includes(stage)
                            ? "bg-terracotta text-parchemin border-terracotta"
                            : "bg-transparent text-parchemin/60 border-terracotta/30 hover:border-terracotta/70"
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </TabsContent>

          <TabsContent
            value="map"
            className="flex-1 overflow-y-auto mt-4 min-h-[440px]"
          >
            {/* Barre de recherche de localité */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-parchemin/40" />
              <input
                type="text"
                placeholder="Rechercher une localité (ex: Kem Kem, Anti-Atlas…)"
                value={localitySearch}
                onChange={(e) => setLocalitySearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-sm rounded-md border border-terracotta/30 bg-black/30 text-parchemin placeholder:text-parchemin/30 focus:outline-none focus:border-terracotta/60"
              />
              {localitySearch && (
                <button
                  onClick={() => setLocalitySearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-parchemin/40 hover:text-parchemin"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {filteredLocalityObjects.length > 0 ? (
              <ProductMap
                localities={filteredLocalityObjects as LocalityMapData[]}
                height={400}
                zoom={3}
                centerLat={25}
                centerLon={15}
                onLocalitySelect={(name) =>
                  setTempLocalities((prev) =>
                    prev.includes(name)
                      ? prev.filter((l) => l !== name)
                      : [...prev, name],
                  )
                }
                selectedLocalities={tempLocalities}
                flyToLocality={flyToLocality}
              />
            ) : (
              <div className="bg-black/30 w-full h-[400px] flex items-center justify-center rounded-lg border border-terracotta/20">
                <p className="text-terracotta/70 italic text-center max-w-sm">
                  {localitySearch.trim()
                    ? `Aucune localité trouvée pour « ${localitySearch} »`
                    : "Aucune localité disponible pour la carte."}
                </p>
              </div>
            )}

            {/* Badges des localités sélectionnées */}
            {tempLocalities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-parchemin/50 self-center">
                  Sélectionnées :
                </span>
                {tempLocalities.map((loc) => (
                  <button
                    key={loc}
                    onClick={() =>
                      setTempLocalities((prev) => prev.filter((l) => l !== loc))
                    }
                    className="text-xs px-3 py-1.5 rounded-full border bg-amber-600 text-parchemin border-amber-600 hover:bg-amber-700 transition-colors"
                  >
                    {loc} ×
                  </button>
                ))}
              </div>
            )}

            {/* Liste filtrée par la recherche */}
            {localitySearch.trim() && (
              <div className="mt-4 p-3 rounded-lg border border-terracotta/20 bg-black/20">
                <p className="text-xs text-parchemin/50 mb-2">
                  Résultats pour « {localitySearch} » :
                </p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.localities
                    .filter((loc) =>
                      loc.toLowerCase().includes(localitySearch.toLowerCase()),
                    )
                    .map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setTempLocalities((prev) =>
                            prev.includes(loc)
                              ? prev.filter((l) => l !== loc)
                              : [...prev, loc],
                          );
                          setFlyToLocality(loc);
                          setLocalitySearch("");
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          tempLocalities.includes(loc)
                            ? "bg-amber-600 text-parchemin border-amber-600"
                            : "bg-transparent text-parchemin/70 border-terracotta/40 hover:border-terracotta"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  {filterOptions.localities.filter((loc) =>
                    loc.toLowerCase().includes(localitySearch.toLowerCase()),
                  ).length === 0 && (
                    <p className="text-xs text-parchemin/40 italic">
                      Aucune localité trouvée
                    </p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 pt-4 border-t border-terracotta/10 sm:justify-between items-center flex-row">
          <div className="text-sm text-parchemin/50">
            {tempPeriods.length + tempStages.length + tempLocalities.length}{" "}
            filtre(s) sélectionné(s)
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-parchemin hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button
              onClick={applyFilters}
              className="bg-terracotta text-parchemin hover:bg-terracotta/80 shadow-glow uppercase font-bold tracking-wider"
            >
              Appliquer les filtres
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
