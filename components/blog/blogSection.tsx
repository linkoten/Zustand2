"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BlogList from "./blogList";
import BlogFilters from "./blogFilters";
import { BlogListProps, BlogSectionProps } from "@/types/blogType";
import { useBlogStore } from "@/stores/blogStore";

export default function BlogSection({ initialData }: BlogSectionProps) {
  const {
    blogData,
    isLoading,
    filters,
    setBlogData,
    updateFilters,
    loadBlogData,
  } = useBlogStore();

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

  return (
    <div className="space-y-6">
      {/* Filtres de recherche */}
      <BlogFilters />

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Chargement des articles...</span>
          </div>
        </div>
      )}

      {/* Résultats et liste des articles */}
      <div
        className={`space-y-6 transition-opacity duration-200 ${isLoading ? "opacity-50" : "opacity-100"}`}
      >
        {/* Indicateur de résultats */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {searchParams.get("search") ||
            searchParams.get("category") ||
            searchParams.get("tag") ? (
              <>
                <span className="font-medium">{currentData.totalPosts}</span>{" "}
                résultat
                {currentData.totalPosts > 1 ? "s" : ""} trouvé
                {currentData.totalPosts > 1 ? "s" : ""}
                {searchParams.get("search") && (
                  <span> pour &quot;{searchParams.get("search")}&quot;</span>
                )}
                {searchParams.get("category") && (
                  <span> dans {searchParams.get("category")}</span>
                )}
                {searchParams.get("tag") && (
                  <span> avec #{searchParams.get("tag")}</span>
                )}
              </>
            ) : (
              <>
                <span className="font-medium">{currentData.totalPosts}</span>{" "}
                article
                {currentData.totalPosts > 1 ? "s" : ""} au total
              </>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Page {currentData.currentPage} sur {currentData.totalPages}
          </div>
        </div>

        {/* Liste des articles */}
        <BlogList {...currentData} />
      </div>
    </div>
  );
}
