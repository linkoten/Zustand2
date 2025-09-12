"use client";

import { useState, useTransition } from "react";
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
import { EditableProduct } from "@/types/productType";
import { categories, geologicalPeriods } from "@/lib/constant";
import { updateProductAction } from "@/lib/actions/productActions";
import { Category, GeologicalPeriod } from "@/lib/generated/prisma";

const statusOptions = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "SOLD", label: "Vendu" },
  { value: "RESERVED", label: "Réservé" },
];

interface EditProductFormProps {
  product: EditableProduct;
  localities?: { id: number; name: string }[];
}

export default function EditProductForm({
  product,
  localities,
}: EditProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description || "",
    description2: product.description2 || "",

    price: product.price.toString(),
    category: product.category,
    countryOfOrigin: product.countryOfOrigin,
    locality: product.locality?.id?.toString() || "",
    geologicalPeriod: product.geologicalPeriod,
    geologicalStage: product.geologicalStage || "",
    weight: product.weight?.toString() || "",
    status: product.status,
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const result = await updateProductAction({
          id: product.id,
          title: formData.title,
          description: formData.description,
          description2: formData.description2,

          price: parseFloat(formData.price),
          category: formData.category as Category,
          countryOfOrigin: formData.countryOfOrigin,
          locality: formData.locality ? Number(formData.locality) : undefined, // 👈 id ou undefined
          geologicalPeriod: formData.geologicalPeriod as GeologicalPeriod,
          geologicalStage: formData.geologicalStage,
          weight: formData.weight ? parseFloat(formData.weight) : 0,
          status: formData.status,
        });

        if (!result?.success) {
          throw new Error(result?.error || "Erreur lors de la mise à jour");
        }

        toast.success("Produit mis à jour avec succès !");
        router.push(`/fossiles/${product.id}`);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la mise à jour du produit");
      }
    });
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
          {localities ? (
            <Select
              value={formData.locality}
              onValueChange={(value) => handleInputChange("locality", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une localité" />
              </SelectTrigger>
              <SelectContent>
                {localities.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id.toString()}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="locality"
              value={formData.locality}
              onChange={(e) => handleInputChange("locality", e.target.value)}
              placeholder="ID de la localité"
            />
          )}
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
      <div>
        <Label htmlFor="description2">Description Anglais</Label>
        <Textarea
          id="description2"
          value={formData.description2}
          onChange={(e) => handleInputChange("description2", e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
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
