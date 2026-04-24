"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Save,
  Eye,
  X,
  ImageIcon,
  GripVertical,
  Upload,
} from "lucide-react";
import { BlogCategory, BlogStatus, BlogTag } from "@/lib/generated/prisma";
import { toast } from "sonner";
import {
  createBlogArticle,
  createBlogTag,
  getAllBlogTags,
} from "@/lib/actions/blogActions";
import { generateSlug } from "@/lib/utils";
import type {
  FossilFamily,
  FossilGenus,
  FossilSpecies,
  FossilRarity,
  GisementsData,
} from "@/types/blogType";

// ─── helpers ────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const RARITY_LABELS: Record<FossilRarity, string> = {
  COMMUN: "Commun",
  PEU_COMMUN: "Peu commun",
  RARE: "Rare",
  TRES_RARE: "Très rare",
  EXCEPTIONNEL: "Exceptionnel",
};

const RARITY_COLORS: Record<FossilRarity, string> = {
  COMMUN: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  PEU_COMMUN: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  RARE: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  TRES_RARE: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  EXCEPTIONNEL: "bg-red-500/20 text-red-300 border-red-500/30",
};

function emptySpecies(): FossilSpecies {
  return {
    id: uid(),
    name: "",
    commonName: "",
    description: "",
    size: "",
    layer: "",
    period: "",
    rarity: undefined,
    characteristics: [],
    photos: [],
  };
}

// ─── Photo drop zone ─────────────────────────────────────────────────────────

