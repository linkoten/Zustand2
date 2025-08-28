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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
  Star, // ✅ Ajout de l'icône Star
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { FavoriteButton } from "../product/favoriteButton";
import StarRating from "@/components/rating/starRating"; // ✅ Import du composant StarRating
import { FossilesClientProps } from "@/types/productType";

export default function FossilesClient({
  fossils,
  filterOptions,
}: FossilesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const isAdmin = user?.publicMetadata?.role === "admin";

  // ✅ Console.log pour déboguer les données reçues
  console.log(
    "🦕 FossilesClient - Fossils data:",
    fossils.map((f) => ({
      id: f.id,
      title: f.title,
      averageRating: f.averageRating,
      totalRatings: f.totalRatings,
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [selectedCountry, setSelectedCountry] = useState(
    searchParams.get("countryOfOrigin") || ""
  );
  const [selectedLocality, setSelectedLocality] = useState(
    searchParams.get("locality") || ""
  );
  const [selectedPeriod, setSelectedPeriod] = useState(
    searchParams.get("geologicalPeriod") || ""
  );
  const [selectedStage, setSelectedStage] = useState(
    searchParams.get("geologicalStage") || ""
  );
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (productId: number) => {
    if (!isAdmin) return;

    setDeletingId(productId);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      toast.success("Produit supprimé avec succès");
      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression du produit");
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrage des fossiles...
  const filteredFossils = useMemo(() => {
    return fossils.filter((fossil) => {
      const matchesSearch = fossil.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || fossil.category === selectedCategory;
      const matchesCountry =
        !selectedCountry || fossil.countryOfOrigin === selectedCountry;
      const matchesLocality =
        !selectedLocality || fossil.locality === selectedLocality;
      const matchesPeriod =
        !selectedPeriod || fossil.geologicalPeriod === selectedPeriod;
      const matchesStage =
        !selectedStage || fossil.geologicalStage === selectedStage;

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
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedCountry) params.set("countryOfOrigin", selectedCountry);
    if (selectedLocality) params.set("locality", selectedLocality);
    if (selectedPeriod) params.set("geologicalPeriod", selectedPeriod);
    if (selectedStage) params.set("geologicalStage", selectedStage);

    router.push(`/fossiles?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedCountry("");
    setSelectedLocality("");
    setSelectedPeriod("");
    setSelectedStage("");
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
                      <SelectItem value="">Toutes les catégories</SelectItem>
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
                      <SelectItem value="">Tous les pays</SelectItem>
                      {filterOptions.countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
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
                      <SelectItem value="">Toutes les périodes</SelectItem>
                      {filterOptions.geologicalPeriods.map((period) => (
                        <SelectItem key={period} value={period}>
                          {period}
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
        {filteredFossils.map((fossil) => {
          // ✅ Console.log pour chaque fossile
          console.log(`⭐ Fossil ${fossil.id} ratings:`, {
            averageRating: fossil.averageRating,
            totalRatings: fossil.totalRatings,
            hasRatings: fossil.totalRatings && fossil.totalRatings > 0,
          });

          return (
            <Card
              key={fossil.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardHeader className="p-0">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  {fossil.images?.[0] ? (
                    <Image
                      src={fossil.images[0].imageUrl}
                      alt={fossil.images[0].altText || fossil.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">
                        Pas d&apos;image
                      </span>
                    </div>
                  )}

                  {/* ✅ Bouton favori en overlay (top-left) */}
                  <div className="absolute top-2 left-2">
                    <FavoriteButton
                      productId={fossil.id}
                      isFavorite={fossil.isFavorite || false}
                      variant="overlay"
                      size="sm"
                    />
                  </div>

                  {/* Boutons admin en overlay (top-right) */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button
                          asChild
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                        >
                          <Link href={`/fossiles/${fossil.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              disabled={deletingId === fossil.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Confirmer la suppression
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer le fossile
                                &quot;
                                {fossil.title}&quot; ? Cette action est
                                irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(fossil.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg leading-tight">
                      {fossil.title}
                    </h3>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {fossil.category}
                    </Badge>
                  </div>

                  <p className="text-2xl font-bold text-primary">
                    {fossil.price.toLocaleString("fr-FR")} €
                  </p>

                  {/* ✅ NOUVELLE section pour les ratings */}
                  <div className="flex items-center gap-2 py-2">
                    {fossil.totalRatings && fossil.totalRatings > 0 ? (
                      <>
                        <StarRating
                          rating={fossil.averageRating || 0}
                          readonly
                          size="sm"
                        />
                        <span className="text-sm text-muted-foreground">
                          {fossil.averageRating?.toFixed(1)} (
                          {fossil.totalRatings} avis)
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Star className="h-4 w-4 text-gray-300" />
                        Aucun avis
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <strong>Origine :</strong> {fossil.countryOfOrigin}
                    </p>
                    {fossil.locality && (
                      <p>
                        <strong>Localité :</strong> {fossil.locality}
                      </p>
                    )}
                    <p>
                      <strong>Période :</strong> {fossil.geologicalPeriod}
                    </p>
                    {fossil.geologicalStage && (
                      <p>
                        <strong>Étage :</strong> {fossil.geologicalStage}
                      </p>
                    )}
                  </div>

                  <Button asChild className="w-full mt-4">
                    <Link href={`/fossiles/${fossil.id}`}>
                      Voir les détails
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
