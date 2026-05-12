import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getDictionary } from "../dictionaries";
import {
  getFossilSpecies,
  getUserCollectionStats,
  getSpeciesFacets,
} from "@/lib/actions/collectionActions";
import { CollectionFilters } from "@/types/collectionType";
import { Category, GeologicalPeriod } from "@/lib/generated/prisma";
import FossilSpeciesCard from "@/components/collection/fossilSpeciesCard";
import CollectionFiltersComponent from "@/components/collection/collectionFilters";
import LocalityProgressCard from "@/components/collection/localityProgressCard";
import CollectionTabs from "@/components/collection/collectionTabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageProps {
  params: Promise<{ lang: "fr" | "en" }>;
  searchParams: Promise<{
    search?: string;
    category?: string;
    localityId?: string;
    country?: string;
    geologicalPeriod?: string;
    geologicalStage?: string;
    status?: string;
    page?: string;
    tab?: string;
  }>;
}

const PAGE_SIZE = 24;

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps) {
  const { lang } = await params;
  const sp = await searchParams;
  const { userId: clerkId } = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dict = await getDictionary(lang) as any;

  const page = Number(sp.page ?? 1);

  const filters: CollectionFilters = {
    search: sp.search,
    category: sp.category as Category | undefined,
    localityId: sp.localityId ? Number(sp.localityId) : undefined,
    country: sp.country,
    geologicalPeriod: sp.geologicalPeriod as GeologicalPeriod | undefined,
    geologicalStage: sp.geologicalStage,
    status: sp.status as CollectionFilters["status"],
    page,
    pageSize: PAGE_SIZE,
  };

  const [{ items, total, totalPages }, localities, enrichedFacets] =
    await Promise.all([
      getFossilSpecies(filters),
      prisma.locality.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      getSpeciesFacets(),
    ]);

  // If logged in, fetch stats for progress panel
  let stats = null;
  if (clerkId) {
    try {
      stats = await getUserCollectionStats();
    } catch {
      // Not in DB yet — ignore
    }
  }

  const buildPageUrl = (p: number) => {
    const query = new URLSearchParams({
      ...(sp.search ? { search: sp.search } : {}),
      ...(sp.category ? { category: sp.category } : {}),
      ...(sp.localityId ? { localityId: sp.localityId } : {}),
      ...(sp.country ? { country: sp.country } : {}),
      ...(sp.geologicalPeriod ? { geologicalPeriod: sp.geologicalPeriod } : {}),
      ...(sp.geologicalStage ? { geologicalStage: sp.geologicalStage } : {}),
      ...(sp.status ? { status: sp.status } : {}),
      page: String(p),
    });
    return `/${lang}/collection?${query.toString()}`;
  };

  return (
    <div className="min-h-screen bg-silex">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-parchemin font-playfair">
            {dict.collection?.title ?? "Encyclopédie des Faunes Fossiles"}
          </h1>
          <p className="text-parchemin/60 mt-2">
            {enrichedFacets.length}{" "}
            {enrichedFacets.length !== 1
              ? (dict.collection?.speciesPlural ?? "espèces")
              : (dict.collection?.species ?? "espèce")}{" "}
            {dict.collection?.subtitle ?? "référencées dans nos gisements"}
          </p>
        </div>

        <CollectionTabs
          activeTab={sp.tab ?? "catalogue"}
          enrichedFacets={enrichedFacets}
          lang={lang}
        >
          {/* ── Catalogue tab (server-rendered) ───────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar: filters + progress */}
            <aside className="w-full lg:w-72 shrink-0 space-y-6">
              <CollectionFiltersComponent
                localities={localities}
                facets={enrichedFacets}
                isLoggedIn={!!clerkId}
              />

              {/* Progress panel */}
              {stats && (stats.totalOwned > 0 || stats.totalWishlist > 0) && (
                <div className="space-y-3">
                  <h2 className="text-parchemin font-semibold text-sm uppercase tracking-wider">
                    {dict.collection?.myProgress ?? "Ma progression"}
                  </h2>
                  <div className="flex gap-4 text-sm">
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg px-3 py-2 flex-1">
                      <p className="text-green-300 font-bold text-xl">
                        {stats.totalOwned}
                      </p>
                      <p className="text-parchemin/50 text-xs">{dict.collection?.owned ?? "possédés"}</p>
                    </div>
                    <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg px-3 py-2 flex-1">
                      <p className="text-amber-300 font-bold text-xl">
                        {stats.totalWishlist}
                      </p>
                      <p className="text-parchemin/50 text-xs">{dict.collection?.wishlist ?? "liste de souhaits"}</p>
                    </div>
                  </div>

                  {stats.byLocality.filter(
                    (l) => l.ownedCount > 0 || l.wishlistCount > 0,
                  ).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-parchemin/50 text-xs uppercase tracking-wider">
                        {dict.collection?.byLocality ?? "Par gisement"}
                      </p>
                      {stats.byLocality
                        .filter((l) => l.ownedCount > 0 || l.wishlistCount > 0)
                        .map((l) => (
                          <LocalityProgressCard
                            key={l.localityId}
                            locality={l}
                          />
                        ))}
                    </div>
                  )}
                </div>
              )}

              {!clerkId && (
                <div className="bg-terracotta/10 border border-terracotta/30 rounded-xl p-4 text-center space-y-2">
                  <p className="text-parchemin/70 text-sm">
                    {dict.collection?.loginPrompt ?? "Connectez-vous pour suivre votre collection"}
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="bg-terracotta hover:bg-terracotta/90 text-primary-foreground"
                  >
                    <Link href={`/${lang}/sign-in`}>{dict.collection?.login ?? "Se connecter"}</Link>
                  </Button>
                </div>
              )}
            </aside>

            {/* Main grid */}
            <main className="flex-1 space-y-6">
              {items.length === 0 ? (
                <div className="text-center py-20 text-parchemin/40">
                  <p className="text-5xl mb-4">🦴</p>
                  <p>{dict.collection?.noResults ?? "Aucune espèce ne correspond à vos filtres"}</p>
                </div>
              ) : (
                <>
                  <p className="text-parchemin/50 text-sm">
                    {total}{" "}{total !== 1 ? (dict.collection?.resultsPlural ?? "résultats") : (dict.collection?.results ?? "résultat")}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                    {items.map((s) => (
                      <FossilSpeciesCard
                        key={s.id}
                        species={s}
                        isLoggedIn={!!clerkId}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      {page > 1 && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-silex/30 text-parchemin/70 hover:text-parchemin"
                        >
                          <Link href={buildPageUrl(page - 1)}>
                            <ChevronLeft className="w-4 h-4 mr-1" /> {dict.collection?.previous ?? "Précédent"}
                          </Link>
                        </Button>
                      )}
                      <span className="text-parchemin/50 text-sm">
                        {page} / {totalPages}
                      </span>
                      {page < totalPages && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-silex/30 text-parchemin/70 hover:text-parchemin"
                        >
                          <Link href={buildPageUrl(page + 1)}>
                            {dict.collection?.next ?? "Suivant"} <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </CollectionTabs>
      </div>
    </div>
  );
}
