"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Upload, X, Plus } from "lucide-react";
import { createProductAction } from "@/lib/actions/productActions";

// ✅ Schema de validation avec weight
const productSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  category: z.enum(["TRILOBITE", "AMMONITE", "DENT", "COQUILLAGE"]),
  genre: z.string().min(1, "Le genre est requis"),
  species: z.string().min(1, "L'espèce est requise"),
  price: z.number().min(0.01, "Le prix doit être supérieur à 0"),
  countryOfOrigin: z.string().min(1, "Le pays d'origine est requis"),
  locality: z.string().min(1, "La localité est requise"),
  geologicalPeriod: z.enum([
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
  ]),
  geologicalStage: z.string().min(1, "L'étage géologique est requis"),
  description: z.string().optional().or(z.literal("")),
  weight: z.number().min(1, "Le poids doit être supérieur à 0 gramme"), // ✅ Nouveau champ
  images: z
    .array(
      z.object({
        url: z.string().min(1, "URL requise").url("URL invalide"),
        altText: z.string().optional().or(z.literal("")),
      })
    )
    .min(1, "Au moins une image est requise")
    .refine(
      (images) => images.some((img) => img.url.trim()),
      "Au moins une image valide est requise"
    ),
});

type ProductFormData = z.infer<typeof productSchema>;

const categories = [
  { value: "TRILOBITE", label: "Trilobite" },
  { value: "AMMONITE", label: "Ammonite" },
  { value: "DENT", label: "Dent" },
  { value: "COQUILLAGE", label: "Coquillage" },
];

const geologicalPeriods = [
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
];

export default function CreateProductForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      category: "TRILOBITE",
      genre: "",
      species: "",
      price: 0,
      countryOfOrigin: "",
      locality: "",
      geologicalPeriod: "JURASSIQUE",
      geologicalStage: "",
      description: "",
      weight: 0, // ✅ Valeur par défaut pour le poids
      images: [{ url: "", altText: "" }],
    },
  });

  // ✅ Utiliser directement les valeurs du formulaire
  const watchedImages = form.watch("images");

  // ✅ Gestion des images simplifiée
  const addImage = () => {
    const currentImages = form.getValues("images");
    const newImages = [...currentImages, { url: "", altText: "" }];
    form.setValue("images", newImages);
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images");
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue("images", newImages);
  };

  const updateImage = (
    index: number,
    field: "url" | "altText",
    value: string
  ) => {
    const currentImages = form.getValues("images");
    const newImages = [...currentImages];
    newImages[index] = { ...newImages[index], [field]: value };
    form.setValue("images", newImages);
    form.trigger("images");
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);

      console.log("📝 Données du formulaire:", data);

      // ✅ Nettoyer les données avant envoi
      const cleanData = {
        ...data,
        description:
          data.description && data.description.trim()
            ? data.description.trim()
            : undefined,
        images: data.images
          .filter((img) => img.url && img.url.trim())
          .map((img) => ({
            url: img.url.trim(),
            altText: img.altText?.trim() || undefined,
          })),
      };

      console.log("📝 Données nettoyées:", cleanData);

      const result = await createProductAction(cleanData);

      if (result.success) {
        console.log("✅ Résultat:", result.data);
        toast.success("Produit créé avec succès !");
        router.push("/fossiles");
      } else {
        toast.error(result.error || "Erreur lors de la création du produit");
      }
    } catch (error) {
      console.error("Erreur création produit:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du produit</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Trilobite Calymene blumenbachi"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ✅ Nouveau champ poids */}
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poids (grammes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="500"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnelle)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description détaillée du fossile..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Informations scientifiques */}
        <Card>
          <CardHeader>
            <CardTitle>Classification scientifique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Calymene" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Espèce</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: blumenbachi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="geologicalPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Période géologique</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une période" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {geologicalPeriods.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="geologicalStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Étage géologique</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Wenlock" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Provenance */}
        <Card>
          <CardHeader>
            <CardTitle>Provenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="countryOfOrigin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays d&apos;origine</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: France" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localité</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Dudley, Worcestershire"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Images du produit
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImage}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une image
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {watchedImages.map((image, index) => (
              <div
                key={index}
                className="flex gap-4 items-start p-4 border rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <div>
                    <Label htmlFor={`image-url-${index}`}>
                      URL de l&apos;image
                    </Label>
                    <Input
                      id={`image-url-${index}`}
                      placeholder="https://example.com/image.jpg"
                      value={image.url || ""}
                      onChange={(e) =>
                        updateImage(index, "url", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`image-alt-${index}`}>
                      Texte alternatif (optionnel)
                    </Label>
                    <Input
                      id={`image-alt-${index}`}
                      placeholder="Description de l'image"
                      value={image.altText || ""}
                      onChange={(e) =>
                        updateImage(index, "altText", e.target.value)
                      }
                    />
                  </div>
                </div>

                {watchedImages.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Annuler
          </Button>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Créer le produit"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
