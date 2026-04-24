"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Clock,
  Ruler,
  Layers,
  Star,
} from "lucide-react";
import type {
  GisementsData,
  FossilFamily,
  FossilGenus,
  FossilSpecies,
  FossilRarity,
} from "@/types/blogType";

// ─── Constants ────────────────────────────────────────────────────────────────

const RARITY_LABELS: Record<FossilRarity, string> = {
  COMMUN: "Commun",
  PEU_COMMUN: "Peu commun",
  RARE: "Rare",
  TRES_RARE: "Très rare",
  EXCEPTIONNEL: "Exceptionnel",
};

const RARITY_COLORS: Record<FossilRarity, string> = {
  COMMUN: "bg-gray-100 text-gray-600 border-gray-200",
  PEU_COMMUN: "bg-blue-100 text-blue-700 border-blue-200",
  RARE: "bg-purple-100 text-purple-700 border-purple-200",
  TRES_RARE: "bg-amber-100 text-amber-700 border-amber-200",
  EXCEPTIONNEL: "bg-red-100 text-red-700 border-red-200",
};

const RARITY_STARS: Record<FossilRarity, number> = {
  COMMUN: 1,
  PEU_COMMUN: 2,
  RARE: 3,
  TRES_RARE: 4,
  EXCEPTIONNEL: 5,
};

// ─── Photo carousel ───────────────────────────────────────────────────────────

