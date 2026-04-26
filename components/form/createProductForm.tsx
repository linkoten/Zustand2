"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createProductAction } from "@/lib/actions/productActions";
import { Locality } from "@/lib/generated/prisma";
import GeneralInfoFields from "./generalInfoFields";
import ScientificInfoFields from "./scientificInfoFields";
import ProvenanceInfoFields from "./provenanceInfoFields";
import ImageInfoFields from "./imageInfoFields";

// ✅ Schema de validation avec weight
const productSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  category: z.enum([
    "TRILOBITE",
    "AMMONITE",
    "DENT",
    "ECHINODERME",
    "POISSON",
    "VERTEBRE",
    "GASTEROPODE",
    "AUTRE_ARTHROPODE",
    "AUTRES",
  ]),
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
  description2: z.string().optional().or(z.literal("")),

  weight: z.number().min(1, "Le poids doit être supérieur à 0 gramme"), // ✅ Nouveau champ
  images: z
    .array(
      z.object({
        url: z.string().min(1, "URL requise").url("URL invalide"),
        altText: z.string().optional().or(z.literal("")),
      }),
    )
    .min(1, "Au moins une image est requise")
    .refine(
      (images) => images.some((img) => img.url.trim()),
      "Au moins une image valide est requise",
    ),
});

export type ProductFormData = z.infer<typeof productSchema>;

export default function CreateProductForm({
  localities: initialLocalities,
}: {
  localities: Locality[];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [localities, setLocalities] = useState<Locality[]>(initialLocalities);

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
      description2: "",
      weight: 0, // ✅ Valeur par défaut pour le poids
      images: [{ url: "", altText: "" }],
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);

      console.log("📝 Données du formulaire:", data);

      // ✅ Nettoyer les données avant envoi
      const selectedLocality =
        localities.find((loc) => loc.id.toString() === data.locality) || null;

      if (!selectedLocality) {
        toast.error("Localité sélectionnée invalide.");
        setIsLoading(false);
        return;
      }

      const cleanData = {
        ...data,
        description:
          data.description && data.description.trim()
            ? data.description.trim()
            : undefined,
        description2:
          data.description && data.description.trim()
            ? data.description.trim()
            : undefined,
        images: data.images
          .filter((img) => img.url && img.url.trim())
          .map((img) => ({
            url: img.url.trim(),
            altText: img.altText?.trim() || undefined,
          })),
        locality: selectedLocality,
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
        <GeneralInfoFields form={form} />

        <ScientificInfoFields form={form} />

        <ProvenanceInfoFields
          form={form}
          localities={localities}
          onLocalityCreated={(locality) => {
            setLocalities((prev) => [...prev, locality]);
            form.setValue("locality", locality.id.toString());
          }}
        />

        <ImageInfoFields form={form} />

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
