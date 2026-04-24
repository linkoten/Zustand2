"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  X,
  Search,
  Store,
  Pickaxe,
  Package,
  ListTodo,
  Archive,
  ImageIcon,
  GripVertical,
  Check,
  Loader2,
} from "lucide-react";
import { BlogCategory, BlogStatus, BlogTag } from "@/lib/generated/prisma";
import { toast } from "sonner";
import {
  updateBlogArticle,
  createBlogTag,
  getAllBlogTags,
} from "@/lib/actions/blogActions";
import {
  searchProductsForBlog,
  BlogProductResult,
} from "@/lib/actions/productActions";
import { generateSlug } from "@/lib/utils";
import type {
  EditableBlogPost,
  ActiviteType,
  ActiviteFossil,
  ActivitesData,
  SalonData,
  FouilleData,
  ArrivageData,
  PlanningData,
  PlanningTopic,
} from "@/types/blogType";

// ─── helpers ────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyFossil(): ActiviteFossil {
  return { id: uid(), name: "", description: "", photo: "", price: "" };
}
function emptyTopic(): PlanningTopic {
  return { id: uid(), title: "", category: "", status: "PLANNED", notes: "" };
}

function parseActivitesData(raw: unknown): ActivitesData | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  if (d.type === "SALON") return d as unknown as ActivitesData;
  if (d.type === "FOUILLE") return d as unknown as ActivitesData;
  if (d.type === "ARRIVAGE") return d as unknown as ActivitesData;
  if (d.type === "PLANNING") return d as unknown as ActivitesData;
  return null;
}

// ─── Type metadata ───────────────────────────────────────────────────────────

const TYPE_META: Record<
  ActiviteType,
  { label: string; icon: React.ElementType; gradient: string }
> = {
  SALON: {
    label: "Salon / Foire",
    icon: Store,
    gradient: "from-amber-500 to-orange-600",
  },
  FOUILLE: {
    label: "Voyage / Fouille",
    icon: Pickaxe,
    gradient: "from-emerald-500 to-teal-600",
  },
  ARRIVAGE: {
    label: "Arrivage boutique",
    icon: Package,
    gradient: "from-blue-500 to-indigo-600",
  },
  PLANNING: {
    label: "Planification articles",
    icon: ListTodo,
    gradient: "from-purple-500 to-violet-600",
  },
};

