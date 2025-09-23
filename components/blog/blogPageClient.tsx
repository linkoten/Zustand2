"use client";

import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface BlogPageClientProps {
  searchLabel: string;
  filterLabel: string;
}

export default function BlogPageClient({
  searchLabel,
  filterLabel,
}: BlogPageClientProps) {
  // Fonction pour scroller vers la barre de recherche
  const scrollToSearch = () => {
    // Chercher l'input de recherche dans BlogSection
    const searchInput = document.querySelector(
      "[data-search-input]"
    ) as HTMLInputElement;

    if (searchInput) {
      // Scroller vers l'élément avec animation fluide
      searchInput.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Délai pour laisser le scroll se terminer, puis focus
      setTimeout(() => {
        searchInput.focus();
        // Petit effet visuel
        searchInput.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.3)";
        setTimeout(() => {
          searchInput.style.boxShadow = "";
        }, 2000);
      }, 600);
    }
  };

  // Fonction pour scroller vers les filtres
  const scrollToFilters = () => {
    // Chercher le select de catégorie dans BlogSection
    const filterSelect = document.querySelector(
      "[data-filter-select]"
    ) as HTMLSelectElement;

    if (filterSelect) {
      // Scroller vers l'élément avec animation fluide
      filterSelect.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Délai pour laisser le scroll se terminer, puis focus
      setTimeout(() => {
        filterSelect.focus();
        // Petit effet visuel sur le container parent
        const filterContainer = filterSelect.closest(
          "[data-filter-container]"
        ) as HTMLElement;
        if (filterContainer) {
          filterContainer.style.transform = "scale(1.02)";
          filterContainer.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1)";
          setTimeout(() => {
            filterContainer.style.transform = "";
            filterContainer.style.boxShadow = "";
          }, 2000);
        }
      }, 600);
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={scrollToSearch}
        className="rounded-xl hover:bg-slate-50 border-slate-200 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 group"
      >
        <Search className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
        {searchLabel}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={scrollToFilters}
        className="rounded-xl hover:bg-slate-50 border-slate-200 hover:border-purple-300 hover:text-purple-700 transition-all duration-300 group"
      >
        <Filter className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
        {filterLabel}
      </Button>
    </div>
  );
}
