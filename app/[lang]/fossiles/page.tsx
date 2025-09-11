import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import FossilesClient from "@/components/fossils/fossilesClient";
import { getFilterOptions, getFossils } from "@/lib/actions/productActions";
import { SearchParams } from "@/types/productType";
import { getUserData } from "@/lib/actions/dashboardActions";
import UserProvider from "@/components/provider/userProvider";
import { redirect } from "next/navigation";
import { getDictionary } from "../dictionaries";

export default async function FossilesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const { lang } = await params;

  const dict = await getDictionary(lang);

  // ✅ Récupérer userId AVANT l'appel à getFossils
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const user = await getUserData(userId!);
  if (!user) {
    redirect("/sign-in");
  }

  // ✅ Passer userId à getFossils pour inclure les infos favoris
  const fossils = await getFossils(resolvedSearchParams, userId);
  const filterOptionsRaw = await getFilterOptions();
  const filterOptions = {
    ...filterOptionsRaw,
    localities: filterOptionsRaw.localities.map((loc) => loc.name),
  };

  return (
    <UserProvider user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{dict.home.shopTitle}</h1>
              <p className="text-muted-foreground">{dict.home.shopDesc}</p>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/${lang}/fossiles/request`}>
                  <Search className="mr-2 h-4 w-4" />
                  {dict.fossilRequest.title}
                </Link>
              </Button>

              {user && user.role === "ADMIN" && (
                <Button asChild>
                  <Link href={`/${lang}/fossiles/create`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un produit
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <FossilesClient
          fossils={fossils}
          filterOptions={filterOptions}
          lang={lang}
          dict={dict}
        />
      </div>
    </UserProvider>
  );
}