const PLANNING_STATUS_LABELS: Record<PlanningTopic["status"], string> = {
  PLANNED: "Planifié",
  IN_PROGRESS: "En cours",
  DONE: "Publié",
};
const PLANNING_STATUS_COLORS: Record<PlanningTopic["status"], string> = {
  PLANNED: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  IN_PROGRESS: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  DONE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const CATEGORY_LABELS: Record<string, string> = {
  TRILOBITE: "Trilobite",
  AMMONITE: "Ammonite",
  DENT: "Dent",
  ECHINODERME: "Échinoderme",
  POISSON: "Poisson",
  VERTEBRE: "Vertébré",
  GASTROPODE: "Gastéropode",
  AUTRE_ARTHROPODE: "Autre arthropode",
  AUTRES: "Autres",
};
const CATEGORY_COLORS: Record<string, string> = {
  TRILOBITE: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  AMMONITE: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  DENT: "bg-red-500/20 text-red-300 border-red-500/30",
  ECHINODERME: "bg-green-500/20 text-green-300 border-green-500/30",
  POISSON: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  VERTEBRE: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  GASTROPODE: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  AUTRE_ARTHROPODE: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  AUTRES: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
};

// ─── Fossil item editor ──────────────────────────────────────────────────────

function FossilItemEditor({
  fossil,
  onChange,
  onRemove,
}: {
  fossil: ActiviteFossil;
  onChange: (f: ActiviteFossil) => void;
  onRemove: () => void;
}) {
  const [query, setQuery] = useState(fossil.productId ? fossil.name : "");
  const [results, setResults] = useState<BlogProductResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchProductsForBlog(q);
        setResults(data);
        setOpen(true);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const selectProduct = (p: BlogProductResult) => {
    onChange({
      ...fossil,
      productId: String(p.id),
      name: fossil.name || p.title,
      price: fossil.price || String(p.price.toFixed(2)),
      photo: fossil.photo || p.photo || "",
      category: fossil.category || p.category,
    });
    setQuery(p.title);
    setOpen(false);
  };

  return (
    <div className="rounded-xl border border-parchemin/10 bg-silex/60 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <GripVertical className="w-4 h-4 text-parchemin/30 mt-1 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="relative">
            <Label className="text-xs text-parchemin/60 mb-1 block">
              Lier à un produit (optionnel)
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-parchemin/40" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    search(e.target.value);
                  }}
                  placeholder="Rechercher un produit..."
                  className="pl-8 bg-silex border-parchemin/20 text-parchemin text-sm h-9"
                />
                {searching && (
                  <Loader2 className="absolute right-2.5 top-2.5 w-3.5 h-3.5 animate-spin text-parchemin/40" />
                )}
              </div>
              {fossil.productId && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs shrink-0">
                  <Check className="w-3 h-3 mr-1" /> Lié
                </Badge>
              )}
            </div>
            {open && results.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-parchemin/20 bg-silex shadow-xl overflow-hidden">
                {results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectProduct(p)}
                    className="flex items-center gap-3 w-full px-3 py-2 hover:bg-terracotta/10 text-left transition-colors"
                  >
                    {p.photo && (
                      <img
                        src={p.photo}
                        alt={p.title}
                        className="w-8 h-8 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-parchemin truncate">
                        {p.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.category && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[p.category] ?? "bg-parchemin/10 text-parchemin/60 border-parchemin/20"}`}
                          >
                            {CATEGORY_LABELS[p.category] ?? p.category}
                          </span>
                        )}
                        <p className="text-xs text-parchemin/40">
                          {p.price.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-parchemin/60 mb-1 block">
                Nom *
              </Label>
              <Input
                value={fossil.name}
                onChange={(e) => onChange({ ...fossil, name: e.target.value })}
                placeholder="Ammonite..."
                className="bg-silex border-parchemin/20 text-parchemin text-sm h-9"
              />
            </div>
            <div>
              <Label className="text-xs text-parchemin/60 mb-1 block">
                Catégorie
              </Label>
              <Select
                value={fossil.category ?? ""}
                onValueChange={(v) =>
                  onChange({ ...fossil, category: v || undefined })
                }
              >
                <SelectTrigger className="bg-silex border-parchemin/20 text-parchemin text-sm h-9">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-parchemin/60 mb-1 block">
                Prix affiché
              </Label>
              <Input
                value={fossil.price ?? ""}
                onChange={(e) => onChange({ ...fossil, price: e.target.value })}
                placeholder="45.00 €"
                className="bg-silex border-parchemin/20 text-parchemin text-sm h-9"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-parchemin/60 mb-1 block">
              Description courte
            </Label>
            <Input
              value={fossil.description ?? ""}
              onChange={(e) =>
                onChange({ ...fossil, description: e.target.value })
              }
              placeholder="Belle conservation..."
              className="bg-silex border-parchemin/20 text-parchemin text-sm h-9"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-parchemin/40 hover:text-red-400 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Sub-forms ───────────────────────────────────────────────────────────────

function SalonForm({
  value,
  onChange,
}: {
  value: SalonData;
  onChange: (v: SalonData) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label className="text-parchemin/80 mb-1.5 block">
            Nom de l&apos;événement *
          </Label>
          <Input
            value={value.eventName}
            onChange={(e) => onChange({ ...value, eventName: e.target.value })}
            placeholder="Mineral & Gem Paris"
            className="bg-silex border-parchemin/20 text-parchemin"
          />
        </div>
        <div>
          <Label className="text-parchemin/80 mb-1.5 block">Lieu *</Label>
          <Input
            value={value.location}
            onChange={(e) => onChange({ ...value, location: e.target.value })}
            placeholder="Paris, Parc des Expositions"
            className="bg-silex border-parchemin/20 text-parchemin"
          />
        </div>
        <div>
          <Label className="text-parchemin/80 mb-1.5 block">Organisateur</Label>
          <Input
            value={value.organizer ?? ""}
            onChange={(e) => onChange({ ...value, organizer: e.target.value })}
            className="bg-silex border-parchemin/20 text-parchemin"
          />
        </div>
        <div>
          <Label className="text-parchemin/80 mb-1.5 block">
            Date de début *
          </Label>
          <Input
            type="date"
            value={value.dateStart}
            onChange={(e) => onChange({ ...value, dateStart: e.target.value })}
            className="bg-silex border-parchemin/20 text-parchemin"
          />
        </div>
        <div>
          <Label className="text-parchemin/80 mb-1.5 block">Date de fin</Label>
          <Input
            type="date"
            value={value.dateEnd ?? ""}
            onChange={(e) => onChange({ ...value, dateEnd: e.target.value })}
            className="bg-silex border-parchemin/20 text-parchemin"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-parchemin/80 mb-1.5 block">Infos stand</Label>
          <Input
            value={value.boothInfo ?? ""}
            onChange={(e) => onChange({ ...value, boothInfo: e.target.value })}
            placeholder="Stand B-42"
            className="bg-silex border-parchemin/20 text-parchemin"
          />
        </div>
      </div>
      <Separator className="bg-parchemin/10" />
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-parchemin">
          Fossiles présentés
        </h4>
        <Button
          type="button"
          size="sm"
          onClick={() =>
            onChange({ ...value, fossils: [...value.fossils, emptyFossil()] })
          }
          className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground h-8 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
        </Button>
      </div>
      <div className="space-y-3">
        {value.fossils.map((f, i) => (
          <FossilItemEditor
            key={f.id}
            fossil={f}
            onChange={(updated) => {
              const list = [...value.fossils];
              list[i] = updated;
              onChange({ ...value, fossils: list });
            }}
            onRemove={() =>
              onChange({
                ...value,
                fossils: value.fossils.filter((_, j) => j !== i),
              })
            }
          />
        ))}
        {value.fossils.length === 0 && (
          <p className="text-center text-sm text-parchemin/40 py-4">
            Aucun fossile ajouté
          </p>
        )}
      </div>
    </div>
  );
}

function FouilleForm({
  value,
  onChange,
}: {
  value: FouilleData;
  onChange: (v: FouilleData) => void;
}) {
  const [findingInput, setFindingInput] = useState("");
  const [memberInput, setMemberInput] = useState("");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-parchemin/80 mb-1.5 block">
            Destination *
          </Label>
          <Input
            value={value.destination}
            onChange={(e) =>
              onChange({ ...value, destination: e.target.value })
            }
            className="bg-silex border-parchemin/20 text-parchemin"
          />
        </div>
        <div>
          <Label className="text-parchemin/80 mb-1.5 block">Pays</Label>
          <Input
            value={value.country ?? ""}
            onChange={(e) => onChange({ ...value, country: e.target.value })}
            className="bg-silex border-parchemin/20 text-parchemin"
          />
        </div>
        <div>
          <Label className="text-parchemin/80 mb-1.5 block">
            Date de départ *
          </Label>
          <Input
            type="date"
            value={value.dateStart}
            onChange={(e) => onChange({ ...value, dateStart: e.target.value })}
            className="bg-silex border-parchemin/20 text-parchemin"
          />
        </div>
        <div>
          <Label className="text-parchemin/80 mb-1.5 block">
            Date de retour
          </Label>
          <Input
            type="date"
            value={value.dateEnd ?? ""}
            onChange={(e) => onChange({ ...value, dateEnd: e.target.value })}
            className="bg-silex border-parchemin/20 text-parchemin"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-parchemin/80 mb-1.5 block">Résumé *</Label>
          <Textarea
            value={value.summary}
            onChange={(e) => onChange({ ...value, summary: e.target.value })}
            className="bg-silex border-parchemin/20 text-parchemin min-h-[80px]"
          />
        </div>
      </div>
      <Separator className="bg-parchemin/10" />
      <div>
        <Label className="text-parchemin/80 mb-2 block text-sm font-semibold">
          Équipe
        </Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (memberInput.trim()) {
                  onChange({
                    ...value,
                    team: [...value.team, memberInput.trim()],
                  });
                  setMemberInput("");
                }
              }
            }}
            placeholder="Prénom Nom..."
            className="bg-silex border-parchemin/20 text-parchemin"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (memberInput.trim()) {
                onChange({
                  ...value,
                  team: [...value.team, memberInput.trim()],
                });
                setMemberInput("");
              }
            }}
            className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {value.team.map((m, i) => (
            <Badge
              key={i}
              className="bg-parchemin/10 text-parchemin border-parchemin/20 gap-1"
            >
              {m}
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    team: value.team.filter((_, j) => j !== i),
                  })
                }
                className="hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
      <Separator className="bg-parchemin/10" />
      <div>
        <Label className="text-parchemin/80 mb-2 block text-sm font-semibold">
          Découvertes
        </Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={findingInput}
            onChange={(e) => setFindingInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (findingInput.trim()) {
                  onChange({
                    ...value,
                    findings: [...value.findings, findingInput.trim()],
                  });
                  setFindingInput("");
                }
              }
            }}
            placeholder="Ammonite Jurassique..."
            className="bg-silex border-parchemin/20 text-parchemin"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (findingInput.trim()) {
                onChange({
                  ...value,
                  findings: [...value.findings, findingInput.trim()],
                });
                setFindingInput("");
              }
            }}
            className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-1">
          {value.findings.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-parchemin/80 bg-parchemin/5 rounded px-3 py-1.5"
            >
              <span className="flex-1">{f}</span>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    findings: value.findings.filter((_, j) => j !== i),
                  })
                }
                className="text-parchemin/30 hover:text-red-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArrivageForm({
  value,
  onChange,
}: {
  value: ArrivageData;
  onChange: (v: ArrivageData) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-parchemin/80 mb-1.5 block">
            Date d&apos;arrivée *
          </Label>
          <Input
            type="date"
            value={value.arrivedAt}
            onChange={(e) => onChange({ ...value, arrivedAt: e.target.value })}
            className="bg-silex border-parchemin/20 text-parchemin"
          />
        </div>
        <div>
          <Label className="text-parchemin/80 mb-1.5 block">
            Origine / Fournisseur
          </Label>
          <Input
            value={value.origin ?? ""}
            onChange={(e) => onChange({ ...value, origin: e.target.value })}
            placeholder="Maroc, Atlas"
            className="bg-silex border-parchemin/20 text-parchemin"
          />
        </div>
      </div>
      <Separator className="bg-parchemin/10" />
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-parchemin">
          Fossiles arrivés
        </h4>
        <Button
          type="button"
          size="sm"
          onClick={() =>
            onChange({ ...value, fossils: [...value.fossils, emptyFossil()] })
          }
          className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground h-8 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
        </Button>
      </div>
      <div className="space-y-3">
        {value.fossils.map((f, i) => (
          <FossilItemEditor
            key={f.id}
            fossil={f}
            onChange={(updated) => {
              const list = [...value.fossils];
              list[i] = updated;
              onChange({ ...value, fossils: list });
            }}
            onRemove={() =>
              onChange({
                ...value,
                fossils: value.fossils.filter((_, j) => j !== i),
              })
            }
          />
        ))}
        {value.fossils.length === 0 && (
          <p className="text-center text-sm text-parchemin/40 py-4">
            Aucun fossile ajouté
          </p>
        )}
      </div>
    </div>
  );
}

function PlanningForm({
  value,
  onChange,
}: {
  value: PlanningData;
  onChange: (v: PlanningData) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-parchemin">
          Sujets planifiés
        </h4>
        <Button
          type="button"
          size="sm"
          onClick={() =>
            onChange({ ...value, topics: [...value.topics, emptyTopic()] })
          }
          className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground h-8 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Sujet
        </Button>
      </div>
      <div className="space-y-3">
        {value.topics.map((topic, i) => (
          <div
            key={topic.id}
            className="rounded-xl border border-parchemin/10 bg-silex/60 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Input
                      value={topic.title}
                      onChange={(e) => {
                        const list = [...value.topics];
                        list[i] = { ...topic, title: e.target.value };
                        onChange({ ...value, topics: list });
                      }}
                      placeholder="Titre de l'article prévu..."
                      className="bg-silex border-parchemin/20 text-parchemin text-sm h-9"
                    />
                  </div>
                  <Select
                    value={topic.status}
                    onValueChange={(v) => {
                      const list = [...value.topics];
                      list[i] = {
                        ...topic,
                        status: v as PlanningTopic["status"],
                      };
                      onChange({ ...value, topics: list });
                    }}
                  >
                    <SelectTrigger className="bg-silex border-parchemin/20 text-parchemin h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.keys(
                          PLANNING_STATUS_LABELS,
                        ) as PlanningTopic["status"][]
                      ).map((s) => (
                        <SelectItem key={s} value={s}>
                          {PLANNING_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={topic.category ?? ""}
                    onChange={(e) => {
                      const list = [...value.topics];
                      list[i] = { ...topic, category: e.target.value };
                      onChange({ ...value, topics: list });
                    }}
                    placeholder="Catégorie"
                    className="bg-silex border-parchemin/20 text-parchemin text-sm h-9"
                  />
                  <Input
                    value={topic.notes ?? ""}
                    onChange={(e) => {
                      const list = [...value.topics];
                      list[i] = { ...topic, notes: e.target.value };
                      onChange({ ...value, topics: list });
                    }}
                    placeholder="Notes..."
                    className="bg-silex border-parchemin/20 text-parchemin text-sm h-9"
                  />
                </div>
                <Badge
                  className={`${PLANNING_STATUS_COLORS[topic.status]} text-xs border`}
                >
                  {PLANNING_STATUS_LABELS[topic.status]}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  onChange({
                    ...value,
                    topics: value.topics.filter((_, j) => j !== i),
                  })
                }
                className="text-parchemin/30 hover:text-red-400 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {value.topics.length === 0 && (
          <p className="text-center text-sm text-parchemin/40 py-4">
            Aucun sujet planifié
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface EditActivitesFormProps {
  post: EditableBlogPost;
  lang: "en" | "fr";
}

export default function EditActivitesForm({
  post,
  lang,
}: EditActivitesFormProps) {
  const router = useRouter();

  // Parse stored structuredData
  const parsed = parseActivitesData(post.structuredData ?? null);
  const activiteType: ActiviteType = (parsed?.type ?? "SALON") as ActiviteType;

  // ── Sub-form state ────────────────────────────────────────────────────────
  const [salon, setSalon] = useState<SalonData>(
    parsed?.type === "SALON"
      ? parsed.salon
      : {
          eventName: "",
          location: "",
          organizer: "",
          dateStart: "",
          dateEnd: "",
          boothInfo: "",
          fossils: [],
        },
  );
  const [fouille, setFouille] = useState<FouilleData>(
    parsed?.type === "FOUILLE"
      ? parsed.fouille
      : {
          destination: "",
          country: "",
          dateStart: "",
          dateEnd: "",
          team: [],
          summary: "",
          findings: [],
          photos: [],
        },
  );
  const [arrivage, setArrivage] = useState<ArrivageData>(
    parsed?.type === "ARRIVAGE"
      ? parsed.arrivage
      : { arrivedAt: "", origin: "", fossils: [] },
  );
  const [planning, setPlanning] = useState<PlanningData>(
    parsed?.type === "PLANNING" ? parsed.planning : { topics: [] },
  );

  // ── Common fields ─────────────────────────────────────────────────────────
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [slugManual, setSlugManual] = useState(true); // locked on edit
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [content, setContent] = useState(post.content);
  const [featuredImage, setFeaturedImage] = useState(post.featuredImage ?? "");
  const [imageAlt, setImageAlt] = useState(post.imageAlt ?? "");
  const [status, setStatus] = useState<BlogStatus>(post.status);
  const [publishedAt, setPublishedAt] = useState(
    post.publishedAt ? post.publishedAt.slice(0, 16) : "",
  );
  const [readTime, setReadTime] = useState(
    post.readTime ? String(post.readTime) : "",
  );
  const [seoTitle, setSeoTitle] = useState(post.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    post.seoDescription ?? "",
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    post.tagIds ?? [],
  );
  const [allTags, setAllTags] = useState<BlogTag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllBlogTags().then(setAllTags);
  }, []);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    const result = await createBlogTag(newTagName.trim());
    if (result.success && result.tag) {
      setAllTags((prev) => [...prev, result.tag!]);
      setSelectedTagIds((prev) => [...prev, result.tag!.id]);
      setNewTagName("");
    } else {
      toast.error("Erreur lors de la création du tag");
    }
  };

  const buildStructuredData = (): ActivitesData => {
    if (activiteType === "SALON") return { type: "SALON", salon };
    if (activiteType === "FOUILLE") return { type: "FOUILLE", fouille };
    if (activiteType === "ARRIVAGE") return { type: "ARRIVAGE", arrivage };
    return { type: "PLANNING", planning };
  };

  const handleSubmit = async (overrideStatus?: BlogStatus) => {
    if (!title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    if (!slug.trim()) {
      toast.error("Le slug est requis");
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateBlogArticle(post.id, {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        featuredImage: featuredImage.trim() || null,
        imageAlt: imageAlt.trim() || null,
        category: BlogCategory.ACTIVITES_PALEOLITHO,
        status: overrideStatus ?? status,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        tagIds: selectedTagIds,
        structuredData: buildStructuredData(),
      });

      toast.success("Article mis à jour !");
      router.push(`/${lang}/blog/${result.article.slug}`);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const typeMeta = TYPE_META[activiteType];
  const TypeIcon = typeMeta.icon;

  return (
    <div className="min-h-screen bg-silex">
      {/* Header */}
      <div className="border-b border-parchemin/10 sticky top-0 z-30 bg-silex/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${typeMeta.gradient} flex items-center justify-center`}
          >
            <TypeIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-parchemin">
              {typeMeta.label}
            </h1>
            <p className="text-xs text-parchemin/40 truncate">
              &quot;{post.title}&quot;
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSubmit(BlogStatus.ARCHIVED)}
              disabled={submitting}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1.5"
            >
              <Archive className="w-4 h-4" /> Archiver
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSubmit(BlogStatus.DRAFT)}
              disabled={submitting}
              className="border-parchemin/30 text-parchemin hover:bg-parchemin/10 gap-1.5"
            >
              <Save className="w-4 h-4" /> Sauvegarder
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleSubmit(BlogStatus.PUBLISHED)}
              disabled={submitting}
              className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground gap-1.5"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              Publier
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
          {/* Left */}
          <div className="space-y-6">
            {/* Type badge (locked) */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-parchemin/10 bg-silex/60">
              <div
                className={`w-9 h-9 rounded-lg bg-gradient-to-br ${typeMeta.gradient} flex items-center justify-center shrink-0`}
              >
                <TypeIcon className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-parchemin">
                  {typeMeta.label}
                </p>
                <p className="text-xs text-parchemin/40">
                  Type verrouillé — modifier l&apos;article pour changer
                </p>
              </div>
              <Badge className="ml-auto bg-parchemin/10 text-parchemin border-parchemin/20 text-xs">
                {post.status}
              </Badge>
            </div>

            {/* Structured data */}
            <Card className="bg-silex border-parchemin/10">
              <CardHeader>
                <CardTitle className="text-parchemin text-base">
                  Données structurées
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activiteType === "SALON" && (
                  <SalonForm value={salon} onChange={setSalon} />
                )}
                {activiteType === "FOUILLE" && (
                  <FouilleForm value={fouille} onChange={setFouille} />
                )}
                {activiteType === "ARRIVAGE" && (
                  <ArrivageForm value={arrivage} onChange={setArrivage} />
                )}
                {activiteType === "PLANNING" && (
                  <PlanningForm value={planning} onChange={setPlanning} />
                )}
              </CardContent>
            </Card>

            {/* Editorial content */}
            <Card className="bg-silex border-parchemin/10">
              <CardHeader>
                <CardTitle className="text-parchemin text-base">
                  Contenu éditorial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-parchemin/80 mb-1.5 block">
                    Titre *
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-silex border-parchemin/20 text-parchemin"
                  />
                </div>
                <div>
                  <Label className="text-parchemin/80 mb-1.5 block">
                    Slug (URL)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setSlugManual(true);
                      }}
                      className="bg-silex border-parchemin/20 text-parchemin font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSlug(generateSlug(title));
                        setSlugManual(false);
                      }}
                      className="border-parchemin/30 text-parchemin hover:bg-parchemin/10 shrink-0 text-xs"
                    >
                      Auto
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-parchemin/80 mb-1.5 block">
                    Résumé
                  </Label>
                  <Textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="bg-silex border-parchemin/20 text-parchemin min-h-[80px]"
                  />
                </div>
                <div>
                  <Label className="text-parchemin/80 mb-1.5 block">
                    Contenu principal
                  </Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-silex border-parchemin/20 text-parchemin min-h-[160px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <Card className="bg-silex border-parchemin/10">
              <CardHeader>
                <CardTitle className="text-parchemin text-sm">
                  Publication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-parchemin/80 mb-1.5 block text-sm">
                    Statut
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as BlogStatus)}
                  >
                    <SelectTrigger className="bg-silex border-parchemin/20 text-parchemin">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BlogStatus.DRAFT}>
                        Brouillon
                      </SelectItem>
                      <SelectItem value={BlogStatus.PUBLISHED}>
                        Publié
                      </SelectItem>
                      <SelectItem value={BlogStatus.SCHEDULED}>
                        Planifié
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {status === BlogStatus.SCHEDULED && (
                  <div>
                    <Label className="text-parchemin/80 mb-1.5 block text-sm">
                      Date de publication
                    </Label>
                    <Input
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      className="bg-silex border-parchemin/20 text-parchemin text-sm"
                    />
                  </div>
                )}
                <div>
                  <Label className="text-parchemin/80 mb-1.5 block text-sm">
                    Temps de lecture (min)
                  </Label>
                  <Input
                    type="number"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="bg-silex border-parchemin/20 text-parchemin text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image */}
            <Card className="bg-silex border-parchemin/10">
              <CardHeader>
                <CardTitle className="text-parchemin text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Image à la une
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://..."
                  className="bg-silex border-parchemin/20 text-parchemin text-sm"
                />
                {featuredImage && (
                  <img
                    src={featuredImage}
                    alt={imageAlt}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                )}
                <Input
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Texte alternatif..."
                  className="bg-silex border-parchemin/20 text-parchemin text-sm"
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="bg-silex border-parchemin/10">
              <CardHeader>
                <CardTitle className="text-parchemin text-sm">Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => {
                    const active = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() =>
                          setSelectedTagIds(
                            active
                              ? selectedTagIds.filter((id) => id !== tag.id)
                              : [...selectedTagIds, tag.id],
                          )
                        }
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${active ? "bg-terracotta text-primary-foreground border-terracotta" : "bg-transparent text-parchemin/60 border-parchemin/20 hover:border-parchemin/40 hover:text-parchemin"}`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
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
                    onClick={handleCreateTag}
                    className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card className="bg-silex border-parchemin/10">
              <CardHeader>
                <CardTitle className="text-parchemin text-sm">SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-parchemin/80 mb-1.5 block text-sm">
                    Titre SEO
                  </Label>
                  <Input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={title || "Titre SEO..."}
                    className="bg-silex border-parchemin/20 text-parchemin text-sm"
                  />
                </div>
                <div>
                  <Label className="text-parchemin/80 mb-1.5 block text-sm">
                    Meta description
                  </Label>
                  <Textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="bg-silex border-parchemin/20 text-parchemin text-sm min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
