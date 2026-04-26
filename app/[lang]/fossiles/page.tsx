import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import FossilesClient from "@/components/fossils/fossilesClient";
import { getFilterOptions, getFossils, getFossilCatalogIndex } from "@/lib/actions/productActions";
import { SearchParams } from "@/types/productType";
import { getUserData, getOrSyncUser } from "@/lib/actions/dashboardActions";
import UserProvider from "@/components/provider/userProvider";
import { redirect } from "next/navigation";
import { getDictionary } from "../dictionaries";

export default async function FossilesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
  searchParams: Promise<SearchParams & { page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { lang } = await params;

  const dict = await getDictionary(lang);

  // ✅ Récupérer userId AVANT l'appel à getFossils
  const { userId } = await auth();
  if (!userId) {
    redirect(`/${lang}/sign-in`);
  }
  const user = await getOrSyncUser(userId!);
  if (!user) {
    redirect(`/${lang}/sign-in`);
  }

  // Pagination
  const currentPage = parseInt(resolvedSearchParams.page || "1", 10);
  const limit = 20;

  // ✅ Passer userId à getFossils pour inclure les infos favoris avec pagination
  const [fossilsData, filterOptionsRaw, catalogData] = await Promise.all([
    getFossils(resolvedSearchParams, userId, currentPage, limit),
    getFilterOptions(),
    getFossilCatalogIndex(),
  ]);
  const filterOptions = {
    ...filterOptionsRaw,
    localities: filterOptionsRaw.localityObjects?.map((loc) => loc.name) ?? [],
    localityObjects: filterOptionsRaw.localityObjects,
  };

  return (
    <UserProvider user={user}>
      <div className="min-h-screen relative bg-silex">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-terracotta/5 to-transparent" />
          <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-900/10 blur-[100px] animate-float" />
          <div
            className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-terracotta/10 blur-[120px] animate-float"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10 animate-fadeInUp">
          {/* Header moderne */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-parchemin mb-3 bg-gradient-to-r from-parchemin via-terracotta to-parchemin bg-clip-text text-transparent inline-block animate-shimmer-gold">
                  {(dict as { fossils?: { title?: string } })?.fossils?.title ||
                    "La Galerie des Temps Anciens"}
                </h1>
                <p className="text-parchemin/70 max-w-2xl text-lg">
                  {(dict as { fossils?: { description?: string } })?.fossils
                    ?.description ||
                    "Parcourez notre collection d'artefacts paléontologiques, soigneusement préservés pour traverser les âges."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start lg:items-center">
                <Button
                  asChild
                  className="bg-transparent border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-parchemin font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Link href={`/${lang}/fossiles/request`}>
                    <Search className="mr-2 h-4 w-4" />
                    {dict.fossilRequest.title}
                  </Link>
                </Button>

                {user && user.role === "ADMIN" && (
                  <Button
                    asChild
                    className="bg-transparent border-2 border-cyan-700 text-cyan-500 hover:bg-cyan-900/30 hover:text-cyan-300 font-bold shadow-lg shadow-cyan-900/20 transform hover:scale-105 transition-all duration-300"
                  >
                    <Link href={`/${lang}/fossiles/create`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un produit
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-terracotta/0 via-terracotta/30 to-terracotta/0 my-4" />
          </div>

          <FossilesClient
            fossilsData={fossilsData}
            filterOptions={filterOptions}
            lang={lang}
            dict={dict}
            userId={userId}
            catalogData={catalogData}
          />
        </div>
      </div>
    </UserProvider>
  );
}