function PhotoDropZone({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const dragIndexRef = useRef<number | null>(null);

  const addUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed || photos.includes(trimmed)) return;
    if (photos.length >= 8) {
      toast.error("Maximum 8 photos par espèce");
      return;
    }
    onChange([...photos, trimmed]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const url =
      e.dataTransfer.getData("text/uri-list") ||
      e.dataTransfer.getData("text/plain");
    if (url) addUrl(url.split("\n")[0].trim());
  };

  const handleItemDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleItemDrop = (e: React.DragEvent, targetIndex: number) => {
    e.stopPropagation();
    e.preventDefault();
    if (dragIndexRef.current === null || dragIndexRef.current === targetIndex)
      return;
    const reordered = [...photos];
    const [moved] = reordered.splice(dragIndexRef.current, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange(reordered);
    dragIndexRef.current = null;
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          isDraggingOver
            ? "border-terracotta bg-terracotta/10"
            : "border-parchemin/20 hover:border-parchemin/40"
        }`}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-parchemin/40" />
        <p className="text-sm text-parchemin/60">
          Glissez une image depuis votre navigateur
        </p>
        <p className="text-xs text-parchemin/40 mt-1">
          {photos.length}/8 photos
        </p>
      </div>

      {/* URL fallback */}
      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Ou collez une URL d'image..."
          className="bg-silex border-parchemin/20 text-parchemin text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl(urlInput);
              setUrlInput("");
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-parchemin/20 text-parchemin shrink-0"
          onClick={() => {
            addUrl(urlInput);
            setUrlInput("");
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Photo list (reorderable) */}
      {photos.length > 0 && (
        <div className="space-y-2">
          {photos.map((url, idx) => (
            <div
              key={url + idx}
              draggable
              onDragStart={() => handleItemDragStart(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleItemDrop(e, idx)}
              className="flex items-center gap-2 p-2 rounded-lg bg-parchemin/5 border border-parchemin/10 group cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4 text-parchemin/30 shrink-0" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="w-12 h-12 object-cover rounded-md shrink-0 bg-parchemin/10"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="text-xs text-parchemin/60 truncate flex-1">
                {url}
              </span>
              <button
                type="button"
                onClick={() => onChange(photos.filter((_, i) => i !== idx))}
                className="text-parchemin/30 hover:text-red-400 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Species drawer ───────────────────────────────────────────────────────────

function SpeciesDrawer({
  species,
  open,
  onClose,
  onSave,
}: {
  species: FossilSpecies;
  open: boolean;
  onClose: () => void;
  onSave: (s: FossilSpecies) => void;
}) {
  const [draft, setDraft] = useState<FossilSpecies>(species);
  const [charInput, setCharInput] = useState("");

  useEffect(() => {
    setDraft(species);
    setCharInput("");
  }, [species]);

  const field = <K extends keyof FossilSpecies>(
    key: K,
    value: FossilSpecies[K],
  ) => setDraft((d) => ({ ...d, [key]: value }));

  const addChar = () => {
    const v = charInput.trim();
    if (!v || draft.characteristics.includes(v)) return;
    field("characteristics", [...draft.characteristics, v]);
    setCharInput("");
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl bg-silex border-parchemin/10 text-parchemin flex flex-col p-0"
      >
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-parchemin">
              {draft.name ? `Espèce : ${draft.name}` : "Nouvelle espèce"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-5">
            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-parchemin/70 text-xs mb-1 block">
                  Nom scientifique *
                </Label>
                <Input
                  value={draft.name}
                  onChange={(e) => field("name", e.target.value)}
                  placeholder="ex: Elrathia kingii"
                  className="bg-silex border-parchemin/20 text-parchemin"
                />
              </div>
              <div>
                <Label className="text-parchemin/70 text-xs mb-1 block">
                  Nom commun
                </Label>
                <Input
                  value={draft.commonName ?? ""}
                  onChange={(e) => field("commonName", e.target.value)}
                  placeholder="ex: Trilobite de Wheeler"
                  className="bg-silex border-parchemin/20 text-parchemin"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="text-parchemin/70 text-xs mb-1 block">
                Description
              </Label>
              <Textarea
                value={draft.description}
                onChange={(e) => field("description", e.target.value)}
                rows={4}
                placeholder="Description de l'espèce, contexte paléontologique..."
                className="bg-silex border-parchemin/20 text-parchemin resize-none"
              />
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-parchemin/70 text-xs mb-1 block">
                  Taille
                </Label>
                <Input
                  value={draft.size ?? ""}
                  onChange={(e) => field("size", e.target.value)}
                  placeholder="ex: 2–5 cm"
                  className="bg-silex border-parchemin/20 text-parchemin"
                />
              </div>
              <div>
                <Label className="text-parchemin/70 text-xs mb-1 block">
                  Couche géologique
                </Label>
                <Input
                  value={draft.layer ?? ""}
                  onChange={(e) => field("layer", e.target.value)}
                  placeholder="ex: Formation de Fezouata"
                  className="bg-silex border-parchemin/20 text-parchemin"
                />
              </div>
              <div>
                <Label className="text-parchemin/70 text-xs mb-1 block">
                  Période
                </Label>
                <Input
                  value={draft.period ?? ""}
                  onChange={(e) => field("period", e.target.value)}
                  placeholder="ex: Ordovicien inférieur"
                  className="bg-silex border-parchemin/20 text-parchemin"
                />
              </div>
              <div>
                <Label className="text-parchemin/70 text-xs mb-1 block">
                  Rareté
                </Label>
                <Select
                  value={draft.rarity ?? ""}
                  onValueChange={(v) =>
                    field("rarity", v ? (v as FossilRarity) : undefined)
                  }
                >
                  <SelectTrigger className="bg-silex border-parchemin/20 text-parchemin">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent className="bg-silex border-parchemin/20">
                    {(Object.keys(RARITY_LABELS) as FossilRarity[]).map((r) => (
                      <SelectItem key={r} value={r} className="text-parchemin">
                        {RARITY_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Characteristics */}
            <div>
              <Label className="text-parchemin/70 text-xs mb-1 block">
                Caractéristiques
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={charInput}
                  onChange={(e) => setCharInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addChar();
                    }
                  }}
                  placeholder="ex: Yeux holochroaux → Entrée"
                  className="bg-silex border-parchemin/20 text-parchemin"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-parchemin/20 text-parchemin shrink-0"
                  onClick={addChar}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {draft.characteristics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {draft.characteristics.map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="border-parchemin/20 text-parchemin/80 text-xs pr-1"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() =>
                          field(
                            "characteristics",
                            draft.characteristics.filter((x) => x !== c),
                          )
                        }
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Photos */}
            <div>
              <Label className="text-parchemin/70 text-xs mb-2 block flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Photos
              </Label>
              <PhotoDropZone
                photos={draft.photos}
                onChange={(p) => field("photos", p)}
              />
            </div>
          </div>
        </div>

        {/* Footer sticky */}
        <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-parchemin/10 bg-silex">
          <Button
            type="button"
            onClick={() => onSave(draft)}
            disabled={!draft.name.trim()}
            className="flex-1 bg-terracotta hover:bg-terracotta/90 text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer l&apos;espèce
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-parchemin/20 text-parchemin"
          >
            Annuler
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Fauna builder ────────────────────────────────────────────────────────────

function FaunaBuilder({
  families,
  onChange,
}: {
  families: FossilFamily[];
  onChange: (f: FossilFamily[]) => void;
}) {
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(
    new Set(),
  );
  const [expandedGenera, setExpandedGenera] = useState<Set<string>>(new Set());
  const [drawerSpecies, setDrawerSpecies] = useState<{
    species: FossilSpecies;
    familyId: string;
    genusId: string;
  } | null>(null);

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

  // Family mutations
  const addFamily = () => {
    const f: FossilFamily = {
      id: uid(),
      name: "",
      description: "",
      genera: [],
    };
    onChange([...families, f]);
    setExpandedFamilies((s) => new Set([...s, f.id]));
  };

  const updateFamily = (id: string, patch: Partial<FossilFamily>) =>
    onChange(families.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const removeFamily = (id: string) =>
    onChange(families.filter((f) => f.id !== id));

  // Genus mutations
  const addGenus = (familyId: string) => {
    const g: FossilGenus = {
      id: uid(),
      name: "",
      description: "",
      species: [],
    };
    updateFamily(familyId, {
      genera: [...(families.find((f) => f.id === familyId)?.genera ?? []), g],
    });
    setExpandedGenera((s) => new Set([...s, g.id]));
  };

  const updateGenus = (
    familyId: string,
    genusId: string,
    patch: Partial<FossilGenus>,
  ) =>
    onChange(
      families.map((f) =>
        f.id === familyId
          ? {
              ...f,
              genera: f.genera.map((g) =>
                g.id === genusId ? { ...g, ...patch } : g,
              ),
            }
          : f,
      ),
    );

  const removeGenus = (familyId: string, genusId: string) =>
    onChange(
      families.map((f) =>
        f.id === familyId
          ? { ...f, genera: f.genera.filter((g) => g.id !== genusId) }
          : f,
      ),
    );

  // Species mutations
  const openNewSpecies = (familyId: string, genusId: string) => {
    setDrawerSpecies({ species: emptySpecies(), familyId, genusId });
  };

  const openEditSpecies = (
    familyId: string,
    genusId: string,
    species: FossilSpecies,
  ) => {
    setDrawerSpecies({ species, familyId, genusId });
  };

  const saveSpecies = (saved: FossilSpecies) => {
    if (!drawerSpecies) return;
    const { familyId, genusId } = drawerSpecies;
    onChange(
      families.map((f) =>
        f.id === familyId
          ? {
              ...f,
              genera: f.genera.map((g) =>
                g.id === genusId
                  ? {
                      ...g,
                      species: g.species.some((s) => s.id === saved.id)
                        ? g.species.map((s) => (s.id === saved.id ? saved : s))
                        : [...g.species, saved],
                    }
                  : g,
              ),
            }
          : f,
      ),
    );
    setDrawerSpecies(null);
  };

  const removeSpecies = (
    familyId: string,
    genusId: string,
    speciesId: string,
  ) =>
    onChange(
      families.map((f) =>
        f.id === familyId
          ? {
              ...f,
              genera: f.genera.map((g) =>
                g.id === genusId
                  ? {
                      ...g,
                      species: g.species.filter((s) => s.id !== speciesId),
                    }
                  : g,
              ),
            }
          : f,
      ),
    );

  return (
    <>
      <div className="space-y-3">
        {families.map((family) => (
          <div
            key={family.id}
            className="border border-parchemin/15 rounded-xl overflow-hidden"
          >
            {/* Family header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-parchemin/5">
              <button
                type="button"
                onClick={() => toggleFamily(family.id)}
                className="text-parchemin/60 hover:text-parchemin"
              >
                {expandedFamilies.has(family.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <Input
                value={family.name}
                onChange={(e) =>
                  updateFamily(family.id, { name: e.target.value })
                }
                placeholder="Nom de la famille (ex: Olenidae)"
                className="flex-1 h-8 bg-transparent border-none text-parchemin font-semibold text-sm focus-visible:ring-0 px-0"
              />
              <button
                type="button"
                onClick={() => removeFamily(family.id)}
                className="text-parchemin/30 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Family body */}
            {expandedFamilies.has(family.id) && (
              <div className="px-4 py-3 space-y-3">
                <Input
                  value={family.description ?? ""}
                  onChange={(e) =>
                    updateFamily(family.id, { description: e.target.value })
                  }
                  placeholder="Description de la famille (optionnel)"
                  className="bg-silex border-parchemin/20 text-parchemin text-sm"
                />

                {/* Genera */}
                {family.genera.map((genus) => (
                  <div
                    key={genus.id}
                    className="ml-4 border border-parchemin/10 rounded-lg overflow-hidden"
                  >
                    {/* Genus header */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-parchemin/3">
                      <button
                        type="button"
                        onClick={() => toggleGenus(genus.id)}
                        className="text-parchemin/50 hover:text-parchemin"
                      >
                        {expandedGenera.has(genus.id) ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <Input
                        value={genus.name}
                        onChange={(e) =>
                          updateGenus(family.id, genus.id, {
                            name: e.target.value,
                          })
                        }
                        placeholder="Nom du genre (ex: Euloma)"
                        className="flex-1 h-7 bg-transparent border-none text-parchemin text-sm font-medium focus-visible:ring-0 px-0"
                      />
                      <button
                        type="button"
                        onClick={() => removeGenus(family.id, genus.id)}
                        className="text-parchemin/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Genus body */}
                    {expandedGenera.has(genus.id) && (
                      <div className="px-3 py-2 space-y-2">
                        <Input
                          value={genus.description ?? ""}
                          onChange={(e) =>
                            updateGenus(family.id, genus.id, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Description du genre (optionnel)"
                          className="bg-silex border-parchemin/20 text-parchemin text-sm"
                        />

                        {/* Species list */}
                        {genus.species.map((sp) => (
                          <div
                            key={sp.id}
                            className="flex items-center gap-2 pl-3 py-1.5 rounded-lg bg-parchemin/5 group"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-parchemin italic">
                                {sp.name || (
                                  <span className="not-italic text-parchemin/40">
                                    Espèce sans nom
                                  </span>
                                )}
                              </span>
                              {sp.rarity && (
                                <span
                                  className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full border ${RARITY_COLORS[sp.rarity]}`}
                                >
                                  {RARITY_LABELS[sp.rarity]}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                openEditSpecies(family.id, genus.id, sp)
                              }
                              className="text-parchemin/30 hover:text-parchemin transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                removeSpecies(family.id, genus.id, sp.id)
                              }
                              className="text-parchemin/30 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => openNewSpecies(family.id, genus.id)}
                          className="text-parchemin/50 hover:text-parchemin hover:bg-parchemin/5 text-xs h-7"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Ajouter une espèce
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => addGenus(family.id)}
                  className="text-parchemin/50 hover:text-parchemin hover:bg-parchemin/5 text-xs h-7 ml-4"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Ajouter un genre
                </Button>
              </div>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addFamily}
          className="w-full border-dashed border-parchemin/20 text-parchemin/60 hover:text-parchemin hover:border-parchemin/40"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une famille
        </Button>
      </div>

      {/* Species drawer */}
      {drawerSpecies && (
        <SpeciesDrawer
          species={drawerSpecies.species}
          open={true}
          onClose={() => setDrawerSpecies(null)}
          onSave={saveSpecies}
        />
      )}
    </>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

