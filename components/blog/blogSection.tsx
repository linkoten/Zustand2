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
  categories?: { category: string; [key: string]: unknown }[];
  lang: "fr" | "en";
  dict: Record<string, Record<string, Record<string, string> | string | undefined> | undefined>;
}

export default function BlogSection({
  initialData,
  categories,
  lang,
  dict,
}: BlogSectionProps) {
  const { blogData, isLoading, filters, setBlogData, loadBlogData } =
    useBlogStore();

  const searchParams = useSearchParams();
  const filtersStore = useBlogStore((state) => state.filters);

  // Initialisation à partir des données serveur
  useEffect(() => {
    if (initialData) {
      const page = parseInt(searchParams.get("page") || "1");
      const search = searchParams.get("search") || undefined;
      const category = searchParams.get("category") || undefined;
      const tag = searchParams.get("tag") || undefined;

      const urlFilters = { page, search, category, tag };
      useBlogStore.setState({ filters: urlFilters, blogData: initialData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Utiliser les données du store ou les données initiales
  const currentData = blogData.posts.length > 0 ? blogData : initialData;

  // Déterminer les filtres actifs pour l'affichage
  const activeFilters = [
    filtersStore.search && {
      type: "search",
      value: filtersStore.search,
      icon: Search,
      label: (dict.blog?.blogSection as Record<string, string>)?.searchFor || "Recherche pour",
    },
    filtersStore.category && {
      type: "category",
      value: filtersStore.category,
      icon: Folder,
      label: (dict.blog?.blogSection as Record<string, string>)?.categoryIn || "Dans la catégorie",
    },
    filtersStore.tag && {
      type: "tag",
      value: filtersStore.tag,
      icon: Tag,
      label: (dict.blog?.blogSection as Record<string, string>)?.tagWith || "Avec le tag",
    },
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Navigation des catégories */}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            useBlogStore
              .getState()
              .updateFilters({ category: undefined, page: 1 });
            window.history.pushState(null, "", `/${lang}/blog`);
          }}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
            !filtersStore.category
              ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md transform scale-105"
              : "bg-white text-slate-600 hover:bg-orange-50 border border-slate-200"
          }`}
        >
          {(dict.blog?.blogFilters as Record<string, string>)?.allCategories || "Tout afficher"}
        </button>
        {categories?.map((catItem: { category: string; [key: string]: unknown }) => {
          const cat = catItem.category;
          const labelKey: string =
            {
              PALEONTOLOGIE: "categoryPaleontology",
              DECOUVERTE: "categoryDiscovery",
              GUIDE_COLLECTION: "categoryGuides",
              HISTOIRE_GEOLOGIQUE: "categoryHistory",
              ACTUALITE: "categoryActualite",
              TECHNIQUE: "categoryTechnique",
              EXPOSITION: "categoryExposition",
              PORTRAIT: "categoryPortrait",
            }[cat as string] || "";

          const categoryLabel =
            (dict.blog?.blogFilters as Record<string, string>)?.[labelKey] ||
            (cat as string)
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase());

          return (
            <button
              key={cat as string}
              onClick={() => {
                useBlogStore
                  .getState()
                  .updateFilters({ category: cat, page: 1 });
                window.history.pushState(
                  null,
                  "",
                  `/${lang}/blog?category=${cat}`,
                );
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                filtersStore.category === cat
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md transform scale-105"
                  : "bg-white text-slate-600 hover:bg-orange-50 border border-slate-200"
              }`}
            >
              {categoryLabel}
            </button>
          );
        })}
      </div>

      {/* Section filtres premium avec data attributes pour le scroll */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 rounded-3xl" />
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Filter className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {(dict.blog?.blogSection as Record<string, string>)?.filtersTitle || "Filtres et recherche"}
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
                  {(dict.blog?.blogSection as Record<string, string>)?.loading || "Chargement..."}
                </h3>
                <p className="text-sm text-slate-600">
                  {(dict.blog?.blogSection as Record<string, string>)?.loadingText ||
                    "Récupération des derniers articles..."}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
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
                    {(dict.blog?.blogSection as Record<string, string>)?.noResults ||
                      "Aucun résultat trouvé"}
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    {(dict.blog?.blogSection as Record<string, string>)?.noResultsText ||
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
