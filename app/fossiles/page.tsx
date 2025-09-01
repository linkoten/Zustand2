import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import FossilesClient from "@/components/fossils/fossilesClient";
import { getFilterOptions, getFossils } from "@/lib/actions/productActions";
import { SearchParams } from "@/types/productType";
import { getUserData } from "@/lib/actions/dashboardActions";
import { redirect } from "next/navigation";
import UserProvider from "@/components/provider/userProvider";

export default async function FossilesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  // ✅ Récupérer userId AVANT l'appel à getFossils
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const user = await getUserData(userId);

  if (!user) {
    redirect("/sign-in");
  }

  // ✅ Passer userId à getFossils pour inclure les infos favoris
  const fossils = await getFossils(resolvedSearchParams, userId);
  const filterOptionsRaw = await getFilterOptions();
  const filterOptions = {
    ...filterOptionsRaw,
    localities: filterOptionsRaw.localities.map((loc) => loc.name), // ou `.map(loc => String(loc.id))` si tu veux filtrer par id
  };
  return (
    <UserProvider user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Nos Fossiles</h1>
              <p className="text-muted-foreground">
                Découvrez notre collection de fossiles authentiques
              </p>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/fossiles/request">
                  <Search className="mr-2 h-4 w-4" />
                  Demande de recherche
                </Link>
              </Button>

              {user.role === "ADMIN" && (
                <Button asChild>
                  <Link href="/fossiles/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un produit
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <FossilesClient fossils={fossils} filterOptions={filterOptions} />
      </div>
    </UserProvider>
  );
}
