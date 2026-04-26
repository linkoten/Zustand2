"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import {
  updateFossilSpecies,
  deleteFossilSpecies,
} from "@/lib/actions/collectionActions";
import {
  Category,
  FossilRarity,
  GeologicalPeriod,
} from "@/lib/generated/prisma";
import { FossilSpeciesDetail } from "@/types/collectionType";
import { Trash2 } from "lucide-react";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "TRILOBITE", label: "Trilobite" },
  { value: "AMMONITE", label: "Ammonite" },
  { value: "DENT", label: "Dent" },
  { value: "ECHINODERME", label: "Échinoderme" },
  { value: "POISSON", label: "Poisson" },
  { value: "VERTEBRE", label: "Vertébré" },
  { value: "GASTEROPODE", label: "Gastéropode" },
  { value: "AUTRE_ARTHROPODE", label: "Autre arthropode" },
  { value: "AUTRES", label: "Autres" },
];

const GEO_PERIODS: GeologicalPeriod[] = [
  "CAMBRIEN",
  "ORDOVICIEN",
  "SILURIEN",
  "DEVONIEN",
  "CARBONIFERE",
  "PERMIEN",
  "TRIAS",
  "JURASSIQUE",
  "CRETACE",
  "PALEOGENE",
  "NEOGENE",
  "QUATERNAIRE",
];

const RARITY_OPTIONS: { value: FossilRarity; label: string }[] = [
  { value: "COMMUN", label: "Commun" },
  { value: "PEU_COMMUN", label: "Peu commun" },
  { value: "RARE", label: "Rare" },
  { value: "TRES_RARE", label: "Très rare" },
  { value: "EXCEPTIONNEL", label: "Exceptionnel" },
];

interface Locality {
  id: number;
  name: string;
}

interface EditSpeciesFormProps {
  species: FossilSpeciesDetail;
  localities: Locality[];
  onSuccess?: () => void;
}

export default function EditSpeciesForm({
  species,
  localities,
  onSuccess,
}: EditSpeciesFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    genus: species.genus,
    species: species.species,
    commonName: species.commonName ?? "",
    description: species.description ?? "",
    localityId: String(species.localityId),
    geologicalPeriod: species.geologicalPeriod as GeologicalPeriod,
    geologicalStage: species.geologicalStage,
    category: species.category as Category,
    countryOfOrigin: species.countryOfOrigin,
    rarity: (species.rarity ?? "") as FossilRarity | "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateFossilSpecies(species.id, {
        genus: form.genus,
        species: form.species,
        commonName: form.commonName || undefined,
        description: form.description || undefined,
        localityId: Number(form.localityId),
        geologicalPeriod: form.geologicalPeriod,
        geologicalStage: form.geologicalStage,
        category: form.category,
        countryOfOrigin: form.countryOfOrigin,
        rarity: (form.rarity as FossilRarity) || undefined,
      });
      toast.success("Espèce mise à jour");
      router.refresh();
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Supprimer "${species.genus} ${species.species}" ? Cette action est irréversible.`,
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteFossilSpecies(species.id);
      toast.success("Espèce supprimée");
      router.push("./");
      router.refresh();
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la suppression",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="border-silex/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-parchemin font-playfair">
          Modifier {species.genus} {species.species}
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          {deleting ? "Suppression..." : "Supprimer"}
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-parchemin/80">Genre *</Label>
              <Input
                value={form.genus}
                onChange={(e) => set("genus", e.target.value)}
                className="bg-silex/50 border-silex/30 text-parchemin"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-parchemin/80">Espèce *</Label>
              <Input
                value={form.species}
                onChange={(e) => set("species", e.target.value)}
                className="bg-silex/50 border-silex/30 text-parchemin"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-parchemin/80">Nom commun</Label>
            <Input
              value={form.commonName}
              onChange={(e) => set("commonName", e.target.value)}
              className="bg-silex/50 border-silex/30 text-parchemin"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-parchemin/80">Catégorie *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v)}
              >
                <SelectTrigger className="bg-silex/50 border-silex/30 text-parchemin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-parchemin/80">Rareté</Label>
              <Select
                value={form.rarity}
                onValueChange={(v) => set("rarity", v)}
              >
                <SelectTrigger className="bg-silex/50 border-silex/30 text-parchemin">
                  <SelectValue placeholder="Non défini" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Non défini</SelectItem>
                  {RARITY_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-parchemin/80">Gisement *</Label>
              <Select
                value={form.localityId}
                onValueChange={(v) => set("localityId", v)}
              >
                <SelectTrigger className="bg-silex/50 border-silex/30 text-parchemin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {localities.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-parchemin/80">Pays *</Label>
              <Input
                value={form.countryOfOrigin}
                onChange={(e) => set("countryOfOrigin", e.target.value)}
                className="bg-silex/50 border-silex/30 text-parchemin"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-parchemin/80">Période géologique *</Label>
              <Select
                value={form.geologicalPeriod}
                onValueChange={(v) => set("geologicalPeriod", v)}
              >
                <SelectTrigger className="bg-silex/50 border-silex/30 text-parchemin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GEO_PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-parchemin/80">Étage *</Label>
              <Input
                value={form.geologicalStage}
                onChange={(e) => set("geologicalStage", e.target.value)}
                className="bg-silex/50 border-silex/30 text-parchemin"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-parchemin/80">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="bg-silex/50 border-silex/30 text-parchemin min-h-[100px]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta hover:bg-terracotta/90 text-primary-foreground"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
