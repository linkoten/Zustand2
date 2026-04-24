"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { List, Compass } from "lucide-react";
import { EnrichedSpeciesFacet } from "@/types/collectionType";
import CollectionBrowser from "./collectionBrowser";

interface CollectionTabsProps {
  /** Active tab value from URL — passed by server so initial render matches without flicker */
  activeTab: string;
  enrichedFacets: EnrichedSpeciesFacet[];
  lang: string;
  /** Catalogue tab content (server-rendered) */
  children: React.ReactNode;
}

export default function CollectionTabs({
  activeTab,
  enrichedFacets,
  lang,
  children,
}: CollectionTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setTab(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "catalogue") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const tabs = [
    { value: "catalogue", label: "Catalogue", icon: List },
    { value: "explorer", label: "Explorer par gisement", icon: Compass },
  ];

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-silex/30 border border-silex/20 rounded-xl p-1 w-fit">
        {tabs.map(({ value, label, icon: Icon }) => {
          const active =
            activeTab === value || (value === "catalogue" && !activeTab);
          return (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-terracotta text-primary-foreground shadow-sm"
                  : "text-parchemin/60 hover:text-parchemin hover:bg-silex/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "explorer" ? (
        <CollectionBrowser facets={enrichedFacets} lang={lang} />
      ) : (
        children
      )}
    </div>
  );
}
