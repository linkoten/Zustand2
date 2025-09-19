import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormData } from "./createProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import { Label } from "../ui/label";

export default function ImageInfoFields({
  form,
}: {
  form: UseFormReturn<ProductFormData>;
}) {
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Images du produit
          <Button type="button" variant="outline" size="sm" onClick={addImage}>
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
                  onChange={(e) => updateImage(index, "url", e.target.value)}
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
  );
}
