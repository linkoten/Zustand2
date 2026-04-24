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
import { createFossilSpecies } from "@/lib/actions/collectionActions";
import {
  Category,
  FossilRarity,
  GeologicalPeriod,
} from "@/lib/generated/prisma";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "TRILOBITE", label: "Trilobite" },
  { value: "AMMONITE", label: "Ammonite" },
  { value: "DENT", label: "Dent" },
  { value: "ECHINODERME", label: "Échinoderme" },
  { value: "POISSON", label: "Poisson" },
  { value: "VERTEBRE", label: "Vertébré" },
  { value: "GASTROPODE", label: "Gastéropode" },
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

interface CreateSpeciesFormProps {
  localities: Locality[];
  onSuccess?: () => void;
}

export default function CreateSpeciesForm({
  localities,
  onSuccess,
}: CreateSpeciesFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    genus: "",
    species: "",
    commonName: "",
    description: "",
    localityId: "",
    geologicalPeriod: "" as GeologicalPeriod | "",
    geologicalStage: "",
    category: "" as Category | "",
    countryOfOrigin: "",
    rarity: "" as FossilRarity | "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.genus ||
      !form.species ||
      !form.localityId ||
      !form.geologicalPeriod ||
      !form.category ||
      !form.countryOfOrigin ||
      !form.geologicalStage
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      await createFossilSpecies({
        genus: form.genus,
        species: form.species,
        commonName: form.commonName || undefined,
        description: form.description || undefined,
        localityId: Number(form.localityId),
        geologicalPeriod: form.geologicalPeriod as GeologicalPeriod,
        geologicalStage: form.geologicalStage,
        category: form.category as Category,
        countryOfOrigin: form.countryOfOrigin,
        rarity: (form.rarity as FossilRarity) || undefined,
        photos: [],
      });
      toast.success("Espèce créée avec succès");
      router.refresh();
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la création",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-silex/20">
      <CardHeader>
        <CardTitle className="text-parchemin font-playfair">
          Nouvelle espèce fossile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="genus" className="text-parchemin/80">
                Genre *
              </Label>
              <Input
                id="genus"
                value={form.genus}
                onChange={(e) => set("genus", e.target.value)}
                className="bg-silex/50 border-silex/30 text-parchemin"
                placeholder="ex: Calymene"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="species" className="text-parchemin/80">
                Espèce *
              </Label>
              <Input
                id="species"
                value={form.species}
                onChange={(e) => set("species", e.target.value)}
                className="bg-silex/50 border-silex/30 text-parchemin"
                placeholder="ex: blumenbachii"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="commonName" className="text-parchemin/80">
              Nom commun
            </Label>
            <Input
              id="commonName"
              value={form.commonName}
              onChange={(e) => set("commonName", e.target.value)}
              className="bg-silex/50 border-silex/30 text-parchemin"
              placeholder="ex: Trilobite de Wenlock"
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
                  <SelectValue placeholder="Choisir..." />
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
                  <SelectValue placeholder="Choisir..." />
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
              <Label htmlFor="countryOfOrigin" className="text-parchemin/80">
                Pays *
              </Label>
              <Input
                id="countryOfOrigin"
                value={form.countryOfOrigin}
                onChange={(e) => set("countryOfOrigin", e.target.value)}
                className="bg-silex/50 border-silex/30 text-parchemin"
                placeholder="ex: Maroc"
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
                  <SelectValue placeholder="Choisir..." />
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
              <Label htmlFor="geologicalStage" className="text-parchemin/80">
                Étage *
              </Label>
              <Input
                id="geologicalStage"
                value={form.geologicalStage}
                onChange={(e) => set("geologicalStage", e.target.value)}
                className="bg-silex/50 border-silex/30 text-parchemin"
                placeholder="ex: Llanvirn"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-parchemin/80">
              Description
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="bg-silex/50 border-silex/30 text-parchemin min-h-[100px]"
              placeholder="Description scientifique ou anecdotique..."
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta hover:bg-terracotta/90 text-primary-foreground"
          >
            {loading ? "Création..." : "Créer l'espèce"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