function PhotoCarousel({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) return null;

  return (
    <div className="relative">
      <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[index]}
          alt={`${alt} — photo ${index + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).parentElement!.style.display =
              "none";
          }}
        />
      </div>

      {photos.length > 1 && (
        <>
          {/* Controls */}
          <button
            onClick={() =>
              setIndex((i) => (i - 1 + photos.length) % photos.length)
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
            aria-label="Photo précédente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % photos.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
            aria-label="Photo suivante"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === index ? "bg-white w-5" : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Species detail panel ─────────────────────────────────────────────────────

function SpeciesDetail({
  species,
  familyName,
  genusName,
}: {
  species: FossilSpecies;
  familyName: string;
  genusName: string;
}) {
  return (
    <div id={`species-${species.id}`} className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
          {familyName} › {genusName}
        </p>
        <h2 className="text-3xl font-black italic text-slate-900">
          {species.name}
        </h2>
        {species.commonName && (
          <p className="text-lg text-slate-600 mt-1">{species.commonName}</p>
        )}
        {species.rarity && (
          <div className="flex items-center gap-2 mt-3">
            <Badge
              variant="outline"
              className={`${RARITY_COLORS[species.rarity]} text-sm font-semibold`}
            >
              {RARITY_LABELS[species.rarity]}
            </Badge>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < RARITY_STARS[species.rarity!]
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photos */}
      {species.photos.length > 0 && (
        <PhotoCarousel photos={species.photos} alt={species.name} />
      )}

      {/* Description */}
      {species.description && (
        <div>
          <p className="text-slate-700 leading-relaxed">
            {species.description}
          </p>
        </div>
      )}

      {/* Metadata grid */}
      {(species.size || species.layer || species.period) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {species.size && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Ruler className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">
                  Taille
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {species.size}
                </p>
              </div>
            </div>
          )}
          {species.layer && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Layers className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">
                  Couche
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {species.layer}
                </p>
              </div>
            </div>
          )}
          {species.period && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">
                  Période
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {species.period}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Characteristics */}
      {species.characteristics.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
            Caractéristiques
          </h3>
          <div className="flex flex-wrap gap-2">
            {species.characteristics.map((c) => (
              <Badge
                key={c}
                variant="outline"
                className="bg-amber-50 border-amber-200 text-amber-800 text-sm"
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Nav tree ─────────────────────────────────────────────────────────────────

function NavTree({
  families,
  activeId,
  onSelect,
}: {
  families: FossilFamily[];
  activeId: string | null;
  onSelect: (speciesId: string) => void;
}) {
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(
    new Set(families.map((f) => f.id)),
  );
  const [expandedGenera, setExpandedGenera] = useState<Set<string>>(
    new Set(families.flatMap((f) => f.genera.map((g) => g.id))),
  );

  const toggleFamily = (id: string) =>
    setExpandedFamilies((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleGenus = (id: string) =>
    setExpandedGenera((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <nav className="space-y-1">
      {families.map((family) => (
        <div key={family.id}>
          <button
            onClick={() => toggleFamily(family.id)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {expandedFamilies.has(family.id) ? (
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate">{family.name || "Famille"}</span>
          </button>

          {expandedFamilies.has(family.id) && (
            <div className="ml-3 space-y-0.5">
              {family.genera.map((genus) => (
                <div key={genus.id}>
                  <button
                    onClick={() => toggleGenus(genus.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {expandedGenera.has(genus.id) ? (
                      <ChevronDown className="w-3 h-3 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 shrink-0" />
                    )}
                    <span className="truncate italic">
                      {genus.name || "Genre"}
                    </span>
                  </button>

                  {expandedGenera.has(genus.id) && (
                    <div className="ml-3 space-y-0.5">
                      {genus.species.map((sp) => (
                        <button
                          key={sp.id}
                          onClick={() => onSelect(sp.id)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-sm transition-colors ${
                            activeId === sp.id
                              ? "bg-amber-100 text-amber-800 font-semibold"
                              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                          <span className="truncate italic">
                            {sp.name || "Espèce"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface GisementsContentProps {
  data: GisementsData;
}

interface FlatSpecies {
  species: FossilSpecies;
  familyName: string;
  genusName: string;
}

export default function GisementsContent({ data }: GisementsContentProps) {
  // Flatten all species for navigation
  const allSpecies: FlatSpecies[] = data.fauna.flatMap((f) =>
    f.genera.flatMap((g) =>
      g.species.map((s) => ({
        species: s,
        familyName: f.name,
        genusName: g.name,
      })),
    ),
  );

  const [activeId, setActiveId] = useState<string | null>(
    allSpecies[0]?.species.id ?? null,
  );

  const activeEntry = allSpecies.find((e) => e.species.id === activeId);

  const hasNoFauna =
    data.fauna.length === 0 ||
    data.fauna.every((f) => f.genera.every((g) => g.species.length === 0));

  return (
    <div className="space-y-10">
      {/* ── Site info banner ── */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex flex-wrap gap-6 text-sm">
          {data.localityName && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs text-amber-600 block uppercase tracking-wide">
                  Gisement
                </span>
                <span className="font-bold text-slate-800">
                  {data.localityName}
                </span>
              </div>
            </div>
          )}
          {data.localityLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block uppercase tracking-wide">
                  Localisation
                </span>
                <span className="font-semibold text-slate-700">
                  {data.localityLocation}
                </span>
              </div>
            </div>
          )}
          {data.geologicalPeriod && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block uppercase tracking-wide">
                  Période
                </span>
                <span className="font-semibold text-slate-700">
                  {data.geologicalPeriod}
                </span>
              </div>
            </div>
          )}
          {data.geologicalStages.length > 0 && (
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block uppercase tracking-wide">
                  Étages
                </span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {data.geologicalStages.map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-white border border-slate-200 rounded-full px-2 py-0.5 text-slate-600"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Introduction ── */}
      {data.introduction && (
        <div className="prose prose-lg prose-slate max-w-none">
          <p className="text-xl leading-relaxed text-slate-700">
            {data.introduction}
          </p>
        </div>
      )}

      {/* ── Fauna section ── */}
      {!hasNoFauna && (
        <>
          <Separator />
          <h2 className="text-2xl font-black text-slate-900">
            Faune du gisement
          </h2>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span>
              <strong className="text-slate-900">{data.fauna.length}</strong>{" "}
              famille{data.fauna.length !== 1 ? "s" : ""}
            </span>
            <span>
              <strong className="text-slate-900">
                {data.fauna.reduce((a, f) => a + f.genera.length, 0)}
              </strong>{" "}
              genre
              {data.fauna.reduce((a, f) => a + f.genera.length, 0) !== 1
                ? "s"
                : ""}
            </span>
            <span>
              <strong className="text-slate-900">{allSpecies.length}</strong>{" "}
              espèce{allSpecies.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Split panel */}
          <div className="flex gap-6 min-h-[600px]">
            {/* Left nav */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">
                  Navigation
                </p>
                <NavTree
                  families={data.fauna}
                  activeId={activeId}
                  onSelect={setActiveId}
                />
              </div>
            </aside>

            {/* Right detail */}
            <div className="flex-1 min-w-0">
              {/* Mobile species dropdown */}
              <div className="lg:hidden mb-4">
                <select
                  value={activeId ?? ""}
                  onChange={(e) => setActiveId(e.target.value || null)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  {data.fauna.map((f) =>
                    f.genera.map((g) =>
                      g.species.map((sp) => (
                        <option key={sp.id} value={sp.id}>
                          {f.name} › {g.name} › {sp.name}
                        </option>
                      )),
                    ),
                  )}
                </select>
              </div>

              {activeEntry ? (
                <>
                  {/* Nav prev/next */}
                  {allSpecies.length > 1 && (
                    <div className="flex justify-between mb-6 text-sm">
                      {(() => {
                        const idx = allSpecies.findIndex(
                          (e) => e.species.id === activeId,
                        );
                        const prev = allSpecies[idx - 1];
                        const next = allSpecies[idx + 1];
                        return (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!prev}
                              onClick={() =>
                                prev && setActiveId(prev.species.id)
                              }
                              className="text-slate-500"
                            >
                              <ChevronLeft className="w-4 h-4 mr-1" />
                              {prev ? (
                                <span className="italic">
                                  {prev.species.name}
                                </span>
                              ) : (
                                "—"
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!next}
                              onClick={() =>
                                next && setActiveId(next.species.id)
                              }
                              className="text-slate-500"
                            >
                              {next ? (
                                <span className="italic">
                                  {next.species.name}
                                </span>
                              ) : (
                                "—"
                              )}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  <SpeciesDetail
                    species={activeEntry.species}
                    familyName={activeEntry.familyName}
                    genusName={activeEntry.genusName}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-400">
                  Sélectionnez une espèce dans la navigation
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
