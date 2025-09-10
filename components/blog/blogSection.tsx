"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BlogList, { BlogListProps } from "./blogList";
import BlogFilters from "./blogFilters";
import { useBlogStore } from "@/stores/blogStore";

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

  return (
    <div className="space-y-6">
      {/* Filtres de recherche */}
      <BlogFilters lang={lang} dict={dict} />
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>{dict.blog.blogSection.loading}</span>
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
                {currentData.totalPosts > 1
                  ? dict.blog.blogSection.resultsPlural
                  : dict.blog.blogSection.results}{" "}
                {currentData.totalPosts > 1
                  ? dict.blog.blogSection.foundPlural
                  : dict.blog.blogSection.found}
                {searchParams.get("search") && (
                  <span>
                    {" "}
                    {dict.blog.blogSection.for} &quot;
                    {searchParams.get("search")}
                    &quot;
                  </span>
                )}
                {searchParams.get("category") && (
                  <span>
                    {" "}
                    {dict.blog.blogSection.in} {searchParams.get("category")}
                  </span>
                )}
                {searchParams.get("tag") && (
                  <span>
                    {" "}
                    {dict.blog.blogSection.with} {dict.blog.blogSection.tag}
                    {searchParams.get("tag")}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="font-medium">{currentData.totalPosts}</span>{" "}
                {dict.blog.blogSection.total}
              </>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {dict.blog.pageLabel || "Page"} {currentData.currentPage}{" "}
            {dict.blog.ofLabel || "sur"} {currentData.totalPages}
          </div>
        </div>
        {/* Liste des articles */}
        <BlogList {...currentData} lang={lang} dict={dict} />{" "}
      </div>
    </div>
  );
}
