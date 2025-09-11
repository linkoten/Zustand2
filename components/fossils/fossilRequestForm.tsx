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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { FossilRequestFormData } from "@/types/productType";
import { categories, geologicalPeriods } from "@/lib/constant";

const initialFormData: FossilRequestFormData = {
  name: "",
  email: "",
  phone: "",
  fossilType: "",
  description: "",
  maxBudget: "",
  geologicalPeriod: "",
  category: "",
  countryOfOrigin: "",
  locality: "",
};

interface FossilRequestFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export default function FossilRequestForm({ dict }: FossilRequestFormProps) {
  const [formData, setFormData] =
    useState<FossilRequestFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (
    field: keyof FossilRequestFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/fossil-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          maxBudget: formData.maxBudget ? parseFloat(formData.maxBudget) : null,
          geologicalPeriod: formData.geologicalPeriod || null,
          category: formData.category || null,
          countryOfOrigin: formData.countryOfOrigin || null,
          locality: formData.locality || null,
        }),
      });

      if (!response.ok) {
        throw new Error(
          dict?.fossilRequestForm?.submitError ||
            "Erreur lors de l'envoi de la demande"
        );
      }

      toast.success(
        dict?.fossilRequestForm?.successTitle ||
          "Demande envoyée avec succès !",
        {
          description:
            dict?.fossilRequestForm?.successDesc ||
            "Nous vous contacterons dans les plus brefs délais.",
        }
      );

      // Rediriger vers la page des fossiles
      router.push("/fossiles");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        dict?.fossilRequestForm?.submitError ||
          "Erreur lors de l'envoi de la demande",
        {
          description:
            dict?.fossilRequestForm?.submitErrorDesc ||
            "Veuillez réessayer plus tard.",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {dict?.fossilRequestForm?.contactInfo || "Informations de contact"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">
                {dict?.fossilRequestForm?.fullNameLabel || "Nom complet *"}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                placeholder={
                  dict?.fossilRequestForm?.fullNamePlaceholder ||
                  "Votre nom complet"
                }
              />
            </div>
            <div>
              <Label htmlFor="email">
                {dict?.fossilRequestForm?.emailLabel || "Email *"}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                placeholder={
                  dict?.fossilRequestForm?.emailPlaceholder || "votre@email.com"
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">
              {dict?.fossilRequestForm?.phoneLabel || "Téléphone"}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder={
                dict?.fossilRequestForm?.phonePlaceholder || "+33 1 23 45 67 89"
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Détails de la recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {dict?.fossilRequestForm?.searchDetails ||
              "Détails de votre recherche"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fossilType">
              {dict?.fossilRequestForm?.fossilTypeLabel ||
                "Type de fossile recherché *"}
            </Label>
            <Input
              id="fossilType"
              value={formData.fossilType}
              onChange={(e) => handleInputChange("fossilType", e.target.value)}
              required
              placeholder={
                dict?.fossilRequestForm?.fossilTypePlaceholder ||
                "Ex: Trilobite Calymene, Ammonite Pachydiscus..."
              }
            />
          </div>

          <div>
            <Label htmlFor="description">
              {dict?.fossilRequestForm?.descLabel || "Description détaillée *"}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
              placeholder={
                dict?.fossilRequestForm?.descPlaceholder ||
                "Décrivez en détail le fossile que vous recherchez : taille, époque, provenance souhaitée, état de conservation, etc."
              }
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">
                {dict?.fossilRequestForm?.categoryLabel || "Catégorie"}
              </Label>
              <Select
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      dict?.fossilRequestForm?.categoryPlaceholder ||
                      "Sélectionner une catégorie"
                    }
                  />
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
              <Label htmlFor="geologicalPeriod">
                {dict?.fossilRequestForm?.periodLabel || "Période géologique"}
              </Label>
              <Select
                onValueChange={(value) =>
                  handleInputChange("geologicalPeriod", value)
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      dict?.fossilRequestForm?.periodPlaceholder ||
                      "Sélectionner une période"
                    }
                  />
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="countryOfOrigin">
                {dict?.fossilRequestForm?.countryLabel ||
                  "Pays de provenance souhaité"}
              </Label>
              <Input
                id="countryOfOrigin"
                value={formData.countryOfOrigin}
                onChange={(e) =>
                  handleInputChange("countryOfOrigin", e.target.value)
                }
                placeholder={
                  dict?.fossilRequestForm?.countryPlaceholder ||
                  "Ex: France, Maroc, États-Unis..."
                }
              />
            </div>

            <div>
              <Label htmlFor="locality">
                {dict?.fossilRequestForm?.localityLabel ||
                  "Localité spécifique"}
              </Label>
              <Input
                id="locality"
                value={formData.locality}
                onChange={(e) => handleInputChange("locality", e.target.value)}
                placeholder={
                  dict?.fossilRequestForm?.localityPlaceholder ||
                  "Ex: Jorf, Solnhofen, Green River..."
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maxBudget">
              {dict?.fossilRequestForm?.budgetLabel || "Budget maximum (€)"}
            </Label>
            <Input
              id="maxBudget"
              type="number"
              step="0.01"
              min="0"
              value={formData.maxBudget}
              onChange={(e) => handleInputChange("maxBudget", e.target.value)}
              placeholder={
                dict?.fossilRequestForm?.budgetPlaceholder ||
                "Votre budget maximum en euros"
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Bouton de soumission */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {dict?.fossilRequestForm?.sending || "Envoi en cours..."}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {dict?.fossilRequestForm?.submit || "Envoyer la demande"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
