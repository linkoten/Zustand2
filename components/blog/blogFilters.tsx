"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlogCategory } from "@/lib/generated/prisma";
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
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { useBlogStore } from "@/stores/blogStore";

interface BlogFiltersProps {
  lang: "fr" | "en";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

const categories = [
  { value: BlogCategory.PALEONTOLOGIE, labelKey: "categoryPaleontology" },
  { value: BlogCategory.DECOUVERTE, labelKey: "categoryDiscovery" },
  { value: BlogCategory.GUIDE_COLLECTION, labelKey: "categoryGuides" },
  { value: BlogCategory.HISTOIRE_GEOLOGIQUE, labelKey: "categoryHistory" },
  { value: BlogCategory.ACTUALITE, labelKey: "categoryActualite" },
  { value: BlogCategory.TECHNIQUE, labelKey: "categoryTechnique" },
  { value: BlogCategory.EXPOSITION, labelKey: "categoryExposition" },
  { value: BlogCategory.PORTRAIT, labelKey: "categoryPortrait" },
];

export default function BlogFilters({ lang, dict }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetFilters } = useBlogStore();

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

    console.log("🔄 Nouveaux filtres appliqués:", newParams);

    const newUrl = params.toString() ? `/blog?${params.toString()}` : "/blog";
    console.log("🔗 URL générée:", newUrl);

    router.push(newUrl);
  };

  const clearFilters = () => {
    setSearchTerm("");
    // Utiliser le store ET l'URL
    resetFilters();
    router.push("/blog");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔍 Recherche:", searchTerm);
    updateFilters({ search: searchTerm || null });
  };

  const hasActiveFilters = currentCategory || currentTag || currentSearch;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0">
          <Label htmlFor="search" className="text-sm font-medium mb-2 block">
            {dict.blog.blogFilters.searchLabel || "Rechercher"}
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              type="text"
              placeholder={
                dict.blog.blogFilters.searchPlaceholder ||
                "Rechercher dans les articles..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Sélecteur de catégorie */}
        <div className="w-full lg:w-auto min-w-[200px]">
          <Label className="text-sm font-medium mb-2 block">
            {dict.blog.blogFilters.categoryLabel || "Catégorie"}
          </Label>
          <Select
            value={currentCategory || undefined}
            onValueChange={(value) => {
              console.log("📂 Catégorie sélectionnée:", value);
              updateFilters({ category: value === "all" ? null : value });
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  dict.blog.blogFilters.allCategories || "Toutes les catégories"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {dict.blog.blogFilters.allCategories || "Toutes les catégories"}
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {dict[category.labelKey] || category.labelKey}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bouton pour effacer les filtres */}
        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="outline" className="gap-2">
            <X className="h-4 w-4" />
            {dict.blog.blogFilters.clear || "Effacer"}
          </Button>
        )}
      </div>

      {/* Filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          <span className="text-sm text-gray-600">
            {dict.blog.blogFilters.activeFilters || "Filtres actifs :"}
          </span>

          {currentCategory && (
            <Badge variant="secondary" className="gap-1">
              {dict.blog.blogFilters[
                categories.find((c) => c.value === currentCategory)?.labelKey ||
                  ""
              ] || currentCategory}
              <button
                onClick={() => updateFilters({ category: null })}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentTag && (
            <Badge variant="secondary" className="gap-1">
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
            <Badge variant="secondary" className="gap-1">
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
