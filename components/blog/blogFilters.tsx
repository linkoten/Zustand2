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
import {
  Search,
  X,
  Filter,
  Sparkles,
  Tag,
  Folder,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
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

    const newUrl = params.toString()
      ? `/${lang}/blog?${params.toString()}`
      : `/${lang}/blog`;
    console.log("🔗 URL générée:", newUrl);

    router.push(newUrl);
  };

  const clearFilters = () => {
    setSearchTerm("");
    resetFilters();
    router.push(`/${lang}/blog`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔍 Recherche:", searchTerm);
    updateFilters({ search: searchTerm || null });
  };

  const hasActiveFilters = currentCategory || currentTag || currentSearch;

  return (
    <div className="relative">
      {/* Background décoratif */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 rounded-3xl" />
      <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-purple-500/10 rounded-full blur-2xl" />

      <div className="relative p-6">
        {/* Header premium */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur-lg opacity-30" />
            <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {dict.blog?.blogFilters?.filtersTitle || "Filtres avancés"}
            </h3>
            <p className="text-sm text-slate-600">
              {dict.blog?.blogFilters?.filtersSubtitle ||
                "Affinez votre recherche"}
            </p>
          </div>
        </div>

        {/* Conteneur des filtres */}
        <div className="space-y-6">
          {/* Ligne principale des filtres */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            {/* Barre de recherche premium */}
            <form onSubmit={handleSearch} className="flex-1 min-w-0">
              <Label
                htmlFor="search"
                className="text-sm font-semibold mb-3 block flex items-center gap-2 text-slate-700"
              >
                <Search className="w-4 h-4 text-indigo-600" />
                {dict.blog?.blogFilters?.searchLabel || "Rechercher"}
              </Label>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 z-10" />
                  <Input
                    id="search"
                    type="text"
                    placeholder={
                      dict.blog?.blogFilters?.searchPlaceholder ||
                      "Rechercher dans les articles..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-20 h-12 bg-white/80 backdrop-blur-sm border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>

            {/* Sélecteur de catégorie premium */}
            <div className="w-full lg:w-auto min-w-[240px]">
              <Label className="text-sm font-semibold mb-3 block flex items-center gap-2 text-slate-700">
                <Folder className="w-4 h-4 text-purple-600" />
                {dict.blog?.blogFilters?.categoryLabel || "Catégorie"}
              </Label>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                <Select
                  value={currentCategory || undefined}
                  onValueChange={(value) => {
                    console.log("📂 Catégorie sélectionnée:", value);
                    updateFilters({ category: value === "all" ? null : value });
                  }}
                >
                  <SelectTrigger className="relative h-12 bg-white/80 backdrop-blur-sm border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
                    <SelectValue
                      placeholder={
                        dict.blog?.blogFilters?.allCategories ||
                        "Toutes les catégories"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                    <SelectItem value="all" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-slate-500" />
                        {dict.blog?.blogFilters?.allCategories ||
                          "Toutes les catégories"}
                      </div>
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        className="rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" />
                          {dict.blog?.blogFilters?.[category.labelKey] ||
                            category.value}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bouton pour effacer les filtres */}
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="h-12 gap-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <X className="h-4 w-4" />
                {dict.blog?.blogFilters?.clear || "Effacer"}
              </Button>
            )}
          </div>

          {/* Section des filtres actifs */}
          {hasActiveFilters && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-2xl" />
              <div className="relative p-4 rounded-2xl border border-amber-200/50">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                      <Filter className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {dict.blog?.blogFilters?.activeFilters ||
                        "Filtres actifs :"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentCategory && (
                      <Badge
                        variant="secondary"
                        className="bg-white/90 backdrop-blur-sm border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl gap-2 shadow-sm hover:shadow-md transition-all duration-300 group"
                      >
                        <Folder className="w-3 h-3" />
                        <span className="font-medium">
                          {dict.blog?.blogFilters?.[
                            categories.find((c) => c.value === currentCategory)
                              ?.labelKey || ""
                          ] || currentCategory}
                        </span>
                        <button
                          onClick={() => updateFilters({ category: null })}
                          className="ml-1 hover:bg-purple-200 rounded-full p-1 transition-colors duration-200 group-hover:scale-110"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}

                    {currentTag && (
                      <Badge
                        variant="secondary"
                        className="bg-white/90 backdrop-blur-sm border border-green-200 text-green-800 px-3 py-1.5 rounded-xl gap-2 shadow-sm hover:shadow-md transition-all duration-300 group"
                      >
                        <Tag className="w-3 h-3" />
                        <span className="font-medium">#{currentTag}</span>
                        <button
                          onClick={() => updateFilters({ tag: null })}
                          className="ml-1 hover:bg-green-200 rounded-full p-1 transition-colors duration-200 group-hover:scale-110"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}

                    {currentSearch && (
                      <Badge
                        variant="secondary"
                        className="bg-white/90 backdrop-blur-sm border border-blue-200 text-blue-800 px-3 py-1.5 rounded-xl gap-2 shadow-sm hover:shadow-md transition-all duration-300 group"
                      >
                        <Search className="w-3 h-3" />
                        <span className="font-medium">
                          &quot;{currentSearch}&quot;
                        </span>
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            updateFilters({ search: null });
                          }}
                          className="ml-1 hover:bg-blue-200 rounded-full p-1 transition-colors duration-200 group-hover:scale-110"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>

                  {/* Indicateur de performance */}
                  <div className="ml-auto flex items-center gap-2 text-xs text-amber-600">
                    <Zap className="w-3 h-3" />
                    <span className="font-medium">
                      {dict.blog?.blogFilters?.activeLabel || "Actifs"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
