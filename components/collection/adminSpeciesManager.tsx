"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Download, Pencil, Search } from "lucide-react";
import { importSpeciesFromProducts } from "@/lib/actions/collectionActions";
import {
  AdminCollectionStats,
  FossilSpeciesItem,
} from "@/types/collectionType";
import { FossilSpeciesDetail } from "@/types/collectionType";
import CreateSpeciesForm from "./createSpeciesForm";
import EditSpeciesForm from "./editSpeciesForm";

const CATEGORY_COLORS = {
  TRILOBITE: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  AMMONITE: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  DENT: "bg-red-500/20 text-red-300 border-red-500/30",
  ECHINODERME: "bg-green-500/20 text-green-300 border-green-500/30",
  POISSON: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  VERTEBRE: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  GASTROPODE: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  AUTRE_ARTHROPODE: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  AUTRES: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
} as const;

const RARITY_COLORS = {
  COMMUN: "text-parchemin/50",
  PEU_COMMUN: "text-green-400",
  RARE: "text-blue-400",
  TRES_RARE: "text-purple-400",
  EXCEPTIONNEL: "text-amber-400",
} as const;

const RARITY_LABELS = {
  COMMUN: "Commun",
  PEU_COMMUN: "Peu commun",
  RARE: "Rare",
  TRES_RARE: "Très rare",
  EXCEPTIONNEL: "Exceptionnel",
} as const;

interface Locality {
  id: number;
  name: string;
}

interface AdminSpeciesManagerProps {
  species: FossilSpeciesItem[];
  localities: Locality[];
  stats: AdminCollectionStats;
}

export default function AdminSpeciesManager({
  species,
  localities,
  stats,
}: AdminSpeciesManagerProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FossilSpeciesDetail | null>(
    null,
  );
  const [importing, setImporting] = useState(false);

  const filtered = species.filter(
    (s) =>
      s.genus.toLowerCase().includes(search.toLowerCase()) ||
      s.species.toLowerCase().includes(search.toLowerCase()) ||
      (s.commonName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      s.localityName.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleImport() {
    if (
      !confirm(
        "Importer les espèces depuis les produits existants ? Les doublons seront ignorés.",
      )
    )
      return;
    setImporting(true);
    try {
      const result = await importSpeciesFromProducts();
      toast.success(
        `Import terminé : ${result.created} créées, ${result.skipped} ignorées`,
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'import");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-silex/30 border-silex/20">
          <CardContent className="pt-4">
            <p className="text-parchemin/60 text-sm">Espèces cataloguées</p>
            <p className="text-3xl font-bold text-parchemin">
              {stats.totalSpecies}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-silex/30 border-silex/20">
          <CardContent className="pt-4">
            <p className="text-parchemin/60 text-sm">Collectionneurs</p>
            <p className="text-3xl font-bold text-parchemin">
              {stats.totalCollectors}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-silex/30 border-silex/20">
          <CardContent className="pt-4">
            <p className="text-parchemin/60 text-sm">Top wishlist</p>
            <p className="text-sm text-parchemin mt-1">
              {stats.topWishlisted[0]
                ? `${stats.topWishlisted[0].genus} ${stats.topWishlisted[0].species} (${stats.topWishlisted[0].wishlistCount})`
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions bar */}
      <Card className="bg-silex/20 border-silex/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-parchemin font-playfair">
              Catalogue des espèces
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImport}
                disabled={importing}
                className="border-silex/30 text-parchemin/70 hover:text-parchemin"
              >
                <Download className="w-4 h-4 mr-1" />
                {importing ? "Import..." : "Importer depuis produits"}
              </Button>
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nouvelle espèce
              </Button>
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchemin/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par genre, espèce, gisement..."
              className="pl-9 bg-silex/50 border-silex/30 text-parchemin"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-silex/20 hover:bg-transparent">
                <TableHead className="text-parchemin/60">
                  Genre / Espèce
                </TableHead>
                <TableHead className="text-parchemin/60">Catégorie</TableHead>
                <TableHead className="text-parchemin/60">Gisement</TableHead>
                <TableHead className="text-parchemin/60">Rareté</TableHead>
                <TableHead className="text-parchemin/60 text-right">
                  Wishlist
                </TableHead>
                <TableHead className="text-parchemin/60 text-right">
                  Produits
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-parchemin/40 py-12"
                  >
                    Aucune espèce trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow
                    key={s.id}
                    className="border-silex/10 hover:bg-silex/10"
                  >
                    <TableCell>
                      <p className="font-medium text-parchemin italic">
                        {s.genus} {s.species}
                      </p>
                      {s.commonName && (
                        <p className="text-parchemin/50 text-xs">
                          {s.commonName}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${CATEGORY_COLORS[s.category]}`}
                      >
                        {s.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-parchemin/70 text-sm">
                      {s.localityName}
                    </TableCell>
                    <TableCell>
                      {s.rarity ? (
                        <span
                          className={`text-xs font-medium ${RARITY_COLORS[s.rarity]}`}
                        >
                          {RARITY_LABELS[s.rarity]}
                        </span>
                      ) : (
                        <span className="text-parchemin/30 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-parchemin/70 text-sm">
                      {s.wishlistCount ?? 0}
                    </TableCell>
                    <TableCell className="text-right text-parchemin/70 text-sm">
                      {s.productCount ?? 0}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-parchemin/50 hover:text-parchemin"
                        onClick={() =>
                          setEditTarget({
                            ...s,
                            description: null,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            products: [],
                            userCollection: null,
                          })
                        }
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create sheet */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="bg-silex border-silex/30 w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-parchemin font-playfair">
              Nouvelle espèce
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)] pr-4 mt-4">
            <CreateSpeciesForm
              localities={localities}
              onSuccess={() => setCreateOpen(false)}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Edit sheet */}
      <Sheet
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <SheetContent className="bg-silex border-silex/30 w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-parchemin font-playfair">
              Modifier l&apos;espèce
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)] pr-4 mt-4">
            {editTarget && (
              <EditSpeciesForm
                species={editTarget}
                localities={localities}
                onSuccess={() => setEditTarget(null)}
              />
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
