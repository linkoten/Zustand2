"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
import { FossilCard } from "./fossil-card";
import { SerializedProduct } from "@/types/type";
import { FilterOptions } from "@/types/productType";
import FossilesFilters from "./fossil-filters";
import { Badge } from "@/components/ui/badge";

interface FossilesClientProps {
  fossilsData: {
    fossils: SerializedProduct[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
  filterOptions: FilterOptions;
  lang?: "en" | "fr";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: any;
}

// Composant animé pour chaque fossil card
function AnimatedFossilCard({
  fossil,
  index,
  dict,
  lang,
}: {
  fossil: SerializedProduct;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
  lang: "en" | "fr";
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Délai réduit de 100ms à 50ms pour un effet plus rapide
          setTimeout(() => {
            setIsVisible(true);
          }, index * 50);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`transform transition-all duration-500 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-6 opacity-0 scale-95"
      }`}
      style={{ transitionDelay: `${index * 30}ms` }}
    >
      <FossilCard fossil={fossil} dict={dict} lang={lang} />
    </div>
  );
}

export default function FossilesClient({
  fossilsData,
  filterOptions,
  lang = "fr",
  dict,
}: FossilesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fossils, totalCount, totalPages, currentPage } = fossilsData;

  // Compter les filtres actifs pour le badge (logique simplifiée)
  const activeFiltersCount = Array.from(searchParams.entries()).filter(
    ([key, value]) => key !== "page" && value && value !== "all"
  ).length;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/${lang}/fossiles?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(`/${lang}/fossiles`);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={
            currentPage === i
              ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 border-0 shadow-md transform hover:scale-105 transition-all duration-200"
              : "border-slate-300 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200"
          }
        >
          {i}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="flex gap-8 min-h-screen py-6">
      {/* Sidebar de filtres fixe */}
      <div className="w-80 flex-shrink-0">
        <div className="sticky top-6 pt-8">
          <FossilesFilters
            filterOptions={filterOptions}
            lang={lang}
            dict={dict}
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 space-y-6">
        {/* En-tête avec statistiques amélioré */}
        <div className="bg-gradient-to-r from-white via-slate-50 to-white rounded-xl border-0 p-8 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-amber-700 bg-clip-text text-transparent mb-2">
                {dict?.fossils?.catalogTitle || "Catalogue de fossiles"}
              </h2>
              <p className="text-slate-600 text-lg">
                {totalCount > 0 ? (
                  <>
                    {dict?.fossils?.showingResults || "Affichage de"}{" "}
                    <span className="font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {(currentPage - 1) * 20 + 1}-
                      {Math.min(currentPage * 20, totalCount)}
                    </span>{" "}
                    {dict?.fossils?.of || "sur"}{" "}
                    <span className="font-bold text-slate-800">
                      {totalCount}
                    </span>{" "}
                    {dict?.fossils?.results || "résultats"}
                  </>
                ) : (
                  dict?.fossils?.noResults || "Aucun résultat trouvé"
                )}
              </p>
            </div>

            {activeFiltersCount > 0 && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-base px-4 py-2 animate-pulse">
                <Filter className="w-4 h-4 mr-2" />
                {activeFiltersCount}{" "}
                {dict?.fossils?.activeFilters || "filtres actifs"}
              </Badge>
            )}
          </div>
        </div>

        {/* Grille des fossiles avec animations */}
        {fossils.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {fossils.map((fossil, index) => (
                <AnimatedFossilCard
                  key={fossil.id}
                  fossil={fossil}
                  index={index}
                  dict={dict}
                  lang={lang}
                />
              ))}
            </div>

            {/* Pagination améliorée */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-white via-slate-50 to-white rounded-xl border-0 p-8 shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="text-slate-600 font-medium">
                    {dict?.fossils?.page || "Page"}{" "}
                    <span className="font-bold text-amber-600">
                      {currentPage}
                    </span>{" "}
                    {dict?.fossils?.of || "sur"}{" "}
                    <span className="font-bold text-slate-800">
                      {totalPages}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border-slate-300 hover:border-amber-300 hover:bg-amber-50 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      {dict?.fossils?.previous || "Précédent"}
                    </Button>

                    <div className="flex gap-2">
                      {renderPaginationButtons()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border-slate-300 hover:border-amber-300 hover:bg-amber-50 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
                    >
                      {dict?.fossils?.next || "Suivant"}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* État vide amélioré */
          <div className="bg-gradient-to-br from-white via-slate-50 to-amber-50/30 rounded-xl border-0 p-16 shadow-xl backdrop-blur-sm text-center">
            <div className="max-w-md mx-auto">
              <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="w-10 h-10 text-slate-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-ping"></div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                {dict?.fossils?.empty || "Aucun fossile trouvé"}
              </h3>
              <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                {dict?.fossils?.emptyDescription ||
                  "Aucun fossile ne correspond à vos critères de recherche."}
              </p>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="border-slate-300 hover:border-amber-400 hover:bg-amber-50 transform hover:scale-105 transition-all duration-200 shadow-md"
                >
                  <X className="w-4 h-4 mr-2" />
                  {dict?.fossils?.clearFilters || "Effacer les filtres"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
