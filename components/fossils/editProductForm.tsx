"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Product } from "@/lib/generated/prisma";

// ✅ Utiliser un type personnalisé au lieu du type Prisma brut
interface EditableProduct {
  id: number;
  title: string;
  description: string | null;
  price: number; // ✅ number au lieu de Decimal
  category: string;
  countryOfOrigin: string;
  locality: string | null;
  geologicalPeriod: string;
  geologicalStage: string | null;
  weight: number | null;
  status: string;
}

interface EditProductFormProps {
  product: EditableProduct;
}

const categories = [
  { value: "TRILOBITE", label: "Trilobite" },
  { value: "AMMONITE", label: "Ammonite" },
  { value: "BRACHIOPOD", label: "Brachiopode" },
  { value: "CRINOID", label: "Crinoïde" },
  { value: "CORAL", label: "Corail" },
  { value: "PLANT", label: "Plante" },
  { value: "SHARK_TOOTH", label: "Dent de requin" },
  { value: "OTHER", label: "Autre" },
];

const geologicalPeriods = [
  { value: "CAMBRIAN", label: "Cambrien" },
  { value: "ORDOVICIAN", label: "Ordovicien" },
  { value: "SILURIAN", label: "Silurien" },
  { value: "DEVONIAN", label: "Dévonien" },
  { value: "CARBONIFEROUS", label: "Carbonifère" },
  { value: "PERMIAN", label: "Permien" },
  { value: "TRIASSIC", label: "Trias" },
  { value: "JURASSIC", label: "Jurassique" },
  { value: "CRETACEOUS", label: "Crétacé" },
  { value: "PALEOGENE", label: "Paléogène" },
  { value: "NEOGENE", label: "Néogène" },
];

const statusOptions = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "SOLD", label: "Vendu" },
  { value: "RESERVED", label: "Réservé" },
];

export default function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description || "",
    price: product.price.toString(),
    category: product.category,
    countryOfOrigin: product.countryOfOrigin,
    locality: product.locality || "",
    geologicalPeriod: product.geologicalPeriod,
    geologicalStage: product.geologicalStage || "",
    weight: product.weight?.toString() || "",
    status: product.status,
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          weight: formData.weight ? parseFloat(formData.weight) : null,
          locality: formData.locality || null,
          geologicalStage: formData.geologicalStage || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      toast.success("Produit mis à jour avec succès !");
      router.push(`/fossiles/${product.id}`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour du produit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Nom du fossile *</Label>
          <Input
            id="name"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="price">Prix (€) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Catégorie *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="geologicalPeriod">Période géologique *</Label>
          <Select
            value={formData.geologicalPeriod}
            onValueChange={(value) =>
              handleInputChange("geologicalPeriod", value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {geologicalPeriods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="countryOfOrigin">Pays d&apos;origine *</Label>
          <Input
            id="countryOfOrigin"
            value={formData.countryOfOrigin}
            onChange={(e) =>
              handleInputChange("countryOfOrigin", e.target.value)
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="locality">Localité</Label>
          <Input
            id="locality"
            value={formData.locality}
            onChange={(e) => handleInputChange("locality", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="geologicalStage">Étage géologique</Label>
          <Input
            id="geologicalStage"
            value={formData.geologicalStage}
            onChange={(e) =>
              handleInputChange("geologicalStage", e.target.value)
            }
          />
        </div>

        <div>
          <Label htmlFor="weight">Poids (g)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min="0"
            value={formData.weight}
            onChange={(e) => handleInputChange("weight", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="status">Statut *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mise à jour...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Mettre à jour
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
