"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { BlogCategory } from "@/lib/generated/prisma";

const categories = [
  { value: BlogCategory.PALEONTOLOGIE, label: "Paléontologie" },
  { value: BlogCategory.DECOUVERTE, label: "Découverte" },
  { value: BlogCategory.GUIDE_COLLECTION, label: "Guide Collection" },
  { value: BlogCategory.HISTOIRE_GEOLOGIQUE, label: "Histoire Géologique" },
  { value: BlogCategory.ACTUALITE, label: "Actualité" },
  { value: BlogCategory.TECHNIQUE, label: "Technique" },
  { value: BlogCategory.EXPOSITION, label: "Exposition" },
  { value: BlogCategory.PORTRAIT, label: "Portrait" },
];

export default function BlogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  const currentCategory = searchParams.get("category");
  const currentTag = searchParams.get("tag");
  const currentSearch = searchParams.get("search");

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Remettre à la page 1 lors d'un nouveau filtre
    params.delete("page");

    router.push(`/blog?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    router.push("/blog");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm || null });
  };

  const hasActiveFilters = currentCategory || currentTag || currentSearch;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
        {/* Recherche */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Rechercher
          </label>
          <div className="relative">
            <Input
              id="search"
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Catégorie */}
        <div className="w-full lg:w-auto min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie
          </label>
          <Select
            value={currentCategory || undefined} // ✅ Utiliser undefined au lieu de ""
            onValueChange={(value) =>
              updateFilters({ category: value || null })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              {/* ✅ Supprimer le SelectItem avec valeur vide */}
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bouton reset */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Effacer
          </Button>
        )}
      </div>

      {/* Filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          <span className="text-sm text-gray-600">Filtres actifs :</span>

          {currentCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {categories.find((c) => c.value === currentCategory)?.label}
              <button
                onClick={() => updateFilters({ category: null })}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentTag && (
            <Badge variant="secondary" className="flex items-center gap-1">
              #{currentTag}
              <button
                onClick={() => updateFilters({ tag: null })}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentSearch && (
            <Badge variant="secondary" className="flex items-center gap-1">
              &quot;{currentSearch}&quot;
              <button
                onClick={() => {
                  setSearchTerm("");
                  updateFilters({ search: null });
                }}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
