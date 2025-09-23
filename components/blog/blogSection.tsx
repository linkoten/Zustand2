"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BlogList, { BlogListProps } from "./blogList";
import BlogFilters from "./blogFilters";
import { useBlogStore } from "@/stores/blogStore";
import {
  Search,
  Filter,
  Tag,
  Folder,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BlogSectionProps {
  initialData: BlogListProps;
  lang: "fr" | "en";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export default function BlogSection({
  initialData,
  lang,
  dict,
}: BlogSectionProps) {
  const { blogData, isLoading, filters, setBlogData, loadBlogData } =
    useBlogStore();

  const searchParams = useSearchParams();

  // Initialiser le store avec les données initiales
  useEffect(() => {
    if (initialData && (!blogData.posts.length || blogData.totalPosts === 0)) {
      setBlogData(initialData);
    }
  }, [initialData, setBlogData, blogData]);

  // Synchroniser avec les paramètres URL
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const tag = searchParams.get("tag") || undefined;

    const urlFilters = { page, search, category, tag };

    // Vérifier si les filtres URL sont différents des filtres du store
    const filtersChanged =
      filters.page !== page ||
      filters.search !== search ||
      filters.category !== category ||
      filters.tag !== tag;

    if (filtersChanged) {
      console.log("🔄 Synchronisation filtres URL → Store:", urlFilters);
      loadBlogData(urlFilters);
    }
  }, [searchParams, filters, loadBlogData]);

  // Utiliser les données du store ou les données initiales
  const currentData = blogData.posts.length > 0 ? blogData : initialData;

  // Déterminer les filtres actifs pour l'affichage
  const activeFilters = [
    searchParams.get("search") && {
      type: "search",
      value: searchParams.get("search"),
      icon: Search,
      label: dict.blog?.blogSection?.searchFor || "Recherche pour",
    },
    searchParams.get("category") && {
      type: "category",
      value: searchParams.get("category"),
      icon: Folder,
      label: dict.blog?.blogSection?.categoryIn || "Dans la catégorie",
    },
    searchParams.get("tag") && {
      type: "tag",
      value: searchParams.get("tag"),
      icon: Tag,
      label: dict.blog?.blogSection?.tagWith || "Avec le tag",
    },
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Section filtres premium avec data attributes pour le scroll */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 rounded-3xl" />
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Filter className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {dict.blog?.blogSection?.filtersTitle || "Filtres et recherche"}
            </h2>
          </div>

          {/* ✅ Container avec data attributes pour le ciblage */}
          <div data-filter-container className="transition-all duration-300">
            <BlogFilters lang={lang} dict={dict} />
          </div>
        </div>
      </div>

      {/* Indicateur de chargement premium */}
      {isLoading && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl animate-pulse" />
          <div className="relative flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse" />
                <div className="relative bg-white p-4 rounded-full shadow-lg">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-800">
                  {dict.blog?.blogSection?.loading || "Chargement..."}
                </h3>
                <p className="text-sm text-slate-600">
                  {dict.blog?.blogSection?.loadingText ||
                    "Récupération des derniers articles..."}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section résultats avec design premium */}
      <div
        className={`space-y-6 transition-all duration-500 ${
          isLoading ? "opacity-50 scale-[0.98]" : "opacity-100 scale-100"
        }`}
      >
        {/* Header des résultats */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-gray-50 rounded-2xl" />

          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Informations de résultats */}
              <div className="space-y-4">
                {/* Titre principal */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {dict.blog?.blogSection?.resultsTitle ||
                      "Résultats de recherche"}
                  </h3>
                </div>

                {/* Description des résultats */}
                <div className="text-slate-600">
                  {activeFilters.length > 0 ? (
                    <div className="space-y-3">
                      <p className="flex items-center gap-2">
                        <span className="font-semibold text-xl text-slate-800">
                          {currentData.totalPosts.toLocaleString(
                            lang === "fr" ? "fr-FR" : "en-US"
                          )}
                        </span>
                        <span>
                          {currentData.totalPosts > 1
                            ? dict.blog?.blogSection?.resultsPlural ||
                              "articles trouvés"
                            : dict.blog?.blogSection?.resultsSingle ||
                              "article trouvé"}
                        </span>
                      </p>

                      {/* Filtres actifs */}
                      <div className="flex flex-wrap gap-2">
                        {activeFilters.map((filter, index) =>
                          filter ? (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-white/80 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm"
                            >
                              <filter.icon className="w-3 h-3" />
                              <span className="text-xs font-medium">
                                {filter.label} &quot;{filter.value}&quot;
                              </span>
                            </Badge>
                          ) : null
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-xl text-slate-800">
                        {currentData.totalPosts.toLocaleString(
                          lang === "fr" ? "fr-FR" : "en-US"
                        )}
                      </span>
                      <span>
                        {currentData.totalPosts > 1
                          ? dict.blog?.blogSection?.totalPlural ||
                            "articles au total"
                          : dict.blog?.blogSection?.totalSingle ||
                            "article au total"}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Informations de pagination */}
              <div className="flex items-center gap-4">
                <div className="text-center p-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm">
                  <div className="text-lg font-bold text-slate-800">
                    {currentData.currentPage}
                  </div>
                  <div className="text-xs text-slate-600">
                    {dict.blog?.pagination?.pageLabel || "Page"}
                  </div>
                </div>

                <div className="text-slate-400">
                  {dict.blog?.pagination?.ofLabel || "sur"}
                </div>

                <div className="text-center p-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm">
                  <div className="text-lg font-bold text-slate-800">
                    {currentData.totalPages}
                  </div>
                  <div className="text-xs text-slate-600">
                    {dict.blog?.pagination?.totalLabel || "Total"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des articles avec container premium */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/30 to-transparent rounded-3xl" />
          <div className="relative">
            <BlogList {...currentData} lang={lang} dict={dict} />
          </div>
        </div>

        {/* Message d'état si pas de résultats */}
        {!isLoading && currentData.totalPosts === 0 && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl" />
            <div className="relative text-center py-16 px-8">
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-xl opacity-20" />
                  <div className="relative bg-white p-6 rounded-full shadow-lg mx-auto w-fit">
                    <AlertCircle className="w-12 h-12 text-orange-500" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {dict.blog?.blogSection?.noResults ||
                      "Aucun résultat trouvé"}
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    {dict.blog?.blogSection?.noResultsText ||
                      "Essayez de modifier vos critères de recherche ou explorez d'autres catégories."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