const GEO_PERIODS = [
  "Cambrien",
  "Ordovicien",
  "Silurien",
  "Dévonien",
  "Carbonifère",
  "Permien",
  "Trias",
  "Jurassique",
  "Crétacé",
  "Paléogène",
  "Néogène",
  "Quaternaire",
];

export default function CreateGisementsForm({
  lang = "fr",
}: {
  lang?: "en" | "fr";
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<BlogTag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // Basic fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<BlogStatus>(BlogStatus.DRAFT);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Gisements-specific
  const [localityName, setLocalityName] = useState("");
  const [localityLocation, setLocalityLocation] = useState("");
  const [geologicalPeriod, setGeologicalPeriod] = useState("");
  const [geologicalStagesInput, setGeologicalStagesInput] = useState("");
  const [geologicalStages, setGeologicalStages] = useState<string[]>([]);
  const [introduction, setIntroduction] = useState("");
  const [fauna, setFauna] = useState<FossilFamily[]>([]);

  useEffect(() => {
    getAllBlogTags().then(setAvailableTags).catch(console.error);
  }, []);

  // Auto-slug from title
  useEffect(() => {
    if (!slugManual && title) setSlug(generateSlug(title));
  }, [title, slugManual]);

  const toggleTag = (id: string) =>
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setIsCreatingTag(true);
    try {
      const result = await createBlogTag(newTagName.trim());
      if (result.success && result.tag) {
        setAvailableTags((prev) => [...prev, result.tag!]);
        setSelectedTags((prev) => [...prev, result.tag!.id]);
        setNewTagName("");
      }
    } catch {
      toast.error("Erreur lors de la création du tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const countSpecies = () =>
    fauna.reduce(
      (acc, f) => acc + f.genera.reduce((a, g) => a + g.species.length, 0),
      0,
    );

  const handleSubmit = async (submitStatus: BlogStatus) => {
    if (!title.trim() || !slug.trim()) {
      toast.error("Le titre et le slug sont obligatoires");
      return;
    }
    if (!localityName.trim()) {
      toast.error("Le nom du gisement est obligatoire");
      return;
    }

    setIsLoading(true);
    try {
      const gisementsData: GisementsData = {
        localityName: localityName.trim(),
        localityLocation: localityLocation.trim(),
        geologicalPeriod: geologicalPeriod.trim(),
        geologicalStages,
        introduction: introduction.trim(),
        fauna,
      };

      await createBlogArticle({
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || undefined,
        content: introduction.trim(),
        featuredImage: featuredImage.trim() || undefined,
        category: BlogCategory.GISEMENTS,
        status: submitStatus,
        publishedAt:
          submitStatus === BlogStatus.PUBLISHED ? new Date() : undefined,
        tagIds: selectedTags,
        structuredData: gisementsData,
      });

      toast.success(
        submitStatus === BlogStatus.PUBLISHED
          ? "Gisement publié !"
          : "Brouillon sauvegardé",
      );
      router.push(`/${lang}/blog`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + slug */}
          <Card className="bg-silex border-parchemin/10">
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-parchemin/70 text-xs mb-1 block">
                  Titre de l&apos;article *
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: La Faune de Fezouata — Ordovicien du Maroc"
                  className="bg-silex border-parchemin/20 text-parchemin text-lg"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-parchemin/70 text-xs">Slug URL</Label>
                  <button
                    type="button"
                    onClick={() => setSlugManual((m) => !m)}
                    className="text-xs text-parchemin/40 hover:text-parchemin transition-colors"
                  >
                    {slugManual ? "Auto" : "Modifier"}
                  </button>
                </div>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  readOnly={!slugManual}
                  placeholder="gisement-fezouata-ordovicien"
                  className={`bg-silex border-parchemin/20 text-parchemin text-sm ${!slugManual ? "opacity-60" : ""}`}
                />
              </div>
              <div>
                <Label className="text-parchemin/70 text-xs mb-1 block">
                  Extrait (résumé pour la liste)
                </Label>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Courte description pour la preview..."
                  className="bg-silex border-parchemin/20 text-parchemin resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Introduction */}
          <Card className="bg-silex border-parchemin/10">
            <CardHeader>
              <CardTitle className="text-parchemin text-base">
                Introduction du gisement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                rows={6}
                placeholder="Présentez le site paléontologique : contexte géographique, découverte, importance scientifique..."
                className="bg-silex border-parchemin/20 text-parchemin resize-none"
              />
            </CardContent>
          </Card>

          {/* Fauna builder */}
          <Card className="bg-silex border-parchemin/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-parchemin text-base">
                  Faune du gisement
                </CardTitle>
                <Badge
                  variant="outline"
                  className="border-parchemin/20 text-parchemin/60 text-xs"
                >
                  {fauna.length} famille
                  {fauna.length !== 1 ? "s" : ""} ·{" "}
                  {fauna.reduce((a, f) => a + f.genera.length, 0)} genre
                  {fauna.reduce((a, f) => a + f.genera.length, 0) !== 1
                    ? "s"
                    : ""}{" "}
                  · {countSpecies()} esp
                  {countSpecies() !== 1 ? "èces" : "èce"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <FaunaBuilder families={fauna} onChange={setFauna} />
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Actions */}
          <Card className="bg-silex border-parchemin/10">
            <CardContent className="pt-6 space-y-3">
              <Button
                type="button"
                className="w-full bg-terracotta hover:bg-terracotta/90 text-primary-foreground"
                onClick={() => handleSubmit(BlogStatus.PUBLISHED)}
                disabled={isLoading}
              >
                <Eye className="w-4 h-4 mr-2" />
                Publier
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-parchemin/20 text-parchemin"
                onClick={() => handleSubmit(BlogStatus.DRAFT)}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder brouillon
              </Button>
            </CardContent>
          </Card>

          {/* Locality */}
          <Card className="bg-silex border-parchemin/10">
            <CardHeader>
              <CardTitle className="text-parchemin text-sm">
                Informations du gisement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-parchemin/70 text-xs mb-1 block">
                  Nom du gisement *
                </Label>
                <Input
                  value={localityName}
                  onChange={(e) => setLocalityName(e.target.value)}
                  placeholder="ex: Fezouata"
                  className="bg-silex border-parchemin/20 text-parchemin text-sm"
                />
              </div>
              <div>
                <Label className="text-parchemin/70 text-xs mb-1 block">
                  Localisation
                </Label>
                <Input
                  value={localityLocation}
                  onChange={(e) => setLocalityLocation(e.target.value)}
                  placeholder="ex: Province de Zagora, Maroc"
                  className="bg-silex border-parchemin/20 text-parchemin text-sm"
                />
              </div>
              <div>
                <Label className="text-parchemin/70 text-xs mb-1 block">
                  Période géologique
                </Label>
                <Select
                  value={geologicalPeriod}
                  onValueChange={setGeologicalPeriod}
                >
                  <SelectTrigger className="bg-silex border-parchemin/20 text-parchemin text-sm">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent className="bg-silex border-parchemin/20">
                    {GEO_PERIODS.map((p) => (
                      <SelectItem key={p} value={p} className="text-parchemin">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-parchemin/70 text-xs mb-1 block">
                  Étages géologiques
                </Label>
                <div className="flex gap-2 mb-1.5">
                  <Input
                    value={geologicalStagesInput}
                    onChange={(e) => setGeologicalStagesInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const v = geologicalStagesInput.trim();
                        if (v && !geologicalStages.includes(v)) {
                          setGeologicalStages((s) => [...s, v]);
                          setGeologicalStagesInput("");
                        }
                      }
                    }}
                    placeholder="ex: Floien → Entrée"
                    className="bg-silex border-parchemin/20 text-parchemin text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-parchemin/20 text-parchemin shrink-0"
                    onClick={() => {
                      const v = geologicalStagesInput.trim();
                      if (v && !geologicalStages.includes(v)) {
                        setGeologicalStages((s) => [...s, v]);
                        setGeologicalStagesInput("");
                      }
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                {geologicalStages.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {geologicalStages.map((s) => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="border-parchemin/20 text-parchemin/80 text-xs pr-1"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() =>
                            setGeologicalStages((prev) =>
                              prev.filter((x) => x !== s),
                            )
                          }
                          className="ml-1 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Featured image */}
          <Card className="bg-silex border-parchemin/10">
            <CardHeader>
              <CardTitle className="text-parchemin text-sm">
                Image mise en avant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://..."
                className="bg-silex border-parchemin/20 text-parchemin text-sm"
              />
              {featuredImage && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={featuredImage}
                  alt="Preview"
                  className="mt-3 w-full aspect-video object-cover rounded-lg"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.display = "none")
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="bg-silex border-parchemin/10">
            <CardHeader>
              <CardTitle className="text-parchemin text-sm">Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((id) => {
                    const tag = availableTags.find((t) => t.id === id);
                    if (!tag) return null;
                    return (
                      <Badge
                        key={id}
                        className="text-primary-foreground text-xs pr-1"
                        style={{ backgroundColor: tag.color ?? "#444" }}
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => toggleTag(id)}
                          className="ml-1 hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
              <Separator className="bg-parchemin/10" />
              <div className="max-h-36 overflow-y-auto space-y-1 custom-scrollbar">
                {availableTags
                  .filter((t) => !selectedTags.includes(t.id))
                  .map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="w-full text-left px-2 py-1 rounded text-sm text-parchemin/70 hover:bg-parchemin/8 hover:text-parchemin transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateTag();
                    }
                  }}
                  placeholder="Nouveau tag..."
                  className="bg-silex border-parchemin/20 text-parchemin text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCreateTag}
                  disabled={isCreatingTag || !newTagName.trim()}
                  className="border-parchemin/20 text-parchemin shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
